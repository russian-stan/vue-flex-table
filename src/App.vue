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
  columnSearch = true;

  generateRows() {

    const rows = [];
    const brands = ['Ford', 'Mazda', 'Mercedes', 'Audi', 'Volkswagen', 'Renault', 'Mitsubishi', 'Volvo'];
    const type = ['sedan', 'hatchback', 'coupe'];

    const randomDate = (start: Date, end: Date): string => {
      return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().slice(0, 10);
    }

    for (let i = 0; i < 10; i++) {
      rows.push(
        {
          brand: brands[Math.round(Math.abs(Math.random() * brands.length - 1))],
          color: Math.round(Math.random() * 4 + 1).toString(),
          type: type[Math.round(Math.abs(Math.random() * type.length - 1))],
          issue_date: randomDate(new Date(2012, 0, 1), new Date()),
          price: Math.round(Math.random() * 35000).toString(),
          for_sale: !!Math.round(Math.random()),
          uid: Math.random().toString(12).substring(2),
        },
      )
    }
    return rows;
  }

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
          {
            text: 'Is for sale',
            row_key: 'for_sale',
            sortable: true,
            filterable: true,
            col_type: 'checkbox',
            order: 6,
          },
        ],
        rows: this.generateRows(),
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
    width: 100%;
    max-width: 1450px;
    margin: 0 auto;
  }

  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
    margin-top: 60px;
    width: 100%;
  }
</style>
