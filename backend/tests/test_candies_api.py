from __future__ import annotations

import uuid

from starlette.testclient import TestClient


def test_list_candies_returns_items(api_client: TestClient) -> None:
    r = api_client.get("/api/candies")
    assert r.status_code == 200
    items = r.json()
    assert isinstance(items, list)
    assert len(items) >= 1
    first = items[0]
    assert "id" in first and "name" in first and "price_cents" in first


def test_list_candies_tag_filter_or_semantics(api_client: TestClient) -> None:
    r = api_client.get("/api/candies", params=[("tag", "gummy"), ("tag", "chewy")])
    assert r.status_code == 200
    items = r.json()
    assert isinstance(items, list)
    for row in items:
        tags = {t.lower() for t in row.get("tags", [])}
        assert "gummy" in tags or "chewy" in tags


def test_list_candies_sort_price_asc(api_client: TestClient) -> None:
    r = api_client.get("/api/candies", params={"sort": "price_asc"})
    assert r.status_code == 200
    items = r.json()
    prices = [row["price_cents"] for row in items]
    assert prices == sorted(prices)


def test_get_candy_detail_and_404(api_client: TestClient) -> None:
    listed = api_client.get("/api/candies")
    assert listed.status_code == 200
    cid = listed.json()[0]["id"]

    r = api_client.get(f"/api/candies/{cid}")
    assert r.status_code == 200
    body = r.json()
    assert body["id"] == cid

    missing = api_client.get(f"/api/candies/{uuid.uuid4()}")
    assert missing.status_code == 404
    assert missing.json().get("detail")
