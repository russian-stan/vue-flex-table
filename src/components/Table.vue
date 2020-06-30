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
        {{table.label}} / {{index}}
      </button>
    </div>

    <table>
      <colgroup>
        <col
         v-for="header in tablesModel[tab].headers"
         :key="header.rowKey"
        >
      </colgroup>

      <thead>
      <draggable tag="tr" v-model="tablesModel[tab].headers">
        <th
         v-for="header in tablesModel[tab].headers"
         :key="header.rowKey"
         :class="{'active': header.rowKey === currentSort}"
         @click="sortBy(header.rowKey)"
        >
          {{header.text}}
          <button
           class="sort-btn sort-btn--up"
           @click="changeSortDir('asc')"
          >
            <i class="material-icons">arrow_drop_up</i>
          </button>
          <button
           class="sort-btn sort-btn--down"
           @click="changeSortDir('desc')"
          >
            <i class="material-icons">arrow_drop_down</i>
          </button>
        </th>
      </draggable>
      </thead>

      <tbody>
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
  currentSort = '';
  currentSortDir = 'asc';
  tablesModel: Array<VTable> = [];

  created() {
    // this.tablesModel = JSON.parse(JSON.stringify(this.tables));
    this.tablesModel = copyDeep<VTable[]>(this.tables);
    this.tablesModel.forEach(table => table.headers.sort((a, b) => a.order - b.order))
  }

  get rowKeys(): Array<string> {
    return this.tablesModel[this.tab].headers.reduce((acc: Array<string>, header: Header) => {
      const prop = Object.keys(header).find(prop => prop === 'rowKey');
      if (prop && prop === 'rowKey') acc.push(header[prop]);
      return acc;
    }, [])
  }

  get sortedItems(): Row[] {
    console.log('sortedItems');
    if (this.currentSort) {
      return this.tablesModel[this.tab].rows.sort((a, b) => {
        const modifier = this.currentSortDir === "asc" ? 1 : -1;

        const x = a[this.currentSort as keyof Row].trim().toLowerCase();
        const y = b[this.currentSort as keyof Row].trim().toLowerCase();

        if (x < y) return -1 * modifier;
        if (x > y) return 1 * modifier;
        return 0;
      });
    }
    return this.tablesModel[this.tab].rows;
  }

  sortBy(colName: string) {
    if (this.currentSort !== colName) this.currentSort = colName;
  }

  changeSortDir(dir: 'asc' | 'desc') {
    this.currentSortDir = dir
  }
}
</script>

<style scoped lang="scss">

  .table-wrapper {
    width: 100%;
  }

  .table-tabs {
    display: flex;
    align-items: center;
  }

  .table-tab {
    border: 1px solid #1a7fc3;
    background-color: #f5f5f5;
    color: #1a7fc3;
    font-family: inherit;
    font-size: 14px;
    text-transform: uppercase;
    border-radius: 0;
    cursor: pointer;
    width: 50%;
    padding: 10px;

    &.active {
      border-bottom: 2px solid #000000;
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
      background-color: #1a7fc3;
      cursor: pointer;

      &:not(:last-child) {
        border-right: 1px solid rgba(#fafafa, 0.12);
      }

      .sort-btn {
        position: absolute;
        right: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 25px;
        height: 12px;
        outline: none;
        margin: 0;
        padding: 0;
        cursor: pointer;

        &--up {
          top: 5px;
        }

        &--down {
          top: 20px;
        }

        .material-icons {
          line-height: 12px;
          color: #1a7fc3;
        }
      }

      &.active {
        color: rgba(#000000, 0.3);
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
