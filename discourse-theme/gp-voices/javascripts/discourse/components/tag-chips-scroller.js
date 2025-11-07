import Component from "@glimmer/component";
import { inject as service } from "@ember/service";
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";

export default class TagChipsScroller extends Component {
  @service router;
  @tracked activeTag = "";

  get allowedTags() {
    const allowed = this.args.allowed || [];
    if (Array.isArray(allowed)) return allowed;
    if (typeof allowed === "string") return allowed.split(",").map((t) => t.trim()).filter(Boolean);
    return [];
  }

  @action
  selectTag(tag) {
    this.activeTag = tag;
    if (!tag) {
      this.router.transitionTo("discovery.latest");
    } else {
      this.router.transitionTo("tag.show", tag);
    }
  }

  @action
  openMore() {
    // For v1, navigate to /tags; can be replaced with a sheet later
    this.router.transitionTo("tags");
  }
}
