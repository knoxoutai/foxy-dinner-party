# Foxy's Dinner Party

Static site for [foxydinnerparty.com](https://foxydinnerparty.com). Black and gold, a little Gatsby, hosted on GitHub Pages.

The home page is always the next party. After that date, the same file shows up in the Archive. FAQ copy lives in `src/data/faq.json`.

## Develop

```bash
npm install
npm run dev
```

`npm run build` writes the site to `dist/`.

## Add a party

Each party is one file: `src/content/events/<slug>.yaml`. The filename is the URL (`thanksgiving-2026.yaml` → `/events/thanksgiving-2026`).

1. Copy `src/content/events/thanksgiving-2026.yaml` to a new slug.
2. Edit the header fields and the `sections` list. Put optimized images in `public/images/<slug>/` and point `hero`, `ogImage`, and any section `image` at them.
3. Open a pull request. Merging to `main` publishes the site.

Header fields:

| Field | What it does |
| --- | --- |
| `title`, `summary` | Invitation title, archive card, and social description |
| `date` | `YYYY-MM-DD`. Home vs Archive uses this |
| `dateLabel`, `doors` | How the date and arrival time read on the page |
| `time`, `endTime` | 24-hour wall clock for the calendar hold. The zone is `timeZone` in `src/config.ts` (currently `America/Los_Angeles`), not a per-party field |
| `rsvpUrl`, `rsvpLabel` | The Google Sheet (or whatever replaces it) and the button text |
| `location`, `address` | Optional. Shown on the calendar hold. Leave `address` off until you want a street published |
| `hero`, `ogImage` | Page image, and the 1200×630 social preview |
| `sections` | The invitation, in order |

Section `type` values:

- `prose` — heading optional, `paragraphs` of text
- `menu` — `heading`, optional `intro`, `items`
- `cocktail` — `name` and `description` (the page adds “Our signature concoction: The …”)
- `callout` — `heading` and `paragraphs`. Set `showCalendar: true` for the .ics and Google Calendar links
- `steps` — a game: `paragraphs`, optional `lead`, and `steps` (`text`, optional `label`)
- `rsvp` — the closing invitation block and RSVP button
- `actions` — buttons. `to` is `rsvp`, `faq`, or `home`

Inline marks inside any string: `**bold**`, `*italic*`, `[label](rsvp)` for the sheet, `[label](/faq)` for a site path.

Images: export `.webp` around 1600px wide (quality ~80). Social images are JPEG, 1200×630. The big original PNGs stay out of `public/` so they are not served.

## What shows on Home

At build time the site compares each `date` with “today” in `timeZone` from `src/config.ts`. The earliest party that is still today or in the future is Home. Every earlier party is a card in the Archive and keeps its full page at `/events/<slug>`.

You do not move a file when a night is over. `.github/workflows/pages.yml` rebuilds the site every day just after midnight Pacific, so Thanksgiving leaves Home on November 27, 2026 and the next dated party takes its place. `workflow_dispatch` on that workflow rebuilds immediately if you do not want to wait. The same `timeZone` value is what the `.ics` file and the Google Calendar link use. Change it in `src/config.ts` only, then move the workflow cron if the new zone’s midnight is no longer before 08:20 UTC.

To feature a different upcoming party, give it the earliest `date` among parties that have not happened yet.

## GitHub Pages

In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

`public/CNAME` is published as `foxydinnerparty.com`. The workflow deploys `dist/` on every push to `main`.

### DNS

Point the domain at GitHub Pages and remove the records that still send it to Gamma.

**Apex** `foxydinnerparty.com` — four A records and four AAAA records:

| Type | Value |
| --- | --- |
| A | `185.199.108.153` |
| A | `185.199.109.153` |
| A | `185.199.110.153` |
| A | `185.199.111.153` |
| AAAA | `2606:50c0:8000::153` |
| AAAA | `2606:50c0:8001::153` |
| AAAA | `2606:50c0:8002::153` |
| AAAA | `2606:50c0:8003::153` |

**www** — one CNAME:

| Host | Type | Value |
| --- | --- | --- |
| `www` | CNAME | `knoxoutai.github.io` |

After the first successful deploy, confirm the custom domain in Pages settings and turn on **Enforce HTTPS**. GitHub’s own docs for these records: [Managing a custom domain for your GitHub Pages site](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).
