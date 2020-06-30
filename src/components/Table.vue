<template>
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
      <colgroup>
        <col
         v-for="header in tablesModel[tab].headers"
         :key="header.row_key"
        >
      </colgroup>

      <thead>
      <draggable tag="tr" v-model="tablesModel[tab].headers">
        <th
         v-for="header in tablesModel[tab].headers"
         :key="header.row_key"
         :class="{'active': header.row_key === currentColumnName}"
         @click="sortBy(header.row_key)"
        >
          {{header.text}}

          <div v-if="currentColumnName === header.row_key" class="sort-buttons">
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

      <tbody>
      <tr
       v-for="row in sortedItems"
       :key="row.uid"
      >
        <td
         v-for="key in row_keys"
         :key="key"
        >
          {{row[key]}}
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { VTable, Header, Row } from '@/types/tableTypes';
import { copyDeep } from '@/helpers/copyDeep';
import draggable from 'vuedraggable';

@Component({
  components: {
    draggable,
  },
})
export default class Table extends Vue {
  @Prop({ type: Array }) private readonly tables!: Array<VTable>;

  tab = 0;
  currentColumnName = '';
  currentColumnDir: 'asc' | 'desc' = 'asc';
  tablesModel: Array<VTable> = [];

  created() {
    this.tablesModel = copyDeep<VTable[]>(this.tables);
    this.tablesModel.forEach(table => table.headers.sort((a, b) => a.order - b.order))
    this.tablesModel.forEach(table => table.headers.forEach(header => header.sort_dir = 'asc'));
  }

  get row_keys(): Array<string> {
    return this.tablesModel[this.tab].headers.reduce((acc: Array<string>, header: Header) => {
      const prop = Object.keys(header).find(prop => prop === 'row_key');
      if (prop && prop === 'row_key') acc.push(header[prop]);
      return acc;
    }, [])
  }

  get sortedItems(): Row[] {
    if (this.currentColumnName) {
      return this.tablesModel[this.tab].rows.sort((a, b) => {
        const modifier = this.currentColumnDir === 'asc' ? 1 : -1;

        const x = a[this.currentColumnName as keyof Row].trim().toLowerCase();
        const y = b[this.currentColumnName as keyof Row].trim().toLowerCase();

        if (x < y) return -1 * modifier;
        if (x > y) return 1 * modifier;
        return 0;
      });
    }
    return this.tablesModel[this.tab].rows;
  }

  findColForSort(): Header {
    return this.tablesModel[this.tab].headers.find(header => header.row_key === this.currentColumnName)!;
  }

  sortBy(colName: string) {
    this.currentColumnName = colName;
    const colForSort = this.findColForSort();
    this.currentColumnDir = colForSort!.sort_dir;
  }

  changeSortDirForCurCol(colName: string, dir: 'asc' | 'desc') {
    this.currentColumnName = colName;
    const colForSort = this.findColForSort();
    colForSort!.sort_dir = dir;
  }
}
</script>

<style scoped lang="scss">

  .table-wrapper {
    width: 100%;
    box-sizing: border-box;
  }

  .table-tabs {
    display: flex;
    align-items: center;
  }

  .table-tab {
    border: 1px solid rgba(#0277BD, 0.3);
    background-color: #f5f5f5;
    color: #0277BD;
    font-family: inherit;
    font-size: 14px;
    text-transform: uppercase;
    border-radius: 0;
    cursor: pointer;
    width: 50%;
    padding: 10px;
    outline: none;
    transition: all 0.25s ease-in-out;

    &.active {
      background-color: rgba(#0277BD, 0.4);
    }

    &:hover {
      background-color: rgba(#0277BD, 0.2);
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

      &:not(:last-child) {
        border-right: 1px solid rgba(#fafafa, 0.12);
      }

      .sort-buttons {
        position: absolute;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        top: 5px;
        right: 2px;
        width: 25px;
        height: 27px;
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
        cursor: pointer;

        .material-icons {
          line-height: 12px;
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
    }

    th, td {
      text-align: center;
      font-size: 14px;

    }
  }

  tbody tr:nth-of-type(odd) {
    background-color: #fafafa;
  }

</style>
