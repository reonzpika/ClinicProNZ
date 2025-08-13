export type NzMedSearchItem = {
  title: string;
  url: string;
  site?: string;
  snippet?: string;
  rank?: number;
};

export type NzMedSearchResponse = {
  items: NzMedSearchItem[];
  page?: number;
  nbPages?: number;
};