import Component from "@glimmer/component";
import { inject as service } from "@ember/service";
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";
import { ajax } from "discourse/lib/ajax";

export default class AiSummaryCard extends Component {
  @service router;
  @service currentUser;

  @tracked bullets = [];
  @tracked updatedAt = null;

  constructor() {
    super(...arguments);
    // Best-effort load; tolerate missing topic or network
    setTimeout(() => this.loadSummary(), 0);
  }

  async loadSummary() {
    const topicId = Number(this.args.topicId || 0);
    if (!topicId) return;
    try {
      const data = await ajax(`/t/${topicId}.json`);
      const createdAt = data?.created_at || data?.post_stream?.posts?.[0]?.created_at;
      this.updatedAt = createdAt ? new Date(createdAt).toLocaleDateString() : "";
      const cooked = data?.post_stream?.posts?.[0]?.cooked || "";
      // Naive extraction of <li> bullets; fallback to paragraph split
      const liMatches = cooked.match(/<li>([\s\S]*?)<\/li>/g) || [];
      let bullets = liMatches
        .map((li) => li.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim())
        .filter(Boolean);
      if (bullets.length === 0) {
        const text = cooked.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
        bullets = text.split(/[•\-]\s+/).filter(Boolean).slice(0, 5);
      }
      this.bullets = bullets;
    } catch (e) {
      // Silent fail; leave empty
    }
  }

  @action
  viewFull() {
    const topicId = Number(this.args.topicId || 0);
    if (!this.currentUser) {
      this.router.transitionTo("login");
      return;
    }
    if (topicId) {
      this.router.transitionTo("topic", topicId);
    }
  }
}
