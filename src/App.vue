<template>
  <div id="app">
    <Table
     :tables="data.tables"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Table from './components/Table.vue';

@Component({
  components: {
    Table,
  },
})
export default class App extends Vue {
  data = {
    tables: [
      {
        label: 'Used cars',
        headers: [
          {
            text: 'Brand',
            row_key: 'brand',
            order: 1,
          },
          {
            text: 'Color',
            row_key: 'color',
            order: 2,
          },
          {
            text: 'Type',
            row_key: 'type',
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
            color: 'silver',
            type: 'sedan',
            year: '2015',
            uid: '1',
          },
          {
            brand: 'Mazda',
            color: 'red',
            type: 'hatchback',
            year: '2014',
            uid: '2',
          },
          {
            brand: 'BMW',
            color: 'black',
            type: 'sedan',
            year: '2014',
            uid: '3',
          },
          {
            brand: 'Audi',
            color: 'white',
            type: 'sedan',
            year: '2009',
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
          },
          {
            text: 'Color',
            row_key: 'color',
            order: 2,
          },
          {
            text: 'Type',
            row_key: 'type',
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
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
  }
</style>
