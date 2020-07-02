export type SortDir = 'asc' | 'desc';
export type ColType = 'text' | 'number' | 'date' | 'select';

export interface Header {
  text: string;
  row_key: string;
  order?: number;
  sort_dir?: SortDir;
  sortable?: boolean;
  col_type?: ColType;
}

export interface Row {
  [key: string]: string | number;
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
