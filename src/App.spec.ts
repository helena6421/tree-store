import { shallowMount } from '@vue/test-utils'
import App from './App.vue'

describe('App', () => {
  it('renders application title', () => {
    const wrapper = shallowMount(App)

    expect(wrapper.text()).toContain('Дерево элементов')
  })
})
