import Component from "@glimmer/component";
import { action } from "@ember/object";
import { service } from "@ember/service";

export default class HomepageCta extends Component {
  @service currentUser;
  @service router;

  get shouldShow() {
    const generalId = Number(this.args.siteSettings?.general_category_id || 0);
    const insertAfter = Number(this.args.siteSettings?.general_cta_after_n || 10);
    const list = this.args?.model?.topics || [];
    const idx = list.findIndex((t) => t?.category_id === generalId) + 1;
    return generalId && insertAfter && idx === insertAfter;
  }

  @action
  startNew() {
    const generalId = Number(this.args.siteSettings?.general_category_id || 0);
    if (!this.currentUser) {
      this.router.transitionTo("login");
      return;
    }
    // openComposer available via api only; route to new-topic composer
    this.router.transitionTo("discovery.latest");
    window.Discourse?.__container__?.lookup("controller:composer")?.open({ action: "createTopic", categoryId: generalId });
  }
}
