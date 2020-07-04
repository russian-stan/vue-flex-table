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

        <thead v-if="!isNoHeaders">
        <draggable
         tag="tr"
         v-model="tablesModel[tab].headers"
        >
          <th
           v-for="header in tablesModel[tab].headers"
           :key="header.row_key"
           :class="{'active': header.sortable && header.row_key === currentColumnName[tab], 'pointer': header.sortable}"
           @click.self="header.sortable ? sortBy(header.row_key) : null"
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
        </draggable>
        </thead>

        <tbody>
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
               v-model.trim="dropDownColumnSearchValues[tab][searchInput.row_key]"
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

              <input
               v-else-if="findColType(key) === 'date'"
               class="table-input table-input--date"
               type="date"
               v-model="row[key]"
              >

              <template v-else>
                {{row[key]}}
              </template>
            </td>
          </tr>
        </template>
        <template v-else>
          <tr>
            <td class="no-match" :colspan="tablesModel[tab].headers.length">
              {{isNoData ? noDataText : noResultsText}}
            </td>
          </tr>
        </template>

        </tbody>
      </table>
    </div>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { ColType, Header, Row, SelectsData, SortDir, VTable } from '@/types/tableTypes';
import { copyDeep } from '@/helpers/copyDeep';
import draggable from 'vuedraggable';

@Component({
  components: {
    draggable,
  },
})
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
  @Prop({ type: String, default: '' }) private readonly search!: string;
  @Prop({ type: Boolean, default: false }) private readonly ordered!: boolean;
  @Prop({ type: Boolean, default: false }) private readonly countable!: boolean;
  @Prop({ type: Boolean, default: false }) private readonly columnSearch!: boolean;
  @Prop({ type: String, default: 'No data to display' }) private readonly noDataText!: string;
  @Prop({ type: String, default: 'No matching records found' }) private readonly noResultsText!: string;

  tab = 0;
  tablesModel: Array<VTable> = [];
  currentColumnName: string[] = [];
  dropDownColumnSearchValues: { [key: string]: string }[] = [];
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
    this.createDropdownsSearchModel();
  }

  addCount(): void {
    const order = this.ordered ? { order: 0 } : {};
    this.tablesModel.forEach(table => table.headers.push({ text: '№', row_key: 'count', sortable: true, ...order }));
    this.tablesModel.forEach(table => table.rows.forEach((row, index) => row.count = `${index + 1}`));
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

  createDropdownsSearchModel(): void {
    this.tablesModel.forEach((table, index) => {
      if (table.headers.some(header => header.hasOwnProperty('filterable'))) {
        this.dropDownColumnSearchValues.push({})
      }
      table.headers.forEach(header => {
        if (header.filterable) {
          this.$set(this.dropDownColumnSearchValues[index], `${[header.row_key]}`, '')
        }
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
    return Object.values(this.dropDownColumnSearchValues[this.tab]).some(Boolean);
  }

  get filteredColumns(): Row[] {
    if (this.isColumnFilterApplied) {
      let filtered: Row[] = [];
      let temp: Row[] = copyDeep<Row[]>(this.tablesModel[this.tab].rows);

      for (let prop in this.dropDownColumnSearchValues[this.tab]) {
        if (!this.dropDownColumnSearchValues[this.tab][prop]) continue;
        filtered = temp.filter(row => {
          return row[prop].toString().toLowerCase().includes(this.dropDownColumnSearchValues[this.tab][prop].toLowerCase())
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

  *, *:before, *:after {
    box-sizing: border-box;
  }

  .vf-table {
    width: 100%;

    .table-wrapper {
      width: 100%;
    }

    .table-tabs {
      display: flex;
      align-items: center;
    }

    .table-tab {
      position: relative;
      border: 1px solid rgba(#0277BD, 0.3);
      background-color: #fafafa;
      color: #0277BD;
      font-family: inherit;
      font-size: 14px;
      text-transform: uppercase;
      border-radius: 0;
      cursor: pointer;
      width: 50%;
      padding: 10px;
      outline: none;
      overflow: hidden;
      transition: all 0.25s ease-in-out;

      &.active {
        background-color: rgba(#0277BD, 0.4);
      }

      &:hover {
        background-color: rgba(#0277BD, 0.2);
      }

      &:after {
        content: "";
        background: #fafafa;
        display: block;
        position: absolute;
        padding-top: 300%;
        padding-left: 350%;
        margin-left: -20px !important;
        margin-top: -120%;
        opacity: 0;
        transition: all 0.8s
      }

      &:active:after {
        padding: 0;
        margin: 0;
        opacity: 1;
        transition: 0s
      }
    }

    table {
      border-collapse: collapse;
      width: 100%;

      thead {
        color: #fafafa;
      }

      tbody {
        border: solid 1px rgba(0, 0, 0, 0.12);
        background-color: #ffffff;
      }

      th {
        padding: 10px;
        position: relative;
        background-color: #0277BD;
        font-weight: normal;

        &:not(:last-child) {
          border-right: 1px solid rgba(#fafafa, 0.12);
        }

        &.active {
          color: #fafafa;
          text-decoration: underline;
        }

        &.pointer {
          cursor: pointer;
        }

        .sort-buttons {
          position: absolute;
          top: 50%;
          margin-top: calc(-25px / 2);
          right: 2px;
          width: 25px;
          height: 25px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .sort-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 25px;
          height: 12px;
          outline: none;
          margin: 0;
          padding: 0;
          border: 0;
          cursor: pointer;
          background: transparent;
          transition: all 0.25s ease-in-out;

          &:hover {
            .material-icons {
              color: #e7dddd;
            }
          }

          .material-icons {
            line-height: 12px;
            font-size: 25px;
            color: rgba(#000000, 0.2);

            &.active {
              color: #fafafa;
            }
          }
        }
      }

      .search-column-input {
        position: relative;
        display: flex;
        width: 100%;
        align-items: center;
        justify-content: space-between;

        .search-column-icon {
          position: absolute;
          top: 4px;
          left: 5px;
          width: 21px;
          height: 21px;
          line-height: 21px;
          font-size: 21px;
          color: #0277BD;
        }
      }

      td {
        padding: 5px;
        line-height: 28px;

        &:not(:last-child) {
          border-right: 1px solid rgba(#000000, 0.12);
        }

        &.no-match {
          padding: 20px;
        }
      }

      th, td {
        min-width: 90px;
        text-align: center;
        font-size: 14px;
      }
    }

    tbody tr:nth-of-type(odd) {
      background-color: rgba(#0277BD, 0.05);
    }

    .table-input {
      outline: none;
      padding: 5px;
      text-align: center;
      border: 1px solid rgba(#0277BD, 0.5);
      min-width: 95%;
      height: 28px;

      &:focus {
        outline: 2px solid #0277BD;
      }

      &--number {
      }

      &--ntext {
      }

      &--date {
      }

      &--select {
        cursor: pointer;
      }

      &--column-search {
        text-align: left;
        min-width: 100%;
        padding-left: 25px;
        border-radius: 20px;

        &:focus {
          outline: none;
          border: 2px solid #0277BD;
        }
      }
    }
  }

</style>
