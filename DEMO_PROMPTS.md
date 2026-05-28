# Cursor 101 Demo — Paste Buffer

Keep this file open in a side tab. Copy from here on stage.

---

## Beat 1 — Semantic search (Ask mode, Auto)

### Q1 — Cache behavior

```
Where do we cache the chocolate list and how long is the TTL?
```

### Q2 — Cart persistence

```
How does the cart persist between page reloads?
```

### Q3 — Wow question (primes Beat 2)

```
What files would I need to change to add a tasting_notes field (similar to how tags works today) to every chocolate, end-to-end? List exact file paths and a one-line summary of the change in each.
```

---

## Beat 2a — Plan mode, thinking model (Opus 4.7 or GPT-5.5)

### Main Plan prompt

```
Add a `tasting_notes` field to chocolates as a List[str] of short
flavor descriptors like 'fig', 'almond', 'black tea'. Mirror the
existing `tags` field exactly: SQLAlchemy ARRAY(String(64)) with
server_default '{}', Pydantic List[str] in ChocolateOut, populate
seed.py from each chocolate's description, extend the frontend
Chocolate type, render tasting notes as a separate chip row on
ChocolateCard under the price using the same Badge component but
labeled "Tasting notes". Add a backend test asserting /api/chocolates
returns the field. Don't change the cache key shape.
```

### Iteration follow-up (after Plan responds)

```
Also make the column nullable=False with a server default of '{}' so existing rows don't break.
```

### If Plan tries to over-architect

```
Stay scoped to the prompt — no broader refactors.
```

---

## Beat 2b — Agent mode

### Trigger implementation

```
Execute the plan.
```

### If agent picks wrong column type

```
Use ARRAY(String(64)) exactly like the tags field at line 27 of chocolate.py.
```

---

## Beat 2c — Bounce dev server (second terminal)

```
make stop && make dev
```

---

## Beat 2d — Tests and PR

### Run tests from chat

```
Run make test and report results.
```

### Push and open PR (second terminal)

```
git add -A
git commit -m "Add tasting_notes to chocolates"
git push -u origin demo/tasting-notes
gh pr create --fill --title "Add tasting_notes to chocolates"
```

---

## Failsafe — if live demo derails

```
git stash && git checkout demo/tasting-notes-applied
```

Then refresh `localhost:3000` and narrate: *"Let me show you what the finished result looks like so we don't burn your time."*
