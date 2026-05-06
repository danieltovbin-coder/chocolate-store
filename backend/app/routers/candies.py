from __future__ import annotations

import json
import logging
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import Select, String, asc, desc, literal, select
from sqlalchemy.dialects.postgresql import array
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.db import get_db
from app.cache import cache_get, cache_set
from app.models.candy import Candy
from app.schemas.candy import CandyOut

log = logging.getLogger(__name__)

router = APIRouter()


def _normalize_sort_key(sort: str | None) -> str:
    s = sort or "name"
    if s in ("price_asc", "price_desc", "name"):
        return s
    return "name"


def _list_cache_key(tag: list[str] | None, sort: str | None) -> str:
    t = tag or []
    tkey = ",".join(sorted(x.strip() for x in t if x and x.strip()))
    return f"candies:list:{tkey}:{_normalize_sort_key(sort)}"


def _detail_cache_key(cid: UUID) -> str:
    return f"candies:id:{cid}"


@router.get("", response_model=list[CandyOut])
async def list_candies(
    tag: list[str] = Query(
        default_factory=list,
        description="Repeat `tag=`; OR semantics: candy must include at least one listed tag.",
    ),
    sort: str | None = Query(
        "name",
        description="name | price_asc | price_desc",
    ),
    session: AsyncSession = Depends(get_db),
) -> list[CandyOut]:
    key = _list_cache_key(tag, sort)
    raw = await cache_get(key)
    if raw:
        try:
            data = json.loads(raw)
            return [CandyOut.model_validate(x) for x in data]
        except (json.JSONDecodeError, ValueError) as e:
            log.debug("cache miss parse %s: %s", key, e)

    cleaned = [t.strip() for t in (tag or []) if t and t.strip()]
    stmt: Select[tuple[Candy]] = select(Candy)
    if cleaned:
        literals = [literal(s, type_=String(64)) for s in cleaned]
        any_of = array(literals)
        stmt = stmt.where(Candy.tags.op("&&")(any_of))
    s = _normalize_sort_key(sort)
    if s == "price_asc":
        stmt = stmt.order_by(asc(Candy.price_cents), asc(Candy.name))
    elif s == "price_desc":
        stmt = stmt.order_by(desc(Candy.price_cents), asc(Candy.name))
    else:
        stmt = stmt.order_by(asc(Candy.name))

    result = await session.execute(stmt)
    rows = result.scalars().all()
    out = [CandyOut.model_validate(r) for r in rows]
    await cache_set(
        key,
        json.dumps([m.model_dump(mode="json") for m in out]),
        settings.cache_ttl_seconds,
    )
    return out


@router.get("/{candy_id}", response_model=CandyOut)
async def get_candy(
    candy_id: UUID,
    session: AsyncSession = Depends(get_db),
) -> CandyOut:
    key = _detail_cache_key(candy_id)
    raw = await cache_get(key)
    if raw:
        try:
            return CandyOut.model_validate(json.loads(raw))
        except (json.JSONDecodeError, ValueError) as e:
            log.debug("detail cache miss %s: %s", key, e)

    result = await session.execute(select(Candy).where(Candy.id == candy_id))
    row = result.scalar_one_or_none()
    if row is None:
        raise HTTPException(status_code=404, detail="Candy not found")
    out = CandyOut.model_validate(row)
    await cache_set(
        key, json.dumps(out.model_dump(mode="json")), settings.cache_ttl_seconds
    )
    return out
