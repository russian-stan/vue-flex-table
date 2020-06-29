<template>
  <div class="table-wrapper">

    <div v-if="tables.length > 1" class="table-tabs">
      <button
       v-for="(tab, key) in tables"
       :key="tab.label"
       @click="switchTab(key)"
       class="table-tab">
        {{tab.label}}
      </button>
    </div>

    <table class="g-table">
      <colgroup>
        <col>
        <col>
        <col>
        <col>
        <col>
      </colgroup>

      <thead>
      <tr>
        <th
         v-for="header in this.tablesModel[tab].headers"
         :key="header.rowKey"
        >
          {{header.text}}
        </th>
      </tr>
      </thead>

      <tbody>
      <tr
       v-for="row in this.tablesModel[tab].rows"
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
import { GTable, Header } from '@/Types/tableTypes';

@Component
export default class Table extends Vue {
  @Prop({ type: Array }) private readonly tables!: Array<GTable>;

  tab = 0;
  tablesModel: Array<GTable> = [];

  created() {
    this.tablesModel = JSON.parse(JSON.stringify(this.tables));
    this.tablesModel.forEach(table => {
      table.headers.sort((a, b) => a.order - b.order)
    })
  }

  get rowKeys(): Array<string> {
    return this.tablesModel[this.tab].headers.reduce((acc: Array<string>, header: Header) => {
      const prop = Object.keys(header).find(prop => prop === 'rowKey');
      if (prop && prop === 'rowKey') acc.push(header[prop]);
      return acc;
    }, [])
  }

  switchTab(key: number) {
    this.tab = key;
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
  }

  table {
    border-collapse: collapse;
    width: 100%;

    thead {
      background-color: #1a7fc3;
      color: #fafafa;
      border: solid 1px rgba(0, 0, 0, 0.12);
    }

    tbody {
      border: solid 1px rgba(0, 0, 0, 0.12);
      background-color: #ffffff;
    }

    th {
      padding: 10px;
      position: relative;
      cursor: pointer;

      &:not(:last-child) {
        border-right: 1px solid rgba(#fafafa, 0.12);
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
