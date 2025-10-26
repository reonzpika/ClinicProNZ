import Component from "@glimmer/component";
import { service } from "@ember/service";
import { action } from "@ember/object";
import { ajax } from "discourse/lib/ajax";
import { getOwner } from "discourse-common/lib/get-owner";

export default class DesktopTopnav extends Component {
  @service router;
  @service currentUser;
  @service siteSettings;

  async getSlug(id) {
    const cid = Number(id || 0);
    if (!cid) return null;
    try {
      const data = await ajax(`/c/${cid}/show.json`);
      return data?.category?.slug;
    } catch (e) {
      return null;
    }
  }

  @action toHome() {
    this.router.transitionTo("discovery.latest");
  }

  @action async toNews() {
    const id = Number(this.siteSettings?.news_category_id || 0);
    const slug = await this.getSlug(id);
    if (id && slug) window.location.href = `/c/${slug}/${id}`;
  }

  @action async toHot() {
    const id = Number(this.siteSettings?.featured_category_id || 0);
    const slug = await this.getSlug(id);
    if (id && slug) window.location.href = `/c/${slug}/${id}`;
  }

  @action newTopic() {
    const generalId = Number(this.siteSettings?.general_category_id || 0);
    if (!this.currentUser) {
      this.router.transitionTo("login");
      return;
    }
    const owner = getOwner(this);
    owner.lookup("controller:composer")?.open({ action: "createTopic", categoryId: generalId });
  }
}
