import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TabSwitcher from '../TabSwitcher.vue'

describe('TabSwitcher', () => {
  it('默认选中双色球', () => {
    const wrapper = mount(TabSwitcher)
    const buttons = wrapper.findAll('button')
    expect(buttons[0].classes()).toContain('tab-btn--active-ssq')
  })

  it('点击大乐透切换高亮', async () => {
    const wrapper = mount(TabSwitcher)
    const buttons = wrapper.findAll('button')
    await buttons[1].trigger('click')
    expect(buttons[1].classes()).toContain('tab-btn--active-dlt')
  })
})
