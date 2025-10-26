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
  @tracked latestTopicId = 0;
  @tracked categorySlug = null;

  constructor() {
    super(...arguments);
    // Best-effort load; tolerate missing topic or network
    setTimeout(() => this.loadSummary(), 0);
  }

  async loadSummary() {
    const categoryId = Number(this.args.categoryId || 0);
    if (!categoryId) return;
    try {
      // Resolve category slug
      const show = await ajax(`/c/${categoryId}/show.json`);
      const slug = show?.category?.slug;
      if (!slug) return;
      this.categorySlug = slug;

      // Get latest topic in category
      const list = await ajax(`/c/${slug}/${categoryId}/l/latest.json?per_page=1`);
      const topic = list?.topic_list?.topics?.[0];
      if (!topic) return;
      this.latestTopicId = topic.id;

      // Fetch first post content for summary
      const data = await ajax(`/t/${topic.id}.json`);
      const createdAt = data?.post_stream?.posts?.[0]?.created_at || data?.created_at;
      this.updatedAt = createdAt ? new Date(createdAt).toLocaleDateString() : "";
      const cooked = data?.post_stream?.posts?.[0]?.cooked || "";
      // Extract <li> bullets; fallback to simple split
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
    if (!this.currentUser) {
      this.router.transitionTo("login");
      return;
    }
    if (this.latestTopicId) {
      this.router.transitionTo("topic", this.latestTopicId);
    }
  }
}
