# Status — 2026-07-19, ~04:22 AM

## Deploys blocked: Render-side 403 on git clone

Every deploy since `925315a` (last one live, July 19 12:18 AM) has failed identically. Root cause is isolated to Render's infrastructure, not the code or the GitHub connection:

- Build logs show `git clone https://github.com/kineticimai-ops/dennies-cafe.git` returning **403 Forbidden**, retried 4-5x, then giving up.
- Checked and ruled out on the GitHub side: the "Render" GitHub App (installed 2 weeks ago) is not suspended, has "All repositories" access, and full read/write permissions on actions/checks/deployments/etc.
- Checked and ruled out on the Render side: the stored `kineticimai-ops` git credential shows valid, recently-synced access to `dennies-cafe`.
- Both status.render.com and githubstatus.com showed all-green, no incident, at the time of testing.
- Tried and failed: plain retry, "Clear build cache & deploy," and a fresh retry after re-authenticating GitHub in the browser — all hit the same 403.

**Conclusion:** stuck/bugged state on Render's infrastructure specific to this service. Not fixable from outside Render.

### Support ticket
Not drafted or sent by Claude — Keiron opted to contact Render support directly. Ticket status/outcome unknown from this session.

### Deploy retry test results (for reference)
- `dep-d9e3sbernols73dh4dm0` — Manual Deploy of `f77c96a`/`113e150` after "Clear build cache & deploy": failed, 403 on clone (04:02 AM).
- `dep-d9e41curnols73dhbqlg` — Manual Deploy of `113e150` after GitHub re-auth: failed, 403 on clone (04:12 AM).

## Commits pushed but not live

`origin/master` and local `HEAD` are both at `113e150`, three commits ahead of what's actually serving on denniescafe.co.uk:

1. `f77c96a` — Add real Google review quotes (Jonathan, Andy, Terry)
2. `e242ce5` — Update JSON-LD geo coordinates (50.990457, -0.27434) + close out 3 README items
3. `113e150` — Add parking line ("On-street parking only") to Find Us section, drop QR code item

As of last check, the live site still shows the pre-`f77c96a` state: placeholder review quotes, old/rough geo coordinates, and the placeholder parking text. Confirmed via direct fetch of denniescafe.co.uk and cross-checked against Render's deploy logs.

## Checklist status (see README.md for full list)

- **Parking line** — done, already committed (`113e150`). Not actually outstanding.
- **Till-card QR link** — done (dropped). No QR link exists; Keiron confirmed not doing this for v1. Not actually outstanding.
- **Full menu list** — Keiron reviewed the current `public/menu.html` contents and said leave as-is; no missing items identified. README item 20 and the stale TODO comment in `menu.html` still haven't been formally closed out to reflect that decision — small cleanup, not blocking.

## Net: only one open blocker

Everything content-wise is done and pushed. The **only** thing standing between this and being live is the Render 403 clone bug, pending Render support's response.
