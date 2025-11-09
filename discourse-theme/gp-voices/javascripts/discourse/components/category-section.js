import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { ajax } from 'discourse/lib/ajax';

export default class CategorySection extends Component {
  @tracked topics = [];
  @tracked categorySlug = null;

  constructor() {
    super(...arguments);
    setTimeout(() => this.load(), 0);
  }

  async load() {
    const categoryId = Number(this.args.categoryId || 0);
    const count = Number(this.args.count || 1);
    if (!categoryId) {
 return;
}
    try {
      const show = await ajax(`/c/${categoryId}/show.json`);
      const slug = show?.category?.slug;
      if (!slug) {
 return;
}
      this.categorySlug = slug;

      const list = await ajax(`/c/${slug}/${categoryId}/l/latest.json?per_page=${count}`);
      const items = list?.topic_list?.topics || [];
      // Shape minimal data for rendering
      this.topics = items.slice(0, count).map(t => ({
        id: t.id,
        fancy_title: t.fancy_title || t.title,
        created_at: t.created_at || t.last_posted_at,
        reply_count: t.reply_count || 0,
        created_by: { username: t.last_poster_username, avatar_template: t.avatar_template },
      }));
    } catch (e) {}
  }
}
