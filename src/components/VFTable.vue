<template>
  <div class="vf-table">

    <div class="table-wrapper">
      <div v-if="tables.length > 1" class="table-tabs">
        <button
         v-for="(table, index) in tables"
         :key="table.label"
         @click="tab = index"
         class="table-tab"
         :class="{'active': tab === index}"
        >
          {{table.label}}
        </button>
      </div>

      <table>
        <colgroup v-if="!isNoHeaders">
          <col
           v-for="header in tablesModel[tab].headers"
           :key="header.row_key"
          >
        </colgroup>

        <!--======================= HEADERS =======================-->
        <thead v-if="!isNoHeaders">
        <tr
        >
          <th
           v-for="header in tablesModel[tab].headers"
           :key="header.row_key"
           :style="{'width': calculateColumnWidth(header.row_key)}"
           :class="{
             'active': header.sortable && header.row_key === currentColumnName[tab],
             'pointer': header.sortable
           }"
           ref="headers"
           :draggable="draggable"
           @click.self="header.sortable ? sortBy(header.row_key) : null"
           @dragstart="draggable ? onDragStart($event, header.order) : null"
           @dragenter.prevent="draggable ? onDragEnter($event) : null"
           @dragover.prevent="draggable ? onDragOver($event) : null"
           @dragleave.prevent="draggable ? onDragLeave($event) : null"
           @drop.stop="draggable ? onDrop($event, header.order) : null"
           @dragend="draggable ? onDragEnd($event) : null"
          >
            {{header.text}}

            <div
             v-if="header.sortable
             && currentColumnName[tab] === header.row_key
             && filteredItems.length > 1"
             class="sort-buttons"
            >
              <!--ASC-BTN-->
              <button
               class="sort-btn"
               @click="header.sortable ? changeSortDirForCurCol(header.row_key, 'asc') : null"
              >
                <i
                 class="material-icons"
                 :class="{'active': header.sort_dir === 'asc'}"
                >
                  arrow_drop_up
                </i>
              </button>

              <!--DESC-BTN-->
              <button
               class="sort-btn"
               @click="header.sortable ? changeSortDirForCurCol(header.row_key, 'desc') : null"
              >
                <i
                 class="material-icons"
                 :class="{'active': header.sort_dir === 'desc'}"
                >
                  arrow_drop_down
                </i>
              </button>
            </div>
          </th>
        </tr>
        </thead>

        <tbody>
        <!--======================= ROWS =======================-->
        <tr v-if="columnSearch">
          <td
           v-for="(searchInput, index) in tablesModel[tab].headers"
           :key="index"
          >
            <div v-if="searchInput.filterable" class="search-column-input">
              <i class="material-icons search-column-icon">search</i>
              <input
               class="table-input table-input--column-search"
               placeholder="search in column..."
               type="text"
               v-model.trim="columnSearchValues[tab][searchInput.row_key]"
              >
            </div>
          </td>
        </tr>
        <template v-if="filteredItems.length">
          <tr
           v-for="row in sortedItems"
           :key="row.uid"
          >
            <td
             v-for="key in rowKeys"
             :key="key"
            >
              <input
               v-if="findColType(key) === 'number'"
               class="table-input table-input--number"
               type="number"
               v-model="row[key]"
              >

              <input
               v-else-if="findColType(key) === 'text'"
               class="table-input table-input--text"
               type="text"
               v-model="row[key]"
              >


              <input
               v-else-if="findColType(key) === 'date'"
               class="table-input table-input--date"
               type="date"
               v-model="row[key]"
              >


              <input
               v-else-if="findColType(key) === 'checkbox'"
               class="table-checkbox"
               type="checkbox"
               v-model="row[key]"
              >

              <select
               v-else-if="findColType(key) === 'select' && selectsData[key]"
               class="table-input table-input--select"
               v-model="row[key]"
              >
                <option disabled value="">Choice an option</option>
                <option v-for="option in selectsData[key]" :value="option.id">
                  {{option.text}}
                </option>
              </select>

              <template v-else>
                {{row[key]}}
              </template>
            </td>
          </tr>
        </template>
        <template v-if="!filteredItems.length">
          <tr>
            <td class="no-match" :colspan="tablesModel[tab].headers.length">
              {{isNoData ? noDataText : noResultsText}}
            </td>
          </tr>
        </template>

        </tbody>
      </table>

      <div v-if="!hideDefaultFooter" class="table-footer">
        <div class="rows-count">

          <div class="items-select">
            <label class="items-count-label" for="items-count">Rows per page:</label>
            <select
             v-model.number="footerModel[tab].itemsPerPage"
             id="items-count"
             class="table-input table-input--items-count"
            >
              <option v-for="count in footerProps.itemsPerPageOptions" :key="count">{{count}}</option>
            </select>
          </div>

          <span class="items-per-page">
            1-5 of {{tablesModel[tab].rows.length}}
          </span>
        </div>
        <div class="items-buttons">
          <button class="item-button">
            <i class="material-icons">chevron_left</i>
          </button>
          <button class="item-button">
            <i class="material-icons">chevron_right</i>
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Ref, Vue } from 'vue-property-decorator';
import { ColType, Header, Row, SelectsData, SortDir, FooterProps, FooterModel, VTable } from '@/types/tableTypes';
import { copyDeep } from '@/helpers/copyDeep';

@Component
export default class VFTable extends Vue {
  @Prop({
    type: Array, default() {
      return [
        {
          label: '',
          headers: [],
          rows: [],
        },
      ]
    },
  }) private readonly tables!: Array<VTable>;
  @Prop({
    type: Object, default() {
      return {}
    },
  }) private readonly selectsData!: SelectsData;
  @Prop({
    type: Object, default() {
      return {
        itemsPerPageOptions: [10],
        itemsPerPageText: 'Rows per page',
        showFirstLastPage: true,
      }
    },
  }) private readonly footerProps!: FooterProps;
  @Prop({ type: String, default: '' }) private readonly search!: string;
  @Prop({ type: Boolean, default: false }) private readonly ordered!: boolean;
  @Prop({ type: Boolean, default: false }) private readonly countable!: boolean;
  @Prop({ type: Boolean, default: false }) private readonly draggable!: boolean;
  @Prop({ type: Boolean, default: false }) private readonly columnSearch!: boolean;
  @Prop({ type: Boolean, default: false }) private readonly hideDefaultFooter!: boolean;
  @Prop({ type: String, default: 'No data to display' }) private readonly noDataText!: string;
  @Prop({ type: String, default: 'No matching records found' }) private readonly noResultsText!: string;
  @Ref('headers') readonly headers!: HTMLTableHeaderCellElement[];

  tab = 0;
  itemsPerPage: number = this.footerProps.itemsPerPageOptions[0];
  footerModel: Array<FooterModel> = [];
  tablesModel: Array<VTable> = [];
  currentColumnName: string[] = [];
  columnSearchValues: { [key: string]: string }[] = [];
  currentColumnDir: SortDir = 'asc';

  created() {
    // 1. Clone data
    this.tablesModel = copyDeep<VTable[]>(this.tables);

    // 2. OPTIONAL: Add column count and number {count: number} for each row in table
    if (this.countable) this.addCount();

    // 3. OPTIONAL: Sort columns by order
    if (this.ordered) this.sortColumnsByOrder();

    // 4. Add default {sort_dir: 'asc'} for sorting
    this.addSortDirToRow();

    // 5. create search model for dropdowns
    this.createColumnsSearchModel();

    // 6. OPTIONAL Set footer model
    if (!this.hideDefaultFooter) this.createFooterModel();
  }

  onDragStart(evt: DragEvent, targetIndex: number) {
    (evt.target! as HTMLTableHeaderCellElement).style.opacity = '0.7';
    evt.dataTransfer!.effectAllowed = 'move';
    evt.dataTransfer!.setData('targetIndex', targetIndex.toString());
  }

  onDragEnter(evt: DragEvent) {
    (evt.target! as HTMLTableHeaderCellElement).classList.add('drag-dest')
  }

  onDragOver(evt: DragEvent) {
    evt.dataTransfer!.dropEffect = 'move';
  }

  onDragLeave(evt: DragEvent) {
    (evt.target! as HTMLTableHeaderCellElement).classList.remove('drag-dest');
  }

  onDrop(evt: DragEvent, destinationIndex: number) {
    const targetIndex = evt.dataTransfer!.getData('targetIndex');
    this.swapColumns(+targetIndex, destinationIndex)
  }

  onDragEnd(evt: DragEvent) {
    (evt.target! as HTMLTableHeaderCellElement).style.opacity = '';
    this.headers.forEach(header => {
      header.classList.remove('drag-dest')
    });
  }

  swapColumns(targetIndex: number, destinationIndex: number) {
    const target = this.tablesModel[this.tab].headers.find(col => col.order === targetIndex);
    const destination = this.tablesModel[this.tab].headers.find(col => col.order === destinationIndex);
    if (target && destination && targetIndex !== destinationIndex) {
      target.order = destinationIndex;
      destination.order = targetIndex;
      if (this.ordered) this.sortColumnsByOrder();
    }
  }

  addCount(): void {
    const order = this.ordered ? { order: 0 } : {};
    this.tablesModel.forEach(table => table.headers.push({ text: '№', row_key: 'count', sortable: true, ...order }));
    this.tablesModel.forEach(table => table.rows.forEach((row, index) => row.count = `${index + 1}`));
  }

  calculateColumnWidth(rowKey: string): string {
    const countColumnWidth = 7;
    const columnsCount = this.tablesModel[this.tab].headers.length;
    if (this.ordered) {
      if (rowKey === 'count') return countColumnWidth + '%';
      return ((100 - countColumnWidth) / (columnsCount - 1)) + '%';
    }
    return (100 / columnsCount) + '%';
  }

  sortColumnsByOrder(): void {
    this.tablesModel.forEach(table => table.headers.sort((a, b) => {
      if (a.hasOwnProperty('order') && b.hasOwnProperty('order')) {
        return a.order! - b.order!;
      } else {
        return 0;
      }
    }));
  }

  addSortDirToRow(): void {
    this.tablesModel.forEach(table => table.headers.forEach(header => {
      header.sortable ? header.sort_dir = 'asc' : null;
    }));
  }

  createColumnsSearchModel(): void {
    this.tablesModel.forEach((table, index) => {
      if (table.headers.some(header => header.hasOwnProperty('filterable'))) {
        this.columnSearchValues.push({})
      }
      table.headers.forEach(header => {
        if (header.filterable) {
          this.$set(this.columnSearchValues[index], `${[header.row_key]}`, '')
        }
      })
    });
  }

  createFooterModel() {
    this.tablesModel.forEach(() => {
      this.footerModel.push({
        itemsPerPage: this.footerProps.itemsPerPageOptions[0],
        curPage: 1,
      })
    });
  }

  get isNoData(): boolean {
    return !Boolean(this.tables[this.tab].rows?.length);
  }

  get isNoHeaders(): boolean {
    return !Boolean(this.tables[this.tab].headers?.length);
  }

  get rowKeys(): Array<string> {
    return this.tablesModel[this.tab].headers.reduce((acc: Array<string>, header: Header) => {
      const prop = Object.keys(header).find(prop => prop === 'row_key');
      if (prop && prop === 'row_key') acc.push(header[prop]);
      return acc;
    }, [])
  }

  get isColumnFilterApplied(): boolean {
    return Object.values(this.columnSearchValues[this.tab]).some(Boolean);
  }

  get filteredColumns(): Row[] {
    if (this.isColumnFilterApplied) {
      let filtered: Row[] = [];
      let temp: Row[] = copyDeep<Row[]>(this.tablesModel[this.tab].rows);

      for (let prop in this.columnSearchValues[this.tab]) {
        if (!this.columnSearchValues[this.tab][prop]) continue;
        filtered = temp.filter(row => {
          return row[prop].toString().toLowerCase().includes(this.columnSearchValues[this.tab][prop].toLowerCase())
        })
        temp = filtered;
      }
      return filtered;
    }
    return this.tablesModel[this.tab].rows;
  }

  get filteredItems(): Row[] {
    if (this.search) {
      return this.filteredColumns.filter(item => {
        return Object.values(item).some(item => item.toString().toLowerCase().includes(this.search.toLowerCase()))
      })
    }
    return this.filteredColumns;
  }

  get sortedItems(): Row[] {
    if (this.currentColumnDir && this.rowKeys.includes(this.currentColumnName[this.tab])) {
      return this.filteredItems.sort((a, b) => {
        const modifier = this.currentColumnDir === 'asc' ? 1 : -1;

        const x = a[this.currentColumnName[this.tab] as keyof Row]!.toString().trim().toLowerCase();
        const y = b[this.currentColumnName[this.tab] as keyof Row]!.toString().trim().toLowerCase();

        if (x < y) return -1 * modifier;
        if (x > y) return 1 * modifier;
        return 0;
      });
    }
    return this.filteredItems;
  }

  findColForSort(): Header {
    return this.tablesModel[this.tab].headers
      .find(header => header.row_key === this.currentColumnName[this.tab])!;
  }

  sortBy(colName: string): void {
    if (this.currentColumnName[this.tab] !== colName) {
      this.$set(this.currentColumnName, this.tab, colName);
      this.currentColumnDir = this.findColForSort()!.sort_dir || 'asc';
    }
  }

  changeSortDirForCurCol(colName: string, dir: SortDir): void {
    this.currentColumnDir = dir;
    this.currentColumnName[this.tab] = colName;
    this.findColForSort()!.sort_dir = dir;
  }

  findColType(key: string): ColType | undefined {
    const row = this.tablesModel[this.tab].headers.find(col => col.row_key === key);
    if (row) return row.hasOwnProperty('col_type') ? row['col_type'] : undefined;
    return undefined;
  }
}
</script>

<style scoped lang="scss">
  @import "./src/styles/vf-table-styles";
</style>
