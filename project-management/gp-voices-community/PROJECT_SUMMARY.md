---
project_name: GP Voices Community Site
project_stage: Build
owner: ClinicPro Engineering
last_updated: "2025-11-10"
version: "1.0.4"
tags:
  - community
  - discourse
  - frontend
  - gp-voices
  - clinicpro
summary: "Mobile-first Discourse community site for ClinicPro GPs. Custom theme with comment-first UX, AI summaries, and tag-based content organisation. Deployed at /gp-voices subfolder."
---

# GP Voices Community Site

## Project Overview

**Status**: Build — Theme development in progress

**Description**: Mobile-first Discourse community platform for ClinicPro users (New Zealand GPs). Custom Discourse theme providing a simplified, comment-first community experience with AI-powered weekly summaries, tag-based content organisation, and seamless Clerk OIDC authentication integration.

**Target URL**: `https://clinicpro.co.nz/gp-voices` (Discourse subfolder)

**Key Value Proposition**: Provide a focused community space for GPs to discuss ClinicPro features, share best practices, and receive curated news and updates. Comment-first UX encourages engagement over traditional forum posting.

---

## Current Status [2025-01-15]

### Development Progress
- ✅ **Design/spec approved**
- ✅ **Documentation created** (`docs/gp-voices-theme.md`, `docs/gp-voices-import-setup.md`)
- ✅ **Theme scaffold created** (`discourse-theme/gp-voices/`)
- ✅ **Base components implemented**: AI Summary Card, Category Section, Featured Comment Composer, Tag Chips Scroller, Inline Replies
- ✅ **Base styles** (`common/common.scss`, `mobile/mobile.scss`)
- ✅ **Initializers** (`gp-voices.js`)
- ✅ **Connectors**: Discovery top/below, after topic list item
- ⏳ **Configuration pending**: Discourse subfolder setup, OIDC (Clerk), tags, content creation
- ⏳ **QA pending**: Mobile comment flow, AI gating, tag filters

### Theme Components Status
- **AI Summary Card**: Component implemented (`ai-summary-card.hbs`, `ai-summary-card.js`)
- **Category Section**: Component implemented (`category-section.hbs`, `category-section.js`)
- **Featured Comment Composer**: Component implemented (`featured-comment-composer.hbs`, `featured-comment-composer.js`)
- **Tag Chips Scroller**: Component implemented (`tag-chips-scroller.hbs`, `tag-chips-scroller.js`)
- **Inline Replies**: Component implemented (`inline-replies.hbs`, `inline-replies.js`)
- **Homepage CTA**: Component implemented (`homepage-cta.js`, `homepage-cta.hbs`)
- **Header Connector**: Implemented (`gp-voices-header.hbs`)

---

## Key Features

### Core Community Features
- **Comment-First UX**: Featured Thread composer prominently displayed; new post creation de-emphasised
- **AI Weekly Summaries**: Top card showing bullet points to anonymous users; full summary gated behind Clerk login
- **Tag-Based Organisation**: Admin-defined tags only (`ai-scribe`, `inbox-management`, `general`)
- **Admin Curated Content**: News and Trending posts interleaved into feed at configurable cadence
- **Inline Replies**: Expandable replies without navigating to topic pages
- **Mobile-First Design**: Sticky elements (AI Summary, bottom nav), optimised for mobile GP workflows

### Technical Features
- **Discourse Subfolder Mode**: Deployed at `/gp-voices` subfolder
- **Clerk OIDC Integration**: Seamless authentication with ClinicPro user accounts
- **Custom Theme Components**: Ember.js components extending Discourse functionality
- **Dark Mode**: ClinicPro-branded dark theme with indigo/cyan accents
- **Performance Optimised**: Lazy loading, optimised for mobile 3G connections

---

## Technical Architecture

### Technology Stack
- **Platform**: Discourse 3.2+ (forum software)
- **Theme Framework**: Discourse Theme Components (Ember.js)
- **Styling**: SCSS (common + mobile-specific)
- **Authentication**: Clerk OIDC provider
- **Deployment**: Discourse subfolder mode (`/gp-voices`)

### Theme Structure
```
discourse-theme/gp-voices/
├── about.json                    # Theme metadata
├── settings.yml                  # Theme configuration settings
├── common/
│   └── common.scss              # Base theme styles
├── mobile/
│   └── mobile.scss              # Mobile-specific styles
└── javascripts/discourse/
    ├── initializers/
    │   └── gp-voices.js         # Theme initialisation
    ├── components/
    │   ├── ai-summary-card.hbs/js
    │   ├── category-section.hbs/js
    │   ├── featured-comment-composer.hbs/js
    │   ├── tag-chips-scroller.hbs/js
    │   ├── inline-replies.hbs/js
    │   └── homepage-cta.hbs/js
    └── connectors/
        ├── discovery-top/gp-voices-header.hbs
        ├── discovery-below/homepage-cta.hbs
        └── after-topic-list-item/inline-replies.hbs
```

### Theme Settings (settings.yml)
- `ai_summary_category_id`: Category ID for AI Summary posts
- `news_category_id`: Category ID for News (staff-only create)
- `featured_category_id`: Category ID for Featured Topics (staff curated)
- `general_category_id`: Category ID for General (user-created topics)
- `news_section_count`: Number of News items on homepage (default: 1)
- `featured_section_count`: Number of Featured Topics on homepage (default: 2)
- `general_cta_after_n`: Insert New Topic CTA after N General posts (default: 10)
- `ai_summary_max_bullets`: Max bullet lines for anonymous users (default: 5)
- `enable_bottom_tab_bar_mobile`: Enable mobile bottom navigation (default: true)
- `deemphasise_new_topic`: Hide/de-emphasise primary New Topic CTAs (default: true)
- `hide_category_ui`: Hide category chrome in navigation (default: true)

---

## Milestones & Roadmap

### Completed Milestones
- [x] **2025-01-15**: Design/spec approved
- [x] **2025-01-15**: Documentation created
- [x] **2025-01-15**: Theme scaffold created
- [x] **2025-01-15**: Core components implemented

### In Progress
- [ ] **Discourse Configuration**: Subfolder setup, OIDC (Clerk) configuration
- [ ] **Content Setup**: Create tags, Featured Thread, AI Summary topic

### Upcoming Milestones
- [ ] **Theme Installation**: Install theme in Discourse instance
- [ ] **Theme Configuration**: Configure all theme settings
- [ ] **Home Configuration**: Configure Discourse home settings
- [ ] **QA Testing**: Mobile comment flow, AI gating, tag filters, accessibility
- [ ] **Performance Testing**: LCP < 2s on 3G, lazy media loading
- [ ] **Launch**: Go live at `/gp-voices`

---

## Dependencies

### Outgoing Dependencies
- **ClinicPro SaaS**: Authentication integration via Clerk OIDC — Status: Active
- **Discourse Platform**: Requires Discourse 3.2+ instance — Status: Active
- **Clerk**: OIDC provider for authentication — Status: Active

### Incoming Dependencies
- None currently

---

## Risks & Blockers

### Current Blockers
- None identified

### Risks
- **Discourse Upgrades**: Discourse upgrades may affect outlet names; test after upgrades
- **Interleaving Logic**: Relies on staff tags; ensure moderation conventions are followed
- **Deep Links**: Discourse topic pages still exist for deep links; theme minimises routing there
- **Subfolder Configuration**: Requires careful Nginx/proxy configuration for asset paths

---

## Documentation

### Project Documentation
- **Theme Documentation**: `docs/gp-voices-theme.md` — Theme scope, milestones, settings, file structure
- **Setup Guide**: `docs/gp-voices-import-setup.md` — Step-by-step installation and configuration guide

### LinkedIn Content Validation (Active Experiment)
- **LinkedIn Content Summary**: [`linkedin-content-summary.md`](./linkedin-content-summary.md) — Validation experiment tracking, strategy, criteria (4-6 week test)
- **LinkedIn Weekly Workflow**: [`linkedin-weekly-workflow.md`](./linkedin-weekly-workflow.md) — Reusable workflow for creating weekly LinkedIn posts (includes template, mentions, hashtags, image prompt)
- **LinkedIn Post Log**: [`linkedin-post-log.md`](./linkedin-post-log.md) — Track posts, metrics, and learnings
- **Weekly Post Template**: [`weekly-linkedin-post-template.md`](./weekly-linkedin-post-template.md) — Template to copy each week

### External References
- Discourse Developer Guides: https://meta.discourse.org/t/developer-guides-index/308036
- Discourse Admin Quick Start: https://www.phylobabble.org/t/discourse-admin-quick-start-guide/3/
- Discourse AI: https://meta.discourse.org/t/introducing-discourse-ai/262744
- Subfolder Setup: https://meta.discourse.org/c/sysadmin/23

---

## QA Checklist

### Functional Testing
- [ ] AI Summary shows bullets to anonymous users
- [ ] Full AI summary accessible to logged-in users
- [ ] "Comment" CTA targets Featured Thread correctly
- [ ] Posting to Featured Thread works
- [ ] New Topic available but de-emphasised
- [ ] News/Trending cards appear with correct badges and cadence
- [ ] Tag chips filter correctly
- [ ] Tag chips sticky on mobile
- [ ] Inline replies expand and collapse without leaving feed

### Accessibility Testing
- [ ] Focus order correct
- [ ] ARIA roles properly implemented
- [ ] 44px touch targets on mobile
- [ ] Dark mode contrast ratios meet WCAG AA

### Performance Testing
- [ ] LCP < 2s on 3G connection
- [ ] Lazy media loading implemented
- [ ] Mobile performance optimised

---

## Updates

### [2025-11-10] Week 1 LinkedIn Results & Validation Strategy
- **Week 1 Results**: 8 new followers, 8 comments, 2 saves - BUT most engagement from AI tool vendors, not GPs/practice managers
- **Critical Insight**: Engagement volume ≠ validation. Audience quality matters more than total reactions.
- **Validation Criteria Established**: 4-6 week test; success = GP/practice manager engagement (not vendor engagement)
- **Next Steps**: Collect news for Week 2 post; analyse follower/commenter profiles (GP vs vendor ratio)
- **Decision Rule**: If GP engagement proven after 4-6 weeks → build automation. If not → stop weekly posts.
- **Google Alerts Setup**: Configured 10 weekly email digests - 5 for NZ medical AI/healthtech news (primary: AI, healthtech, IT; secondary: GP, hospital, primary care, Medtech, Indici) + 5 for international GP AI innovations (global coverage)
- See `linkedin-content-summary.md` for full validation strategy and criteria

### [2025-11-08] Weekly LinkedIn News Curation Started
- Created weekly LinkedIn post curation workflow to test demand before building AI-powered weekly summaries
- Weekly posts curate 3-5 recent NZ medical news items from BPAC, NZ Doctor, Pharmac, HQSC, Ministry of Health, Medical Council, RNZCGP
- Format: Weekly Roundup (Format B) - posts test if GPs engage with curated news content
- **Strategy**: Manual curation first to validate demand; automation only if manual posts prove successful (4+ weeks of good metrics)
- **Priority Context**: Focus remains on revenue-generating projects (Medtech integration, R&D grant); LinkedIn content marketing is long-term play, not immediate revenue
- Template created: `weekly-linkedin-post-2025-11-08.md` — ready for news items to be added

### [2025-01-15] Project Initialisation
- Created project folder and PROJECT_SUMMARY.md
- Reviewed existing theme implementation in `discourse-theme/gp-voices/`
- Documented current status, components, and next steps
- Theme components are implemented; configuration and deployment pending

---

*Project Last Updated: [2025-11-10] - Google Alerts setup documented*

