<template>
  <div class="vf-table">
    <div class="table-wrapper">
      <table>

        <!--======================= COLGROUP =======================-->
        <colgroup v-if="!isNoHeaders">
          <col
           v-for="header in tablesModel[tab].headers"
           :key="header.row_key"
           :style="{'width': calculateColumnWidth(header.row_key)}"
          >
        </colgroup>

        <!--======================= HEADERS =======================-->
        <thead class="table-header" v-if="!isNoHeaders">
        <tr
        >
          <th
           v-for="header in tablesModel[tab].headers"
           :key="header.row_key"
           :class="{
             'active': header.sortable && header.row_key === currentColumnName[tab],
             'pointer': header.sortable,
             'hidden': selectedColumnsModel.length ?
               !selectedColumnsModel[tab].includes(header.row_key)
               : !rowKeys.includes(header.row_key),
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

            <span
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
            </span>
          </th>
        </tr>
        </thead>

        <tbody>
        <!--======================= ROWS =======================-->
        <tr
         v-if="columnSearch && tablesModel[tab].rows.length > 1"
         class="column-search-row">
          <td
           v-for="(searchInput, index) in tablesModel[tab].headers"
           :key="index"
           :class="{
             'hidden': selectedColumnsModel.length ?
               !selectedColumnsModel[tab].includes(searchInput.row_key)
               : !rowKeys.includes(searchInput.row_key)
           }"
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
           v-for="(row, index) in slicedItems"
           :key="row.uid"
          >
            <td
             v-for="(key, idx) in rowKeys"
             :key="key"
             :class="{
             'hidden': selectedColumnsModel.length ?
               !selectedColumnsModel[tab].includes(key)
               : !rowKeys.includes(key)
           }"
            >
              <input
               v-if="tablesModel[tab].headers[idx].col_type === 'number'"
               class="table-input table-input--number"
               type="number"
               v-model="row[key]"
              >

              <input
               v-else-if="tablesModel[tab].headers[idx].col_type === 'text'"
               class="table-input table-input--text"
               type="text"
               v-model="row[key]"
              >


              <input
               v-else-if="tablesModel[tab].headers[idx].col_type === 'date'"
               class="table-input table-input--date"
               type="date"
               v-model="row[key]"
              >

              <template v-else-if="tablesModel[tab].headers[idx].col_type === 'checkbox'">
                <input
                 v-model="row[key]"
                 class="table-checkbox"
                 type="checkbox"
                 style="display: none"
                 :id="index"
                />
                <label :for="index" class="table-checkbox-label">
                  <span>
                    <svg width="12px" height="10px" viewbox="0 0 12 10">
                      <polyline points="1.5 6 4.5 9 10.5 1"></polyline>
                    </svg>
                  </span>
                  <!--Label name-->
                  <span></span>
                </label>
              </template>

              <select
               v-else-if="tablesModel[tab].headers[idx].col_type === 'select' && selectsData[key]"
               class="table-input table-input--select"
               v-model="row[key]"
              >
                <option disabled value="">Choice an option</option>
                <option v-for="option in selectsData[key]" :key="option.id" :value="option.id">
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
    </div>
    <!--======================= FOOTER =======================-->
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
            {{footerModel[tab].curPage + 1}}
            -
            {{!isPageUpDisabled ? footerModel[tab].curPage + footerModel[tab].itemsPerPage : sortedItems.length}}
            of {{sortedItems.length}}
          </span>
      </div>
      <div class="items-buttons">
        <button
         v-if="footerProps.showFirstLastPage"
         class="item-button"
         :class="{'disabled': isPageDownDisabled}"
         @click="goToPage('first')"
        >
          <i class="material-icons">first_page</i>
        </button>
        <button
         @click="pageDown"
         :disabled="isPageDownDisabled"
         :class="{'disabled': isPageDownDisabled}"
         class="item-button"
        >
          <i class="material-icons">chevron_left</i>
        </button>
        <button
         @click="pageUp"
         :disabled="isPageUpDisabled"
         :class="{'disabled': isPageUpDisabled}"
         class="item-button"
        >
          <i class="material-icons">chevron_right</i>
        </button>
        <button
         v-if="footerProps.showFirstLastPage"
         class="item-button"
         :class="{'disabled': isPageUpDisabled}"
         @click="goToPage('last')"
        >
          <i class="material-icons">last_page</i>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Ref, Vue } from 'vue-property-decorator';
import { ColType, Header, Row, SelectsData, SortDir, FooterProps, FooterModel, VTable } from '@/types/tableTypes';
import { cloneDeep } from 'lodash';

@Component
export default class VFTable extends Vue {
  @Prop({
    type: Array,
    default() {
      return [
        {
          label: '',
          headers: [],
          rows: [],
        },
      ];
    },
  }) private readonly tables!: Array<VTable>;

  @Prop({
    type: Object,
    default() {
      return {};
    },
  }) private readonly selectsData!: SelectsData;

  @Prop({
    type: Object,
    default() {
      return {
        itemsPerPageOptions: [10],
        itemsPerPageText: 'Rows per page',
        showFirstLastPage: false,
      };
    },
  }) private readonly footerProps!: FooterProps;

  @Prop({ type: Number, default: 0 }) private readonly tab!: number;
  @Prop({ type: String, default: '' }) private readonly search!: string;
  @Prop({ type: Boolean, default: false }) private readonly ordered!: boolean;
  @Prop({ type: Boolean, default: false }) private readonly countable!: boolean;
  @Prop({ type: Boolean, default: false }) private readonly draggable!: boolean;
  @Prop({ type: Boolean, default: false }) private readonly columnSearch!: boolean;
  @Prop({ type: Boolean, default: false }) private readonly hideDefaultFooter!: boolean;
  @Prop({ type: String, default: 'No data to display' }) private readonly noDataText!: string;
  @Prop({ type: String, default: 'No matching records found' }) private readonly noResultsText!: string;
  @Prop({
    type: Array,
    default() {
      return [];
    },
  }) private readonly selectedColumnsModel!: Array<string[]>;

  @Ref('headers') readonly headers!: HTMLTableHeaderCellElement[];

  footerModel: Array<FooterModel> = [];
  tablesModel: Array<VTable> = [];
  currentColumnName: string[] = [];
  columnSearchValues: { [key: string]: string }[] = [];
  currentColumnDir: SortDir = 'asc';

  created() {
    // 1. Clone data
    this.tablesModel = cloneDeep(this.tables);

    // 2. OPTIONAL: Add column count and number {count: number} for each row in table
    if (this.countable) this.addCount();

    // 3. OPTIONAL: Sort columns by order
    if (this.ordered) this.sortColumnsByOrder();

    // 4. Add default {sort_dir: 'asc'} for sorting
    this.addSortDirToRow();

    // 5. create search model
    this.createColumnsSearchModel();

    // 6. OPTIONAL Set footer model
    if (!this.hideDefaultFooter) this.createFooterModel();

    // 7. Emit cb keys array data for each table
    this.$emit('submitCheckboxesData', this.createCheckboxesData());

    // 8. Emit cb keys array list for each table
    this.$emit('submitColumnsKeys', this.createCheckboxesModelKeys());
  }

  get isNoData(): boolean {
    return !this.tables[this.tab].rows?.length;
  }

  get isNoHeaders(): boolean {
    return !this.tables[this.tab].headers?.length;
  }

  get rowKeys(): Array<string> {
    return this.tablesModel[this.tab].headers.reduce((acc: Array<string>, header: Header) => {
      const prop = Object.keys(header).find(prop => prop === 'row_key');
      if (prop && prop === 'row_key') acc.push(header[prop]);
      return acc;
    }, []);
  }

  createCheckboxesModelKeys(): Array<string[]> {
    return this.tablesModel.reduce((res: Array<string[]>, table) => {
      const headerKeys = table.headers.reduce((acc: string[], header) => {
        acc.push(header.row_key);
        return acc;
      }, []);
      res.push(headerKeys);
      return res;
    }, []);
  }

  createCheckboxesData(): Array<{ row_key: string; text: string }[]> {
    return this.tablesModel.reduce((res: Array<{ row_key: string; text: string }[]>, table) => {
      const cbData = table.headers.reduce((acc: { row_key: string; text: string }[], header) => {
        acc.push({
          row_key: header.row_key,
          text: header.text,
        });
        return acc;
      }, []);
      res.push(cbData);
      return res;
    }, []);
  }

  onDragStart(evt: DragEvent, targetIndex: number) {
    (evt.target! as HTMLTableHeaderCellElement).style.opacity = '0.7';
    evt.dataTransfer!.effectAllowed = 'move';
    evt.dataTransfer!.setData('targetIndex', targetIndex.toString());
  }

  onDragEnter(evt: DragEvent) {
    (evt.target! as HTMLTableHeaderCellElement).classList.add('drag-dest');
  }

  onDragOver(evt: DragEvent) {
    evt.dataTransfer!.dropEffect = 'move';
  }

  onDragLeave(evt: DragEvent) {
    (evt.target! as HTMLTableHeaderCellElement).classList.remove('drag-dest');
  }

  onDrop(evt: DragEvent, destinationIndex: number) {
    const targetIndex = evt.dataTransfer!.getData('targetIndex');
    this.swapColumns(+targetIndex, destinationIndex);
  }

  onDragEnd(evt: DragEvent) {
    (evt.target! as HTMLTableHeaderCellElement).style.opacity = '';
    this.headers.forEach(header => {
      header.classList.remove('drag-dest');
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
    this.tablesModel.forEach(table => table.headers.push({
      text: '№', row_key: 'count', sortable: true, ...order,
    }));
    this.tablesModel.forEach(table => {
      table.rows.forEach((row, index) => {
        row.count = `${index + 1}`;
      });
    });
  }

  calculateColumnWidth(rowKey: string): string {
    const countColumnWidth = 7;
    const columnsCount = this.tablesModel[this.tab].headers.length;
    if (this.ordered) {
      if (rowKey === 'count') return `${countColumnWidth}%`;
      return `${(100 - countColumnWidth) / (columnsCount - 1)}%`;
    }
    return `${100 / columnsCount}%`;
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

  sortColumnsByOrder(): void {
    this.tablesModel.forEach(table => table.headers.sort((a, b) => {
      if ('order' in a && 'order' in b) {
        return a.order! - b.order!;
      }
      return 0;
    }));
  }

  addSortDirToRow(): void {
    this.tablesModel.forEach(table => table.headers.forEach(header => {
      if (header.sortable) {
        header.sort_dir = 'asc';
      } else {
        header.sort_dir = null;
      }
    }));
  }

  createColumnsSearchModel(): void {
    this.tablesModel.forEach((table, index) => {
      if (table.headers.some(header => 'filterable' in header)) {
        this.columnSearchValues.push({});
      }
      table.headers.forEach(header => {
        if (header.filterable) {
          this.$set(this.columnSearchValues[index], `${[header.row_key]}`, '');
        }
      });
    });
  }

  createFooterModel(): void {
    this.tablesModel.forEach(() => {
      this.footerModel.push({
        itemsPerPage: this.footerProps.itemsPerPageOptions[0],
        curPage: 0,
      });
    });
  }

  get isColumnFilterApplied(): boolean {
    return Object.values(this.columnSearchValues[this.tab] || {}).some(Boolean);
  }

  get filteredColumns(): Row[] {
    if (this.isColumnFilterApplied) {
      let filtered: Row[] = [];
      let temp: Row[] = cloneDeep(this.tablesModel[this.tab].rows);

      Object.keys(this.columnSearchValues[this.tab]).forEach(prop => {
        if (!this.columnSearchValues[this.tab][prop]) return;
        filtered = temp.filter(row => row[prop]
          .toString()
          .toLowerCase()
          .includes(this.columnSearchValues[this.tab][prop].toLowerCase()));
        temp = filtered;
      });

      return filtered;
    }
    return this.tablesModel[this.tab].rows;
  }

  get filteredItems(): Row[] {
    if (this.search) {
      return this.filteredColumns
        .filter(item => Object.values(item).some(item => item.toString().toLowerCase().includes(this.search.toLowerCase())));
    }
    return this.filteredColumns;
  }

  get sortedItems(): Row[] {
    if (this.currentColumnDir && this.rowKeys.includes(this.currentColumnName[this.tab])) {
      try {
        return this.filteredItems.sort((a, b) => {
          let x: string | number;
          let y: string | number;
          const modifier = this.currentColumnDir === 'asc' ? 1 : -1;
          const partA = a[this.currentColumnName[this.tab] as keyof Row];
          const partB = b[this.currentColumnName[this.tab] as keyof Row];
          const typeString = partA && partB && (Number.isNaN(Number(partA)) && Number.isNaN(Number(partB)));
          const typeNumber = partA && partB && !(Number.isNaN(Number(partA)) && Number.isNaN(Number(partB)));
          const typeBoolean = typeof partA === 'boolean' && typeof partB === 'boolean';

          if (typeBoolean) {
            x = Number(partA);
            y = Number(partB);
          } else if (typeString) {
            x = partA.toString().trim().toLowerCase();
            y = partB.toString().trim().toLowerCase();
          } else if (typeNumber) {
            x = Number(partA);
            y = Number(partB);
          } else {
            return 0;
          }

          if (x < y) return -1 * modifier;
          if (x > y) return 1 * modifier;
          return 0;
        });
      } catch (err) {
        console.error(`Error in sortedItems prop, ${err}`);
      }
    }
    return this.filteredItems;
  }

  get slicedItems(): Row[] {
    if (!this.hideDefaultFooter) {
      return this.sortedItems.slice(
        this.footerModel[this.tab].curPage,
        this.footerModel[this.tab].curPage + this.footerModel[this.tab].itemsPerPage,
      );
    }
    return this.sortedItems;
  }

  get isPageDownDisabled(): boolean {
    if (!this.hideDefaultFooter) {
      return !(this.footerModel[this.tab].curPage > 0
        && (this.footerModel[this.tab].curPage - this.footerModel[this.tab].itemsPerPage) >= 0);
    }
    return true;
  }

  get isPageUpDisabled(): boolean {
    if (!this.hideDefaultFooter) {
      return this.footerModel[this.tab].curPage
        + this.footerModel[this.tab].itemsPerPage >= this.sortedItems.length;
    }
    return true;
  }

  pageUp(): void {
    if (!this.isPageUpDisabled && !this.hideDefaultFooter) {
      this.footerModel[this.tab].curPage += this.footerModel[this.tab].itemsPerPage;
    }
  }

  pageDown(): void {
    if (!this.isPageDownDisabled && !this.hideDefaultFooter) {
      this.footerModel[this.tab].curPage += this.footerModel[this.tab].itemsPerPage;
    }
  }

  goToPage(page: 'first' | 'last'): void {
    if (page === 'first') this.footerModel[this.tab].curPage = 0;
    if (page === 'last') this.footerModel[this.tab].curPage = this.sortedItems.length - 1;
  }
}
</script>

<style scoped lang="scss">
  @import "./src/styles/vf-table-styles";
</style>
