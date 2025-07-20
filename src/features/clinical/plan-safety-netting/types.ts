export type PlanCategory = {
  id: string;
  title: string;
  items: string[];
};

export type SelectedPlanItem = {
  id: string;
  categoryId: string;
  categoryTitle: string;
  item: string;
};

export type PlanCartState = {
  selectedItems: SelectedPlanItem[];
  addItem: (categoryId: string, categoryTitle: string, item: string) => void;
  removeItem: (id: string) => void;
  clearAll: () => void;
  hasItem: (categoryId: string, item: string) => boolean;
  getItemsForCategory: (categoryId: string) => SelectedPlanItem[];
  getTotalCount: () => number;
};
