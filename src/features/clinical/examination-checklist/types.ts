export type ExaminationType = {
  id: string;
  title: string;
  items: string[];
};

export type SelectedItem = {
  id: string;
  examTypeId: string;
  examTypeTitle: string;
  item: string;
};

export type FocusArea = 'search' | 'examTypes' | 'checklist' | 'cart' | 'actions';

export type ExaminationCartState = {
  selectedItems: SelectedItem[];
  addItem: (examTypeId: string, examTypeTitle: string, item: string) => void;
  removeItem: (id: string) => void;
  clearAll: () => void;
  hasItem: (examTypeId: string, item: string) => boolean;
  getItemsForExamType: (examTypeId: string) => SelectedItem[];
  getTotalCount: () => number;
};
