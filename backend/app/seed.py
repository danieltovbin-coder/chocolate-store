"""Demo seed data for the candy store.

Edit the SEED list below to change what appears in the store. The data is
loaded into a freshly-created database on every `make dev` by
``backend/app/init_db.py``.
"""
from __future__ import annotations

import re
import unicodedata


def slugify(name: str) -> str:
    s = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode("ascii")
    s = re.sub(r"[^a-zA-Z0-9]+", "-", s).strip("-").lower()
    return s or "candy"


SEED: list[dict] = [
    {
        "name": "Sour Rainbow Gummies",
        "description": "Bright fruit gummies dusted with a tart sugar sparkle.",
        "origin": "California, USA",
        "price_cents": 599,
        "image_url": "https://images.unsplash.com/photo-1581798459219-318e76aecc7b?w=600&q=80",
        "tags": ["gummy", "sour", "fruit"],
    },
    {
        "name": "Citrus Jelly Slices",
        "description": "Soft orange, lemon, and lime jellies with a sugared rind finish.",
        "origin": "Florida, USA",
        "price_cents": 649,
        "image_url": "https://images.unsplash.com/photo-1575224526797-5730d09d781d?w=600&q=80",
        "tags": ["jelly", "citrus", "fruit"],
    },
    {
        "name": "Strawberry Licorice Twists",
        "description": "Pull-apart twists with a mellow strawberry flavor and soft chew.",
        "origin": "Lancashire, UK",
        "price_cents": 549,
        "image_url": "https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=600&q=80",
        "tags": ["licorice", "strawberry", "chewy"],
    },
    {
        "name": "Saltwater Taffy Assortment",
        "description": "A seaside mix of vanilla, banana, raspberry, and lime taffy pieces.",
        "origin": "New Jersey, USA",
        "price_cents": 799,
        "image_url": "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=600&q=80",
        "tags": ["taffy", "assorted", "chewy"],
    },
    {
        "name": "Peppermint Swirl Lollipops",
        "description": "Hand-pulled lollipops with a crisp peppermint snap.",
        "origin": "Oregon, USA",
        "price_cents": 699,
        "image_url": "https://images.unsplash.com/photo-1615719413546-198b25453f85?w=600&q=80",
        "tags": ["lollipop", "mint", "hard-candy"],
    },
    {
        "name": "Cinnamon Fire Drops",
        "description": "Tiny hard candies with a warm cinnamon heat that builds slowly.",
        "origin": "Mexico",
        "price_cents": 499,
        "image_url": "https://images.unsplash.com/photo-1612886623532-180283a0f2d3?w=600&q=80",
        "tags": ["hard-candy", "cinnamon", "spicy"],
    },
    {
        "name": "Green Apple Sour Belts",
        "description": "Ribbon-style belts layered with tangy green apple flavor.",
        "origin": "Washington, USA",
        "price_cents": 579,
        "image_url": "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=600&q=80",
        "tags": ["sour", "apple", "chewy"],
    },
    {
        "name": "Vanilla Marshmallow Clouds",
        "description": "Pillowy vanilla marshmallows whipped for a light, airy bite.",
        "origin": "Vermont, USA",
        "price_cents": 749,
        "image_url": "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&q=80",
        "tags": ["marshmallow", "vanilla", "soft"],
    },
    {
        "name": "Butterscotch Hard Candy Tin",
        "description": "Golden wrapped drops with a buttery brown-sugar finish.",
        "origin": "Scotland",
        "price_cents": 899,
        "image_url": "https://images.unsplash.com/photo-1571506165871-ee72a35bc9d4?w=600&q=80",
        "tags": ["hard-candy", "butterscotch", "gift"],
    },
    {
        "name": "Tropical Fruit Chews",
        "description": "Mango, pineapple, guava, and passion fruit chews in a sunny mix.",
        "origin": "Hawaii, USA",
        "price_cents": 629,
        "image_url": "https://images.unsplash.com/photo-1505394033641-40c6ad1178d7?w=600&q=80",
        "tags": ["fruit", "chewy", "tropical"],
    },
    {
        "name": "Cola Bottle Gummies",
        "description": "Bottle-shaped gummies with fizzy cola flavor and a sugar crust.",
        "origin": "Germany",
        "price_cents": 589,
        "image_url": "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&q=80",
        "tags": ["gummy", "cola", "fizzy"],
    },
    {
        "name": "Maple Caramel Squares",
        "description": "Soft caramel squares sweetened with maple syrup and finished with sea salt.",
        "origin": "Quebec, Canada",
        "price_cents": 999,
        "image_url": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80",
        "tags": ["caramel", "maple", "salt"],
    },
]
