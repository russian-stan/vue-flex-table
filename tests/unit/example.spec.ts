import { shallowMount } from '@vue/test-utils';
import VFTable from '@/components/VFTable.vue';

describe('VFTable.vue', () => {
  it('renders props.msg when passed', () => {
    const noDataText = 'new message'
    const wrapper = shallowMount(VFTable, {
      propsData: { noDataText },
    })
    expect(wrapper.text()).toMatch(noDataText)
  })
})
