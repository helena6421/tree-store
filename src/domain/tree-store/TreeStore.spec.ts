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

describe('TreeStore mutation methods', () => {
  it('adds item and updates indexes', () => {
    const store = new TreeStore(items)
    const newItem: TestItem = { id: 9, parent: 3, label: 'Айтем 9' }

    store.addItem(newItem)

    expect(store.getItem(9)).toEqual(newItem)
    expect(store.getChildren(3)).toEqual([newItem])
    expect(store.getAllChildren(1)).toEqual([
      items[1],
      items[3],
      items[6],
      items[7],
      items[4],
      items[5],
      items[2],
      newItem,
    ])
  })

  it('removes item with the entire subtree', () => {
    const store = new TreeStore(items)

    store.removeItem('91064cee')

    expect(store.getItem('91064cee')).toBeUndefined()
    expect(store.getItem(4)).toBeUndefined()
    expect(store.getItem(7)).toBeUndefined()
    expect(store.getChildren(1)).toEqual([items[2]])
    expect(store.getAll()).toEqual([items[0], items[2]])
  })

  it('does nothing when removing unknown item', () => {
    const store = new TreeStore(items)

    store.removeItem('missing-id')

    expect(store.getAll()).toEqual(items)
  })

  it('updates item payload without rebuilding unrelated branches', () => {
    const store = new TreeStore(items)
    const updatedItem: TestItem = { ...items[3], label: 'Обновлённый айтем 4' }

    store.updateItem(updatedItem)

    expect(store.getItem(4)).toEqual(updatedItem)
    expect(store.getChildren('91064cee')).toEqual([updatedItem, items[4], items[5]])
    expect(store.getAllParents(7)).toEqual([items[6], updatedItem, items[1], items[0]])
  })

  it('updates parent and keeps source order inside the new branch', () => {
    const store = new TreeStore(items)
    const movedItem: TestItem = { ...items[5], parent: 1, label: items[5].label }

    store.updateItem(movedItem)

    expect(store.getChildren('91064cee')).toEqual([items[3], items[4]])
    expect(store.getChildren(1)).toEqual([items[1], items[2], movedItem])
    expect(store.getAllParents(6)).toEqual([movedItem, items[0]])
  })

  it('inserts moved item before later siblings according to source order', () => {
    const store = new TreeStore(items)
    const movedItem: TestItem = { ...items[2], parent: '91064cee' }

    store.updateItem(movedItem)

    expect(store.getChildren('91064cee')).toEqual([movedItem, items[3], items[4], items[5]])
  })

  it('removes added leaf and clears empty children bucket', () => {
    const store = new TreeStore(items)
    const newItem: TestItem = { id: 9, parent: 3, label: 'Айтем 9' }

    store.addItem(newItem)
    store.removeItem(9)

    expect(store.getItem(9)).toBeUndefined()
    expect(store.getChildren(3)).toEqual([])
    expect(store.getAll()).toEqual(items)
  })

  it('throws when adding duplicate id', () => {
    const store = new TreeStore(items)

    expect(() => store.addItem(items[0])).toThrow('already exists')
  })

  it('throws when updating missing item', () => {
    const store = new TreeStore(items)
    const missingItem: TestItem = { id: 'missing-id', parent: null, label: 'Missing' }

    expect(() => store.updateItem(missingItem)).toThrow('does not exist')
  })
})

describe('TreeStore defensive branches', () => {
  it('skips invalid entries while collecting descendants', () => {
    const store = new TreeStore(items)
    const internals = store as unknown as {
      childrenByParentId: Map<TestItem['id'] | null, Array<TestItem | undefined>>
    }
    const childrenOfRoot = internals.childrenByParentId.get(1)

    expect(childrenOfRoot).toBeDefined()

    childrenOfRoot?.splice(1, 0, undefined)

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

  it('skips duplicate and invalid entries while removing a subtree', () => {
    const store = new TreeStore(items)
    const internals = store as unknown as {
      childrenByParentId: Map<TestItem['id'] | null, Array<TestItem | undefined>>
    }
    const childrenOfBranch = internals.childrenByParentId.get('91064cee')

    expect(childrenOfBranch).toBeDefined()

    childrenOfBranch?.push(items[3], undefined)

    store.removeItem('91064cee')

    expect(store.getItem('91064cee')).toBeUndefined()
    expect(store.getItem(4)).toBeUndefined()
    expect(store.getChildren(1)).toEqual([items[2]])
  })

  it('throws when item index is missing for an existing item', () => {
    const store = new TreeStore(items)
    const internals = store as unknown as {
      itemIndexById: Map<TestItem['id'], number>
    }

    internals.itemIndexById.delete(4)

    expect(() => store.updateItem({ ...items[3], label: 'Broken index' })).toThrow('is corrupted')
  })

  it('recreates sibling bucket when it is unexpectedly missing', () => {
    const store = new TreeStore(items)
    const internals = store as unknown as {
      childrenByParentId: Map<TestItem['id'] | null, TestItem[]>
    }
    const updatedItem: TestItem = { ...items[3], label: 'Айтем 4 (updated)' }

    internals.childrenByParentId.delete('91064cee')

    store.updateItem(updatedItem)

    expect(store.getChildren('91064cee')).toEqual([updatedItem])
  })

  it('reinserts item when it is unexpectedly missing from siblings bucket', () => {
    const store = new TreeStore(items)
    const internals = store as unknown as {
      childrenByParentId: Map<TestItem['id'] | null, TestItem[]>
    }
    const updatedItem: TestItem = { ...items[3], label: 'Айтем 4 (reinserted)' }

    internals.childrenByParentId.set('91064cee', [items[4], items[5]])

    store.updateItem(updatedItem)

    expect(store.getChildren('91064cee')).toEqual([updatedItem, items[4], items[5]])
  })

  it('keeps removeItem stable when parent bucket is missing', () => {
    const store = new TreeStore(items)
    const internals = store as unknown as {
      childrenByParentId: Map<TestItem['id'] | null, TestItem[]>
    }

    internals.childrenByParentId.delete(1)

    store.removeItem('91064cee')

    expect(store.getItem('91064cee')).toBeUndefined()
    expect(store.getAll()).toEqual([items[0], items[2]])
  })

  it('keeps removeItem stable when parent bucket does not contain the child', () => {
    const store = new TreeStore(items)
    const internals = store as unknown as {
      childrenByParentId: Map<TestItem['id'] | null, TestItem[]>
    }

    internals.childrenByParentId.set(1, [items[2]])

    store.removeItem('91064cee')

    expect(store.getItem('91064cee')).toBeUndefined()
    expect(store.getAll()).toEqual([items[0], items[2]])
  })
})
