# Cursor 101 — CoreWeave Demo Runbook

**Date:** Tuesday, June 9, 2026, 1:00 pm ET
**Venue:** NYC office (Financial District) + virtual hybrid
**Audience:** Mixed CoreWeave engineers (~80–100 expected via Cole's L&L)

**Total session: 60 minutes**

| Block | Time | Hand-off |
|-------|------|----------|
| Slide walkthrough (slides 1–32) | ~30 min | Slide 32 ("Demo: Cursor in action") |
| **Live demo (this runbook)** | **~22 min** | Hand back at slide 33 |
| Quickstart + Resources + 201 lookahead (slides 33–35) | ~3 min | Slide 36 (Thank You) |
| Q&A | ~5–8 min | |

---

## 30 minutes before start

- [ ] Open `~/chocolate-store` in Cursor
- [ ] `make dev` running; verify:
  - [ ] App loads at <http://127.0.0.1:3000>
  - [ ] API health 200 at <http://127.0.0.1:8000/api/health>
- [ ] Cursor → Settings → Indexing → green checkmark for `chocolate-store`
- [ ] `git checkout -b demo/tasting-notes` (fresh branch from `main`)
- [ ] Pre-create backup branch with implementation already applied:
  ```bash
  git checkout -b demo/tasting-notes-applied
  # (manually apply the change OR run the demo once and commit)
  git checkout demo/tasting-notes
  ```
- [ ] This runbook open in second window (or printed)
- [ ] [PROMPTS.md](#paste-buffer) (paste buffer below) copied somewhere you can quickly access

## 5 minutes before start

- [ ] Browser: tab 1 = `localhost:3000`, tab 2 = `localhost:8000/api/health` (backup)
- [ ] Cursor sidebar chat open, **Ask mode** selected, model on **Auto**
- [ ] Second terminal warmed in `~/chocolate-store` ready for `make stop && make dev`
- [ ] Notifications silenced (do not disturb mode)
- [ ] Verify `Shift+Tab` toggles to Plan mode on your build (if not, you'll click the mode picker)
- [ ] Audience can see your screen — IDE on left, browser on right

---

# THE DEMO

---

## Beat 1 — Codebase indexing + semantic search (5 min)

### Setup line (30 sec)

**Switch to:** IDE sidebar chat, **Ask mode**, model **Auto**.

**Say:**

> "On the slides I told you Cursor indexes your repo into embeddings — that's not text search, it's semantic understanding. Let me show you what that actually buys you. I'm going to ask three questions that would fail a grep but should land instantly here."

---

### Question 1 — Cache behavior (90 sec)

**Paste into chat:**

```
Where do we cache the chocolate list and how long is the TTL?
```

**Expect:** Cursor lands on [backend/app/routers/chocolates.py](backend/app/routers/chocolates.py) around line 30 (`_list_cache_key`) and references `settings.cache_ttl_seconds`.

**Say while it answers:**

> "Notice the word 'cache' shows up nowhere in my prompt as a filename — and Cursor still went straight to the right function. It understood the concept and walked the code."

---

### Question 2 — Cart persistence (90 sec)

**Paste into chat:**

```
How does the cart persist between page reloads?
```

**Expect:** Lands on `frontend/src/context/shop-state.tsx` and the `cs.cart.v1` localStorage key.

**Say:**

> "Same idea — frontend this time. The cart never says 'localStorage' in our prompt, but it knew."

---

### Question 3 — The "wow" question (2 min)

**Paste into chat:**

```
What files would I need to change to add a tasting_notes field (similar to how tags works today) to every chocolate, end-to-end? List exact file paths and a one-line summary of the change in each.
```

**Expect:** Cursor enumerates ~6 files:

- `backend/app/models/chocolate.py`
- `backend/app/schemas/chocolate.py`
- `backend/app/seed.py`
- `frontend/src/lib/types.ts`
- `frontend/src/components/ChocolateCard.tsx`
- a new test under `backend/tests/`

**Say while it answers:**

> "The phrasing matters — I said 'similar to tags.' That's a hint Cursor uses to find the existing pattern. In a second I'll feed this same idea to Plan mode and you'll see the agent literally use `tags` as a template."

**When it's done:**

> "Leave that on screen. That's our checklist for the next 16 minutes."

**Do not clear the chat.** That answer stays as the visible scaffold for Beat 2.

---

## Beat 2 — Plan → Implement → Review (16 min)

### 2a. Plan (4 min)

**Action:** Switch chat to **Plan mode** (`Shift+Tab` or click the mode dropdown).

**Action:** Open the model picker → select **Opus 4.7** (or GPT-5.5 — whichever is healthy that morning).

**Say:**

> "For Plan, I switch to a thinking model. For everything else, I leave it on Auto. Auto is the CoreWeave-friendly default — Amanga and the leadership team have been clear: cheap when you can be, expensive when you must be."

**Action:** Paste the Plan prompt (from PROMPTS section below):

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

**Expect:** Plan mode produces a structured plan with file-by-file changes. It may ask 1–2 clarifying questions (e.g. "should the column be nullable?").

**Say while it plans:**

> "Plan mode is read-only — it can't edit yet. The whole point is to argue about the approach before the agent burns tokens implementing the wrong thing."

---

**Iterate the plan once.** Highlight any one section of the plan, then add a follow-up:

```
Also make the column nullable=False with a server default of '{}' so existing rows don't break.
```

**Say:**

> "I just highlighted a section and added a follow-up. The plan now reflects it. This is how you steer Plan mode — pick a section, refine it, repeat. No need to start over."

---

**Action:** Point briefly at `@`-mention in the input box.

**Say (~10 sec):**

> "And if you want to pull a specific file or symbol into context without dumping the whole repo, that's what `@`-mentions are for. The slide we covered on context windows — this is how you keep that budget tight."

---

### 2b. Implement (7 min)

**Action:** Switch to **Agent mode**. Keep Opus, OR flip to Auto (Auto is more visible as a teaching beat — pick one).

**Action:** Type:

```
Execute the plan.
```

**Watch the agent stream edits.** Expected files:

| File | Change |
|------|--------|
| `backend/app/models/chocolate.py` | New `tasting_notes` column (ARRAY String, nullable=False, server_default) |
| `backend/app/schemas/chocolate.py` | `tasting_notes: List[str] = []` on `ChocolateOut` |
| `backend/app/seed.py` | Populate per-chocolate from description |
| `frontend/src/lib/types.ts` | Add `tasting_notes: string[]` to `Chocolate` |
| `frontend/src/components/ChocolateCard.tsx` | Second chip row, "Tasting notes" label |
| `backend/tests/test_chocolates_api.py` | New test asserting the field is returned |

**Mid-flow narration (~20 sec, once you see it reference `tags`):**

> "See that — the agent just referenced the `tags` field as a template. That's not me prompting it; that's semantic search shaping the implementation. The pattern matters, the agent learns from your codebase."

**Do not type in the chat while it works.** Let the audience see what an actual agent run looks like — file edits streaming in real time.

**If the agent stalls or asks a clarifying question:** answer with one short sentence. Do NOT re-prompt with a wall of text.

---

### 2c. Bounce + verify (2 min)

**This is the critical hot-reload caveat.** New column = schema rebuild. `uvicorn --reload` alone will not catch a column change.

**Action:** Switch to the second terminal:

```bash
make stop && make dev
```

**Say while it bounces:**

> "Quick aside — we added a column to a SQL table, so Postgres needs to rebuild the schema from the model. This is how this repo works, not a Cursor thing. 15 seconds, watch."

**Wait 10–15 seconds.** When `Started server process` appears in the terminal:

**Action:** Refresh `localhost:3000` in the browser tab.

**Tasting note chips appear on every chocolate card. THIS IS THE PAYOFF MOMENT — pause, do not narrate over it.**

**After ~2 seconds of silence:**

> "There it is. End to end. Every card now has tasting notes. Backend model, schema, seed, frontend type, render — and we'll see in a second that there's a passing test on top of that."

---

### 2d. Review (3 min)

**Action:** Back in Cursor chat (Agent mode):

```
Run make test and report results.
```

**Expect:** Both `backend-tests` and `frontend-tests` pass.

**If a test fails:** narrate it as the feature working — *"This is exactly what required checks are for. Let me ask the agent to fix it."* Then have the agent fix and rerun. Budget 60 sec for this if needed.

---

**Action:** Open [.github/workflows/ci.yml](.github/workflows/ci.yml) in the editor.

**Say:**

> "Two required checks on every PR — `backend-tests` and `frontend-tests`. They're called out in our README. Cursor knows about these from the indexing; if I asked it to add a third check, it'd update both this file and the README."

---

**Action:** Commit and push from the chat (or terminal):

```bash
git add -A
git commit -m "Add tasting_notes to chocolates"
git push -u origin demo/tasting-notes
gh pr create --fill --title "Add tasting_notes to chocolates"
```

**Open the PR in the browser.** Show CI running.

**Say:**

> "Real branch, real PR, real CI. We shipped a feature end to end in about 16 minutes, and most of that was me talking. In 201 we'll show automated PR review with Bugbot, MCPs for connecting tools like Linear or Notion to the agent, skills for reusable expert playbooks, and cloud agents that run this kind of work asynchronously on a real branch without your laptop."

---

## Beat 3 — Wrap (1 min)

**Action:** Switch back to Cursor IDE, or just face the camera.

**Three takeaways. Read these slowly:**

> "Three things to take home.
>
> One — **Auto by default.** Switch to a thinking model for Plan; switch back for Agent. Don't pay Opus prices for `console.log`.
>
> Two — **Plan before long agent runs.** It's free token efficiency and it catches the wrong direction before the agent has burned an hour.
>
> Three — **Semantic search rewards good patterns.** The `tags` field made the whole implementation 5x cleaner. Write code your agent can learn from, and your agent gets better at writing code.
>
> I'll hand it back to the slides for resources and the 201 preview — then I want your questions."

**Hand back to slide 33.**

---

# PASTE BUFFER

These are the exact strings to copy on stage. Keep this section open in a side tab.

## Prompt for Beat 1, Question 1

```
Where do we cache the chocolate list and how long is the TTL?
```

## Prompt for Beat 1, Question 2

```
How does the cart persist between page reloads?
```

## Prompt for Beat 1, Question 3

```
What files would I need to change to add a tasting_notes field (similar to how tags works today) to every chocolate, end-to-end? List exact file paths and a one-line summary of the change in each.
```

## Prompt for Beat 2a (Plan mode)

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

## Plan-iteration follow-up

```
Also make the column nullable=False with a server default of '{}' so existing rows don't break.
```

## Trigger implementation (Agent mode)

```
Execute the plan.
```

## Trigger tests (Agent mode)

```
Run make test and report results.
```

## Bounce dev server (second terminal)

```bash
make stop && make dev
```

## PR commands

```bash
git add -A
git commit -m "Add tasting_notes to chocolates"
git push -u origin demo/tasting-notes
gh pr create --fill --title "Add tasting_notes to chocolates"
```

---

# FALLBACK PLAYBOOK

If something breaks live, here is the recovery path.

| What breaks | Recovery |
|-------------|----------|
| **Indexing not green at start** | Skip Beat 1 Question 1 (it'll be flaky). Go straight to Question 3 — that one usually works even on a partial index. If totally broken, narrate: *"Indexing is still warming up — let me show you a snapshot from earlier this week"* and pull up a prepared screenshot. |
| **Cursor agent stalls in Implement** | Wait 30 sec. If still stuck, hit stop, ask: *"Continue where you left off, focus on the remaining files."* If still stuck after 60 sec, switch to the `demo/tasting-notes-applied` backup branch: `git stash && git checkout demo/tasting-notes-applied && refresh browser`. Narrate as *"Let me show you what the finished result looks like so we don't burn your time."* |
| **Agent picks wrong column type** | The `tags` template usually anchors it. If not, type: *"Use ARRAY(String(64)) exactly like the tags field at line 27 of chocolate.py."* |
| **`make stop && make dev` hangs** | Open second pre-warmed terminal. If that also hangs, fall back to backup branch. Pre-warmed `make dev` should be running in a third terminal as ultimate insurance. |
| **Tests fail unexpectedly** | Make the failure the lesson: *"This is exactly what the required checks catch."* Then ask the agent: *"The test failed with X — fix it."* Budget 60 sec. If it can't be fixed in 60 sec, skip the test rerun beat, just say *"I'd normally have the agent fix this, but for time I'll point out: the PR is open, CI is running, my reviewer sees this fail and we iterate."* |
| **Hot reload doesn't pick up frontend changes** | Cmd+R in the browser tab. Mention casually: *"Manual refresh — this is Next, not Cursor."* |
| **Plan mode is too verbose / over-architects** | One short redirect: *"Stay scoped to the prompt — no broader refactors."* Do NOT engage in a back-and-forth. |
| **`gh pr create` fails (gh not auth'd)** | Just push the branch and show the GitHub URL in the browser. Skip the PR creation beat, narrate: *"I'd normally open the PR from CLI; we'll skip that beat — point is the code is up, CI is running."* |

---

# Q&A PRIMER

Likely questions and ~30-second answers.

| Likely question | Short answer |
|-----------------|--------------|
| "Do I have to use Plan mode for everything?" | No. Use Ask for quick lookups, Plan for anything you'd want to argue about before the code is written (refactors, new features), Agent for execution. For one-line changes, just type in Agent and skip Plan. |
| "How do I pick a model?" | Default to Auto. Switch to Opus or GPT-5.5 when you're planning, reviewing, or debugging something hard. Avoid Composer 2.5 unless you specifically want a fast execution pass. |
| "Is this safe to run on our production repo?" | Same as any other tool — review every diff before merging. Cursor doesn't push for you. The required CI checks on our chocolate-store repo aren't optional, and you should do the same on yours. |
| "What about Claude Code?" | Many of you use both, and that's fine. Cursor is the IDE-first surface; Claude Code is the CLI-first surface. Pick the right tool for the moment. In 201 we'll go deeper on when each one wins. |
| "Where does the agent get its tools from?" | Today it has the editor, the terminal, the indexed codebase, and semantic search. In 201 we'll cover MCPs — connectors that let the agent talk to Notion, Linear, Slack, internal services. If anyone is currently exporting docs manually to Claude, MCP is what makes that stop. |
| "What does this cost?" | Auto mode handles ~90% of work efficiently. Plan mode on Opus is the most expensive part of any session, but Plan is the cheapest way to avoid throwing away an Agent run. If you're worried about cost, default to Auto. |
| "Can I use this in JetBrains?" | Yes — slide 21 covers JetBrains support via ACP. No extra charge on your existing Cursor subscription. |
| "Is there an API / can I script this?" | Yes — Cursor CLI and SDK exist. We'll cover those in 201. |
| "When do we cover skills / subagents / MCPs / cloud agents?" | All four are 201 topics — Cole and I will schedule that for late June or early July. |

---

# POST-DEMO CLEANUP

After the session:

- [ ] Close the demo PR (don't merge into `main`)
- [ ] `git checkout main && git branch -D demo/tasting-notes demo/tasting-notes-applied`
- [ ] `make stop`
- [ ] Add a one-line note to `data/accounts/coreweave/concerns.json` or `todos.json` in the dashboard repo with anything new that surfaced in Q&A
- [ ] Share the deck PDF in `#ext-coreweave-cursor` Slack channel
- [ ] Send Cole a thank-you note and confirm 102/201 dates
