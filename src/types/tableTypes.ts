export type SortDir = 'asc' | 'desc';

export interface Header {
  text: string;
  row_key: string;
  order?: number;
  sort_dir?: SortDir;
}

export interface Row {
  brand: string;
  color: string;
  type: string;
  year: string;
  uid: string;
  count?: string;
}

export interface VTable {
  label: string;
  headers: Header[];
  rows: Row[];
}
