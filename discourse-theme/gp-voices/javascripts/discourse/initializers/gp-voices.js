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
  // Hide composer category chooser for non-staff via CSS below

  // CTA moved to connector component in discovery-below

  // Bottom tab bar implemented via connector component now
});
