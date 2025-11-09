import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { ajax } from 'discourse/lib/ajax';

export default class InlineReplies extends Component {
  @tracked previewReplies = [];
  @tracked expanded = false;

  constructor() {
    super(...arguments);
    // Load last few replies when instantiated
    setTimeout(() => this.loadPreview(), 0);
  }

  get topicId() {
    return Number(this.args.topicId || 0);
  }

  async loadPreview() {
    const topicId = this.topicId;
    if (!topicId) {
 return;
}
    try {
      const data = await ajax(`/t/${topicId}.json`);
      const posts = data?.post_stream?.posts || [];
      const tail = posts.slice(-2);
      this.previewReplies = tail.map(p => ({
        id: p.id,
        created_at: p.created_at,
        excerpt: (p.excerpt || p.cooked || '').replace(/<[^>]+>/g, ' ').trim().slice(0, 200),
        user: { username: p.username, avatar_template: p.avatar_template },
      }));
    } catch (e) {}
  }

  @action
  async expandMore() {
    if (this.expanded) {
 return;
}
    this.expanded = true;
    // For v1, route to topic but remain in same tab; future: inline paginator
    if (this.topicId) {
      window.location.href = `/t/${this.topicId}`;
    }
  }
}
