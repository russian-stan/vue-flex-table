export type SortDir = 'asc' | 'desc';
export type ColType = 'text' | 'number' | 'date' | 'option';

export interface Header {
  text: string;
  row_key: string;
  order?: number;
  sort_dir?: SortDir;
  col_type?: ColType
}

export interface Row {
  [key: string]: string | number;
  count?: string;
}

export interface VTable {
  label: string;
  headers: Header[];
  rows: Row[];
}
