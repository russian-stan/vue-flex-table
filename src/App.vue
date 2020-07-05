<template>
  <div id="app">
    <label>
      Search
      <input v-model.trim="search" type="text" style="margin-bottom: 20px; width: 200px;">
    </label>
    <div style="margin: 20px 0;">
      <button
       style="cursor: pointer;"
       @click="columnSearch = !columnSearch">
        Column search
      </button>
    </div>

    <VFTable
     :tables="data.tables"
     :selectsData="data.selects_data"
     :search="search"
     :columnSearch="columnSearch"
     countable
     ordered
     draggable
     no-results-text="No matching records found"
     no-data-text="No data to display"
    />

  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import VFTable from './components/VFTable.vue';

@Component({
  components: {
    VFTable,
  },
})
export default class App extends Vue {
  search = '';
  columnSearch = false;
  data = {
    selects_data: {
      color: [
        { text: 'red', id: '1' },
        { text: 'black', id: '2' },
        { text: 'silver', id: '3' },
        { text: 'white', id: '4' },
        { text: 'blue', id: '5' },
      ],
    },
    tables: [
      {
        label: 'Used cars',
        headers: [
          {
            text: 'Brand',
            row_key: 'brand',
            sortable: true,
            filterable: true,
            order: 1,
          },
          {
            text: 'Color',
            row_key: 'color',
            col_type: 'select',
            sortable: true,
            filterable: true,
            order: 2,
          },
          {
            text: 'Type',
            row_key: 'type',
            sortable: true,
            col_type: 'text',
            filterable: true,
            order: 3,
          },
          {
            text: 'Issue date',
            row_key: 'issue_date',
            sortable: true,
            col_type: 'date',
            order: 4,
          },
          {
            text: 'Price',
            row_key: 'price',
            sortable: true,
            filterable: true,
            col_type: 'number',
            order: 5,
          },
        ],
        rows: [
          {
            brand: 'Ford',
            color: '1',
            type: 'sedan',
            issue_date: '2015-01-02',
            price: '20000',
            uid: '1',
          },
          {
            brand: 'Mazda',
            color: '2',
            type: 'hatchback',
            issue_date: '2018-01-02',
            price: '50000',
            uid: '2',
          },
          {
            brand: 'BMW',
            color: '3',
            type: 'sedan',
            issue_date: '2013-01-02',
            price: '25000',
            uid: '3',
          },
          {
            brand: 'Audi',
            color: '4',
            type: 'sedan',
            issue_date: '2017-01-02',
            price: '55000',
            uid: '4',
          },
        ],
      },
      {
        label: 'Brand new cars',
        headers: [
          {
            text: 'Brand',
            row_key: 'brand',
            order: 1,
            filterable: true,
            sortable: true,
          },
          {
            text: 'Color',
            row_key: 'color',
            sortable: true,
            order: 2,
          },
          {
            text: 'Type',
            row_key: 'type',
            sortable: true,
            order: 3,
          },
          {
            text: 'Year',
            row_key: 'year',
            order: 4,
          },
        ],
        rows: [
          {
            brand: 'Ford',
            color: 'red',
            type: 'sedan',
            year: '2020',
            uid: '1',
          },
          {
            brand: 'Volkswagen',
            color: 'silver',
            type: 'hatchback',
            year: '2020',
            uid: '2',
          },
          {
            brand: 'Mercedes',
            color: 'blue',
            type: 'sedan',
            year: '2020',
            uid: '3',
          },
          {
            brand: 'Audi',
            color: 'red',
            type: 'hatchback',
            year: '2020',
            uid: '4',
          },
        ],
      },
    ],
  }
}
</script>

<style lang="scss">
  body {
    background-color: #fafafa;
  }

  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
    margin-top: 60px;
  }
</style>
