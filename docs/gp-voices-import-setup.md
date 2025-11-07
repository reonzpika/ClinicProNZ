# GP Voices Theme — Import & Setup Guide

This guide walks you through installing the ClinicPro GP Voices Discourse theme and configuring the site for `/gp-voices`.

## Prerequisites
- Discourse 3.2+
- Subfolder mode available and reverse proxy configured
- Clerk application (OIDC) ready

## 1) Subfolder configuration
- Set `relative_url_root = /gp-voices` in `app.yml` or container env.
- Update Nginx/Traefik to proxy `/gp-voices/` to Discourse.
- Rebuild Discourse.

## 2) OIDC (Clerk)
- In Discourse Admin → Settings → Login:
  - Enable `enable oAuth2 basic` or OIDC plugin settings
  - Fill issuer, client ID/secret from Clerk
  - Map email/name; disable local signups if desired

## 3) Tags and content
- Create public tags: `ai-scribe`, `inbox-management`, `general`
- Create staff-only tags: `news`, `trending`, `prompt`
- Create Featured Thread → note its numeric topic ID
- Create AI Summary topic (weekly) → note its topic ID

## 4) Install the theme
- Option A (Git): Push `discourse-theme/gp-voices` to a repo; in Admin → Customize → Themes → Install → From a git repo. Use the repo URL and branch.
- Option B (Zip): Zip contents of `discourse-theme/gp-voices` and upload via Admin → Customize → Themes → Install → From your device.

## 5) Theme settings
- Set:
  - `featured_topic_id`
  - `allowed_tags` → `ai-scribe,inbox-management,general`
  - `news_tag` → `news`
  - `trending_tag` → `trending`
  - `interleave_frequency` → `6`
  - `ai_summary_topic_id`
  - `ai_summary_max_bullets` → `5`
  - enable `enable_bottom_tab_bar_mobile`, `deemphasise_new_topic`, `hide_category_ui`

## 6) Home configuration
- Admin → Settings → Basic Setup:
  - Top menu: `latest|top|bookmarks|tags`
  - Enable tags; require at least 1 tag; restrict to allowed list
  - Hide categories from navigation (and theme setting enforces CSS hide)

## 7) QA checklist
- Visit `/gp-voices` as anonymous: see AI Summary bullets, Featured composer hidden actions, feed loads
- Sign in via Clerk: Full AI summary opens; can comment on Featured Thread; can create new post via overflow
- Tag chips filter; News/Trending appear interleaved

## Notes
- Deep-link topic pages still exist for shares; UI discourages navigation
- Interleaving frequency is tunable in theme settings
