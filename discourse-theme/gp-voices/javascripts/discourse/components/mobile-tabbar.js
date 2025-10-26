import Component from "@glimmer/component";
import { service } from "@ember/service";
import { action } from "@ember/object";
import { ajax } from "discourse/lib/ajax";

export default class MobileTabbar extends Component {
  @service router;
  @service currentUser;

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
    const id = Number(this.args.siteSettings?.news_category_id || 0);
    const slug = await this.getSlug(id);
    if (id && slug) window.location.href = `/c/${slug}/${id}`;
  }

  @action async toHot() {
    const id = Number(this.args.siteSettings?.featured_category_id || 0);
    const slug = await this.getSlug(id);
    if (id && slug) window.location.href = `/c/${slug}/${id}`;
  }

  @action newTopic() {
    const generalId = Number(this.args.siteSettings?.general_category_id || 0);
    if (!this.currentUser) {
      this.router.transitionTo("login");
      return;
    }
    window.Discourse?.__container__?.lookup("controller:composer")?.open({ action: "createTopic", categoryId: generalId });
  }
}
