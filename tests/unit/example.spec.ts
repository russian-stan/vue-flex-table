import { shallowMount } from '@vue/test-utils';
import VFTable from '@/components/VFTable.vue';

describe('VFTable.vue', () => {
  test('renders noDataText when passed', () => {
    const noDataText = 'new message'
    const wrapper = shallowMount(VFTable, {
      propsData: { noDataText },
    })
    expect(wrapper.text()).toMatch(noDataText)
  });

  test('hide columnSearch if prop column-search is false by default', () => {
    const wrapper = shallowMount(VFTable, {
      propsData: { columnSearch: false },
    })
    expect(wrapper.find('.column-search-row').exists()).toBe(false)
  });

  test('show columnSearch if prop column-search has been passed in', () => {
    const wrapper = shallowMount(VFTable, {
      propsData: { columnSearch: true },
    })
    expect(wrapper.find('.column-search-row').exists()).toBe(true)
  });
})
