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
           :class="{'active': header.row_key === currentColumnName}"
           @click="sortBy(header.row_key)"
          >
            {{header.text}}

            <div
             v-if="currentColumnName === header.row_key && filteredItems.length > 1"
             class="sort-buttons"
            >
              <!--ASC-BTN-->
              <button
               class="sort-btn"
               @click="changeSortDirForCurCol(header.row_key, 'asc')"
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
               @click="changeSortDirForCurCol(header.row_key, 'desc')"
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

        <tbody v-if="filteredItems.length">
          <tr
           v-for="row in sortedItems"
           :key="row.uid"
          >
            <td
             v-for="key in rowKeys"
             :key="key"
            >
              {{row[key]}}
            </td>
          </tr>
        </tbody>
        <tbody v-else>
        <tr>
          <td class="no-match" :colspan="tablesModel[tab].headers.length">
            {{isNoData ? noDataText : noResultsText}}
          </td>
        </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { VTable, Header, Row, SortDir } from '@/types/tableTypes';
import { copyDeep } from '@/helpers/copyDeep';
import draggable from 'vuedraggable';

@Component({
  components: {
    draggable,
  },
})
export default class Table extends Vue {
  @Prop({
    type: Array, default() {
      return [
        {
          headers: [],
          rows: []
        }
      ]
    },
  }) private readonly tables!: Array<VTable>;
  @Prop({ type: String, default: '' }) private readonly search!: string;
  @Prop({ type: String, default: 'No matching records found' }) private readonly noResultsText!: string;
  @Prop({ type: String, default: 'No data to display' }) private readonly noDataText!: string;

  tab = 0;
  currentColumnName = '';
  currentColumnDir: SortDir = 'asc';
  tablesModel: Array<VTable> = [];

  created() {
    this.tablesModel = copyDeep<VTable[]>(this.tables);
    this.tablesModel.forEach(table => table.headers.sort((a, b) => a.order - b.order));
    this.tablesModel.forEach(table => table.headers.forEach(header => header.sort_dir = 'asc'));
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

  get filteredItems(): Row[] {
    if (this.search) {
      return this.tablesModel[this.tab].rows.filter(item => {
        return Object.values(item).some(item => item.toLowerCase().includes(this.search))
      })
    }
    return this.tablesModel[this.tab].rows
  }

  get sortedItems(): Row[] {
    if (this.currentColumnName) {
      return this.filteredItems.sort((a, b) => {
        const modifier = this.currentColumnDir === 'asc' ? 1 : -1;

        const x = a[this.currentColumnName as keyof Row].trim().toLowerCase();
        const y = b[this.currentColumnName as keyof Row].trim().toLowerCase();

        if (x < y) return -1 * modifier;
        if (x > y) return 1 * modifier;
        return 0;
      });
    }
    return this.filteredItems;
  }

  findColForSort(): Header {
    return this.tablesModel[this.tab].headers
      .find(header => header.row_key === this.currentColumnName)!;
  }

  sortBy(colName: string) {
    this.currentColumnName = colName;
    this.currentColumnDir = this.findColForSort()!.sort_dir;
  }

  changeSortDirForCurCol(colName: string, dir: SortDir) {
    this.currentColumnName = colName;
    this.findColForSort()!.sort_dir = dir;
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
        cursor: pointer;
        overflow: hidden;

        &:not(:last-child) {
          border-right: 1px solid rgba(#fafafa, 0.12);
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
          height: 10px;
          outline: none;
          margin: 0;
          padding: 0;
          border: none;
          cursor: pointer;
          background-color: #fafafa;
          transition: all 0.25s ease-in-out;

          &:hover {
            background-color: #e7dddd;
          }

          .material-icons {
            line-height: 10px;
            color: rgba(#0277BD, 0.4);

            &.active {
              color: #0277BD;
            }
          }
        }

        &.active {
          color: #fafafa;
          text-decoration: underline;
        }
      }

      td {
        padding: 5px;

        &:not(:last-child) {
          border-right: 1px solid rgba(#000000, 0.12);
        }

        &.no-match {
          padding: 20px;
        }
      }

      th, td {
        text-align: center;
        font-size: 14px;

      }
    }

    tbody tr:nth-of-type(odd) {
      background-color: rgba(#0277BD, 0.05);
    }
  }

</style>
