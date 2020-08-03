export type SortDir = 'asc' | 'desc' | null;
export type ColType = 'text' | 'number' | 'date' | 'select' | 'checkbox';

export interface Header {
  text: string;
  row_key: string;
  order?: number;
  sort_dir?: SortDir;
  sortable?: boolean;
  filterable?: boolean;
  col_type?: ColType;
}

export interface Row {
  [key: string]: string | number | boolean;
}

export interface VTable {
  label: string;
  headers: Header[];
  rows: Row[];
}

export interface SelectsData {
  [key: string]: {
    text: string;
    id: string;
  }[];
}

export interface FooterProps {
  itemsPerPageOptions: number[];
  itemsPerPageText: string;
  showFirstLastPage: boolean;
}

export interface FooterModel {
  itemsPerPage: number;
  curPage: number;
}
