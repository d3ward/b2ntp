import { describe, it, expect } from 'vitest'
import { migrateSidebarConfig } from './sidebarMigration'

describe('migrateSidebarConfig — fresh / already-migrated', () => {
  it('returns the same object when already in new shape', () => {
    const config = {
      left:  { enabled: true, collapsed: false, order: ['tabs'],    panels: {} },
      right: { enabled: true, collapsed: false, order: ['weather'], panels: {} },
    }
    expect(migrateSidebarConfig(config)).toBe(config)
  })

  it('returns correct default order for a fresh new-shape config', () => {
    const config = {
      left:  { enabled: true, collapsed: false, order: ['tabs'],    panels: {} },
      right: { enabled: true, collapsed: false, order: ['weather'], panels: {} },
    }
    const result = migrateSidebarConfig(config)
    expect(result.left.order).toEqual(['tabs'])
    expect(result.right.order).toEqual(['weather'])
  })
})

describe('migrateSidebarConfig — old flat schema', () => {
  it('produces a new shape with left and right keys', () => {
    const old = { enabled: true, collapsed: false, widgets: { tabs: true }, panels: {} }
    const result = migrateSidebarConfig(old)
    expect(result).toHaveProperty('left')
    expect(result).toHaveProperty('right')
  })

  it('preserves enabled=true', () => {
    const result = migrateSidebarConfig({ enabled: true, collapsed: false, widgets: {}, panels: {} })
    expect(result.left.enabled).toBe(true)
  })

  it('preserves enabled=false', () => {
    const result = migrateSidebarConfig({ enabled: false, collapsed: false, widgets: {}, panels: {} })
    expect(result.left.enabled).toBe(false)
  })

  it('preserves collapsed state', () => {
    const result = migrateSidebarConfig({ enabled: true, collapsed: true, widgets: {}, panels: {} })
    expect(result.left.collapsed).toBe(true)
  })

  it('sets left.order to [tabs]', () => {
    const result = migrateSidebarConfig({ enabled: true, collapsed: false, widgets: { tabs: true }, panels: {} })
    expect(result.left.order).toEqual(['tabs'])
  })

  it('sets right.order to [weather]', () => {
    const result = migrateSidebarConfig({ enabled: true, collapsed: false, widgets: {}, panels: {} })
    expect(result.right.order).toEqual(['weather'])
  })

  it('routes weather panel state to right.panels', () => {
    const old = { enabled: true, collapsed: false, widgets: {}, panels: { weather: { collapsed: true } } }
    const result = migrateSidebarConfig(old)
    expect(result.right.panels.weather).toEqual({ collapsed: true })
    expect(result.left.panels.weather).toBeUndefined()
  })

  it('routes tabs panel state to left.panels', () => {
    const old = { enabled: true, collapsed: false, widgets: {}, panels: { tabs: { collapsed: true } } }
    const result = migrateSidebarConfig(old)
    expect(result.left.panels.tabs).toEqual({ collapsed: true })
    expect(result.right.panels.tabs).toBeUndefined()
  })

  it('handles null/undefined gracefully', () => {
    const result = migrateSidebarConfig(null)
    expect(result.left.order).toEqual(['tabs'])
    expect(result.right.order).toEqual(['weather'])
  })
})
