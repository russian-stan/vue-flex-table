export interface Header {
  text: string;
  rowKey: string;
  order: number;
}

export interface Row {
  brand: string;
  color: string;
  type: string;
  year: string;
  uid: string;
}

export interface VTable {
  label: string;
  headers: Header[];
  rows: Row[];
}
