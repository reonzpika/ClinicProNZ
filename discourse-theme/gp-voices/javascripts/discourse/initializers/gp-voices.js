import { apiInitializer } from "discourse/lib/api";

export default apiInitializer("0.13.1", (api) => {
  const settings = api.container.lookup("service:site-settings");
  const currentUser = api.getCurrentUser?.();
  const ajax = require("discourse/lib/ajax").ajax;
  const site = api.container.lookup("service:site");

  // Cache category slugs for routing
  const categorySlugCache = {};
  async function getCategorySlug(categoryId) {
    const id = Number(categoryId || 0);
    if (!id) return null;
    if (categorySlugCache[id]) return categorySlugCache[id];
    try {
      const data = await ajax(`/c/${id}/show.json`);
      const slug = data?.category?.slug;
      if (slug) {
        categorySlugCache[id] = slug;
        return slug;
      }
    } catch (e) {}
    return null;
  }

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

  // Do not de-emphasise New Topic globally anymore; CTA inserted in-list

  // Restrict discovery feed to General category only
  api.modifyClass("model:topic-list", {
    pluginId: "gp-voices",
    setList(list, opts) {
      this._super(list, opts);
      try {
        const generalId = Number(settings["general_category_id"] || 0);
        if (!generalId || !Array.isArray(this.topics)) return;
        this.topics = this.topics.filter((t) => t?.category_id === generalId);
      } catch (e) {}
    },
  });

  // Force non-staff composer to General and hide category chooser for non-staff
  api.modifyClass("controller:composer", {
    pluginId: "gp-voices",
    open(opts) {
      const isStaff = site?.isStaff || site?.is_admin || site?.is_moderator;
      if (!isStaff) {
        opts = opts || {};
        opts.categoryId = Number(settings["general_category_id"] || 0) || opts.categoryId;
      }
      return this._super(opts);
    },
  });

  api.modifyClass("component:composer", {
    pluginId: "gp-voices",
    didInsertElement() {
      this._super(...arguments);
      const isStaff = site?.isStaff || site?.is_admin || site?.is_moderator;
      if (!isStaff) {
        const chooser = this.element.querySelector(".composer-fields .category-input");
        if (chooser) chooser.style.display = "none";
      }
    },
  });

  // Insert New Topic CTA after N General posts on discovery/latest
  api.decorateWidget("topic-list-item:after", (helper) => {
    try {
      const generalId = Number(settings["general_category_id"] || 0);
      const insertAfter = Number(settings["general_cta_after_n"] || 10);
      const idx = helper?.attrs?.index;
      const topic = helper?.attrs?.topic;
      if (!topic || topic.category_id !== generalId) return;
      if (typeof idx !== "number") return;
      if (idx + 1 !== insertAfter) return;
      return helper.h("div.gp-card p-2 mt-2 mb-2 text-center", [
        helper.h(
          "button.btn.btn-primary",
          {
            onclick: () => {
              if (!currentUser) {
                helper.get("router").transitionTo("login");
                return;
              }
              api.openComposer({ action: "createTopic", categoryId: generalId });
            },
          },
          "Start a new post"
        ),
      ]);
    } catch (e) {}
  });

  // Bottom tab bar: Home, News, Hot, +
  if (String(settings["enable_bottom_tab_bar_mobile"]) === "true") {
    api.decorateWidget("below-site-header:after", () => {
      return api.h("div.gp-mobile-tabbar", [
        api.h("button", { class: "btn-flat", onclick: () => api.router.transitionTo("discovery.latest") }, "Home"),
        api.h(
          "button",
          {
            class: "btn-flat",
            onclick: async () => {
              const id = Number(settings["news_category_id"] || 0);
              const slug = await getCategorySlug(id);
              if (id && slug) {
                window.location.href = `/c/${slug}/${id}`;
              }
            },
          },
          "News"
        ),
        api.h(
          "button",
          {
            class: "btn-flat",
            onclick: async () => {
              const id = Number(settings["featured_category_id"] || 0);
              const slug = await getCategorySlug(id);
              if (id && slug) {
                window.location.href = `/c/${slug}/${id}`;
              }
            },
          },
          "Hot"
        ),
        api.h(
          "button",
          {
            class: "btn-primary",
            onclick: () => {
              const generalId = Number(settings["general_category_id"] || 0);
              if (!currentUser) {
                api.router.transitionTo("login");
                return;
              }
              api.openComposer({ action: "createTopic", categoryId: generalId });
            },
            title: "New Topic",
          },
          "+"
        ),
      ]);
    });
  }
});
