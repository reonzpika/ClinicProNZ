import { apiInitializer } from "discourse/lib/api";

export default apiInitializer("0.13.1", (api) => {
  const settings = api.container.lookup("service:site-settings");
  const currentUser = api.getCurrentUser?.();

  // Add data attribute for CSS-controlled category hiding
  try {
    const body = document.body;
    if (body) {
      body.classList.add("theme-ClinicPro-GP-Voices");
      body.setAttribute(
        "data-hide-category-ui",
        String(settings["hide_category_ui"]) === "true" ? "true" : "false"
      );
    }
  } catch (e) {}

  // De-emphasise New Topic if enabled
  if (String(settings["deemphasise_new_topic"]) === "true") {
    api.modifyClass("component:discovery-topics-list", {
      pluginId: "gp-voices",
      didInsertElement() {
        this._super(...arguments);
        const btns = document.querySelectorAll(
          '.navigation-container .nav-pills .btn[title="New Topic"], .create-topic'
        );
        btns.forEach((b) => b.classList.add("is-hidden"));
      },
    });
  }

  // Interleave admin items scaffold
  api.modifyClass("model:topic-list", {
    pluginId: "gp-voices",
    setList(list, opts) {
      this._super(list, opts);
      try {
        const newsTag = settings["news_tag"];
        const trendingTag = settings["trending_tag"];
        const freq = Number(settings["interleave_frequency"] || 6);
        if (!Array.isArray(this.topics) || !newsTag || !trendingTag) return;
        const adminItems = this.topics.filter((t) =>
          t.tags?.includes(newsTag) || t.tags?.includes(trendingTag)
        );
        if (adminItems.length === 0) return;
        let injected = 0;
        for (let i = freq; i < this.topics.length; i += freq) {
          const pick = adminItems[injected % adminItems.length];
          if (pick) {
            this.topics.splice(i, 0, pick);
            injected++;
          }
        }
      } catch (e) {}
    },
  });

  // Bottom tab bar toggle
  if (String(settings["enable_bottom_tab_bar_mobile"]) === "true") {
    api.decorateWidget("below-site-header:after", () => {
      return api.h("div.gp-mobile-tabbar", [
        api.h("button", { class: "btn-flat", onclick: () => api.router.transitionTo("discovery.latest") }, "Home"),
        api.h("button", { class: "btn-flat", onclick: () => api.router.transitionTo("tags") }, "Tags"),
        api.h(
          "button",
          {
            class: "btn-primary",
            onclick: () => {
              const featuredId = Number(settings["featured_topic_id"] || 0);
              if (featuredId) {
                api.openComposer({ action: "reply", topicId: featuredId });
              } else {
                api.openComposer({ action: "createTopic" });
              }
            },
          },
          "Comment"
        ),
        api.h("button", { class: "btn-flat", onclick: () => api.router.transitionTo("userNotifications") }, "Alerts"),
        api.h("button", { class: "btn-flat", onclick: () => api.router.transitionTo("userActivity", { username: currentUser?.username }) }, "Profile"),
      ]);
    });
  }
});
