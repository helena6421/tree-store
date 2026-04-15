import { TreeStore } from './TreeStore'
import type { TreeItem } from './types'

interface TestItem extends TreeItem {
  label: string
}

const items: TestItem[] = [
  { id: 1, parent: null, label: 'Айтем 1' },
  { id: '91064cee', parent: 1, label: 'Айтем 2' },
  { id: 3, parent: 1, label: 'Айтем 3' },
  { id: 4, parent: '91064cee', label: 'Айтем 4' },
  { id: 5, parent: '91064cee', label: 'Айтем 5' },
  { id: 6, parent: '91064cee', label: 'Айтем 6' },
  { id: 7, parent: 4, label: 'Айтем 7' },
  { id: 8, parent: 4, label: 'Айтем 8' },
]

describe('TreeStore read methods', () => {
  it('returns all items in original order', () => {
    const store = new TreeStore(items)

    expect(store.getAll()).toEqual(items)
  })

  it('returns item by numeric id', () => {
    const store = new TreeStore(items)

    expect(store.getItem(1)).toEqual(items[0])
    expect(store.getItem(4)).toEqual(items[3])
  })

  it('returns item by string id', () => {
    const store = new TreeStore(items)

    expect(store.getItem('91064cee')).toEqual(items[1])
  })

  it('returns undefined for missing item', () => {
    const store = new TreeStore(items)

    expect(store.getItem('missing-id')).toBeUndefined()
  })

  it('returns direct children only', () => {
    const store = new TreeStore(items)

    expect(store.getChildren(1)).toEqual([items[1], items[2]])
    expect(store.getChildren(4)).toEqual([items[6], items[7]])
  })

  it('returns empty array when item has no children', () => {
    const store = new TreeStore(items)

    expect(store.getChildren(7)).toEqual([])
    expect(store.getChildren(8)).toEqual([])
  })

  it('returns all descendants in depth-first order preserving source order', () => {
    const store = new TreeStore(items)

    expect(store.getAllChildren(1)).toEqual([
      items[1],
      items[3],
      items[6],
      items[7],
      items[4],
      items[5],
      items[2],
    ])
  })

  it('returns all descendants for nested branch', () => {
    const store = new TreeStore(items)

    expect(store.getAllChildren('91064cee')).toEqual([
      items[3],
      items[6],
      items[7],
      items[4],
      items[5],
    ])
  })

  it('returns empty array for missing descendants', () => {
    const store = new TreeStore(items)

    expect(store.getAllChildren(7)).toEqual([])
    expect(store.getAllChildren(999999)).toEqual([])
  })

  it('returns item-to-root parent chain in correct order', () => {
    const store = new TreeStore(items)

    expect(store.getAllParents(7)).toEqual([items[6], items[3], items[1], items[0]])
  })

  it('returns root item only for root node', () => {
    const store = new TreeStore(items)

    expect(store.getAllParents(1)).toEqual([items[0]])
  })

  it('returns empty array for unknown item when requesting parents', () => {
    const store = new TreeStore(items)

    expect(store.getAllParents('unknown')).toEqual([])
  })
})
