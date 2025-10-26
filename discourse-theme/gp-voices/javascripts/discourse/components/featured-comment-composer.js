import Component from "@glimmer/component";
import { inject as service } from "@ember/service";
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";
import Composer from "discourse/models/composer";

export default class FeaturedCommentComposer extends Component {
  @service currentUser;
  @service siteSettings;
  @service composer;
  @service router;

  @tracked replyText = "";

  get featuredTopicId() {
    return Number(this.args.topicId || 0);
  }

  @action
  openFullComposer() {
    if (!this.currentUser) {
      this.router.transitionTo("login");
      return;
    }
    if (this.featuredTopicId) {
      this.composer.open({
        action: Composer.REPLY,
        draftKey: `topic_${this.featuredTopicId}`,
        topicId: this.featuredTopicId,
      });
    }
  }

  @action
  async postReply() {
    if (!this.currentUser) {
      this.router.transitionTo("login");
      return;
    }
    if (!this.replyText?.trim() || !this.featuredTopicId) return;

    try {
      await this.composer.open({
        action: Composer.REPLY,
        draftKey: `topic_${this.featuredTopicId}`,
        topicId: this.featuredTopicId,
        reply: this.replyText,
      });
      this.replyText = "";
    } catch (e) {
      // ignore
    }
  }

  @action
  openNewTopic() {
    if (!this.currentUser) {
      this.router.transitionTo("login");
      return;
    }
    this.composer.open({ action: Composer.CREATE_TOPIC });
  }
}
