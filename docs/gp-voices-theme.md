# ClinicPro GP Voices — Discourse Theme

Status: in progress
Owner: ClinicPro Engineering
Location: `discourse-theme/gp-voices`
Target URL: `https://clinicpro.co.nz/gp-voices` (Discourse subfolder)

## Scope
Mobile‑first Discourse theme component powering a simple community page with:
- Admin‑defined tags only (`ai-scribe`, `inbox-management`, `general`)
- Comment‑first UX (Featured Thread); new post de‑emphasised
- AI Summary at top (bullets public; full details gated by login via Clerk)
- Admin “News” and “Trending” posts interleaved into the feed
- No category UI; no topic-page navigation in normal flow (inline replies)

## Milestones & Checklist
- [x] Design/spec approved
- [x] Documentation created (this file)
- [ ] Theme scaffold created under `discourse-theme/gp-voices`
- [ ] Initial connectors: AI Summary, Featured composer, Tag chips
- [ ] Base styles + mobile sticky elements (AI Summary, bottom nav)
- [ ] Admin News/Trending interleaving (scaffolding)
- [ ] Configure Discourse subfolder `/gp-voices`
- [ ] Configure OIDC (Clerk) in Discourse
- [ ] Create tags: `ai-scribe`, `inbox-management`, `general`
- [ ] Create Featured Thread & AI Summary topic; record IDs
- [ ] QA: mobile comment flow, AI gating, tag filters

## Theme Settings (settings.yml)
- `featured_topic_id` (integer): ID of the Featured Thread for comment‑first composer
- `allowed_tags` (csv): Admin‑approved user‑selectable tags
- `news_tag` (string): Staff‑only tag for News posts
- `trending_tag` (string): Staff‑only tag for Trending posts
- `interleave_frequency` (integer): Insert 1 admin item per N user items
- `ai_summary_topic_id` (integer): Topic whose first post holds the weekly summary
- `ai_summary_max_bullets` (integer): Max bullet lines shown to anonymous users
- `show_pinned_prompts` (bool): Show prompts carousel
- `enable_bottom_tab_bar_mobile` (bool): Bottom nav on mobile
- `deemphasise_new_topic` (bool): Hide primary New Topic CTAs
- `hide_category_ui` (bool): Hide category chrome

## File Structure
```
discourse-theme/gp-voices/
  about.json
  settings.yml
  common/common.scss
  mobile/mobile.scss
  javascripts/discourse/
    initializers/gp-voices.js
    components/
      ai-summary-card.hbs
      featured-comment-composer.hbs
      tag-chips-scroller.hbs
    connectors/
      discovery-top/gp-voices-header.hbs
      discovery-below/tag-chips.hbs
      after-topic-list-item/inline-replies.hbs
      below-site-header/mobile-tabbar.hbs
```

## Behaviour Summary
- AI Summary: top card; shows up to N bullets to everyone; “View full summary” opens login (if signed‑out) or shows a modal/expanded view for signed‑in users.
- Comment‑first: Featured Thread composer prominently rendered; bottom “Comment” action targets it. New Topic available in overflow only.
- Feed: Unified card list; inline replies expandable; no navigation to topic page in normal flow.
- Admin inserts: Posts tagged `news` or `trending` interleaved at a cadence.
- Tags: Only admin‑defined; chips filter the list.

## Import & Setup (Admin)
1. Discourse subfolder
   - Set `relative_url_root = /gp-voices` in Discourse (subfolder mode).
   - Configure Nginx/Proxy accordingly (ensure asset paths respect subfolder).
2. Auth (Clerk → Discourse OIDC)
   - Enable OIDC in Discourse; use Clerk provider values.
   - Public read; login required to post/comment and to view full AI summary.
3. Tags & content
   - Create tags: `ai-scribe`, `inbox-management`, `general` (user‑selectable).
   - Create staff‑only tags: `news`, `trending`, optionally `prompt`.
   - Create “Featured Thread” topic and note its ID.
   - Create “AI Summary” topic and note its ID.
4. Theme install
   - In Admin → Customize → Themes → Install → From your Git (recommended), or upload a zip of `discourse-theme/gp-voices`.
   - Apply theme to default.
   - Set theme settings: featured topic ID, allowed tags, summary topic ID, etc.
5. Home config
   - Top menu: `latest|top|bookmarks|tags`.
   - Enable tags; hide categories from nav.
   - Require at least 1 tag on new posts; restrict to allowed list.

## QA Checklist
- AI Summary shows bullets to anonymous, full to logged‑in.
- “Comment” CTA targets Featured Thread; posting works.
- New Topic is available but de‑emphasised.
- News/Trending cards appear with correct badges and cadence.
- Tag chips filter correctly; sticky on mobile.
- Inline replies expand and collapse without leaving the feed.
- Accessibility: focus order, aria roles, 44px targets, dark mode.
- Performance: LCP < 2s on 3G; lazy media.

## Risks & Notes
- Discourse topic pages still exist for deep links; theme minimises routing there.
- Interleaving relies on staff tags; ensure moderation conventions are followed.
- Discourse upgrades may affect outlet names; test after upgrades.

## References
- Developer Guides Index: https://meta.discourse.org/t/developer-guides-index/308036
- Admin Quick Start: https://www.phylobabble.org/t/discourse-admin-quick-start-guide/3/
- Discourse AI: https://meta.discourse.org/t/introducing-discourse-ai/262744
- Subfolder setup: https://meta.discourse.org/c/sysadmin/23
