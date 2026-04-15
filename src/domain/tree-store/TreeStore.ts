import type { ITreeStore, TreeItemId, TreeItem } from './types'

type ParentKey = TreeItemId | null

export class TreeStore<T extends TreeItem> implements ITreeStore<T> {
  private items: T[]
  private readonly itemById = new Map<TreeItemId, T>()
  private readonly itemIndexById = new Map<TreeItemId, number>()
  private readonly childrenByParentId = new Map<ParentKey, T[]>()
  private readonly parentById = new Map<TreeItemId, ParentKey>()
  private readonly emptyItems = Object.freeze([]) as unknown as T[]

  public constructor(items: T[]) {
    // Делаем поверхностную копию массива, чтобы внешние мутации исходного массива
    // не ломали внутреннее состояние store.
    this.items = [...items]

    this.buildIndexes()
  }

  public getAll(): T[] {
    return this.items
  }

  public getItem(id: TreeItemId): T | undefined {
    return this.itemById.get(id)
  }

  public getChildren(id: TreeItemId): T[] {
    return this.childrenByParentId.get(id) ?? this.emptyItems
  }

  public getAllChildren(id: TreeItemId): T[] {
    const rootChildren = this.childrenByParentId.get(id)

    if (!rootChildren || rootChildren.length === 0) {
      return []
    }

    const result: T[] = []

    // Идём итеративно, чтобы не упереться в глубину рекурсии на больших деревьях.
    // Стек заполняем в обратном порядке, чтобы итоговый обход сохранил порядок элементов.
    const stack: T[] = []

    for (let index = rootChildren.length - 1; index >= 0; index -= 1) {
      stack.push(rootChildren[index])
    }

    while (stack.length > 0) {
      const currentItem = stack.pop()

      if (!currentItem) {
        continue
      }

      result.push(currentItem)

      const children = this.childrenByParentId.get(currentItem.id)

      if (!children || children.length === 0) {
        continue
      }

      for (let index = children.length - 1; index >= 0; index -= 1) {
        stack.push(children[index])
      }
    }

    return result
  }

  public getAllParents(id: TreeItemId): T[] {
    const result: T[] = []
    let currentId: TreeItemId | null | undefined = id

    while (currentId !== null && currentId !== undefined) {
      const currentItem = this.itemById.get(currentId)

      if (!currentItem) {
        break
      }

      result.push(currentItem)
      currentId = this.parentById.get(currentId)
    }

    return result
  }

  public addItem(item: T): void {
    if (this.itemById.has(item.id)) {
      throw new Error(`Item with id "${String(item.id)}" already exists`)
    }

    this.items.push(item)

    const itemIndex = this.items.length - 1

    this.itemById.set(item.id, item)
    this.itemIndexById.set(item.id, itemIndex)
    this.parentById.set(item.id, item.parent)

    const siblings = this.getOrCreateChildrenBucket(item.parent)
    siblings.push(item)
  }

  public removeItem(id: TreeItemId): void {
    const rootItem = this.itemById.get(id)

    if (!rootItem) {
      return
    }

    const idsToRemove = new Set<TreeItemId>()
    const stack: T[] = [rootItem]

    while (stack.length > 0) {
      const currentItem = stack.pop()

      if (!currentItem || idsToRemove.has(currentItem.id)) {
        continue
      }

      idsToRemove.add(currentItem.id)

      const children = this.childrenByParentId.get(currentItem.id)

      if (!children || children.length === 0) {
        continue
      }

      for (let index = children.length - 1; index >= 0; index -= 1) {
        stack.push(children[index])
      }
    }

    this.detachChild(this.parentById.get(id) ?? null, id)

    for (const removedId of idsToRemove) {
      this.itemById.delete(removedId)
      this.itemIndexById.delete(removedId)
      this.parentById.delete(removedId)
      this.childrenByParentId.delete(removedId)
    }

    this.items = this.items.filter((item) => !idsToRemove.has(item.id))
    this.rebuildItemIndexes()
  }

  public updateItem(item: T): void {
    const currentItem = this.itemById.get(item.id)

    if (!currentItem) {
      throw new Error(`Item with id "${String(item.id)}" does not exist`)
    }

    const itemIndex = this.itemIndexById.get(item.id)

    if (itemIndex === undefined) {
      throw new Error(`Index for item "${String(item.id)}" is corrupted`)
    }

    const previousParent = this.parentById.get(item.id) ?? null

    this.items[itemIndex] = item
    this.itemById.set(item.id, item)
    this.parentById.set(item.id, item.parent)

    if (previousParent !== item.parent) {
      this.detachChild(previousParent, item.id)
      this.insertChild(item.parent, item, itemIndex)
      return
    }

    const siblings = this.childrenByParentId.get(item.parent)

    if (!siblings) {
      this.childrenByParentId.set(item.parent, [item])
      return
    }

    const siblingIndex = siblings.findIndex((sibling) => sibling.id === item.id)

    if (siblingIndex === -1) {
      this.insertChild(item.parent, item, itemIndex)
      return
    }

    siblings[siblingIndex] = item
  }

  private buildIndexes(): void {
    for (let index = 0; index < this.items.length; index += 1) {
      const item = this.items[index]

      this.itemById.set(item.id, item)
      this.itemIndexById.set(item.id, index)
      this.parentById.set(item.id, item.parent)

      const siblings = this.getOrCreateChildrenBucket(item.parent)
      siblings.push(item)
    }
  }

  private rebuildItemIndexes(): void {
    this.itemIndexById.clear()

    for (let index = 0; index < this.items.length; index += 1) {
      this.itemIndexById.set(this.items[index].id, index)
    }
  }

  private getOrCreateChildrenBucket(parentId: ParentKey): T[] {
    const existingChildren = this.childrenByParentId.get(parentId)

    if (existingChildren) {
      return existingChildren
    }

    const nextChildren: T[] = []

    this.childrenByParentId.set(parentId, nextChildren)

    return nextChildren
  }

  private detachChild(parentId: ParentKey, childId: TreeItemId): void {
    const siblings = this.childrenByParentId.get(parentId)

    if (!siblings || siblings.length === 0) {
      return
    }

    const siblingIndex = siblings.findIndex((item) => item.id === childId)

    if (siblingIndex === -1) {
      return
    }

    siblings.splice(siblingIndex, 1)

    if (siblings.length === 0) {
      this.childrenByParentId.delete(parentId)
    }
  }

  private insertChild(parentId: ParentKey, item: T, itemIndex: number): void {
    const siblings = this.getOrCreateChildrenBucket(parentId)
    let insertIndex = siblings.length

    for (let index = 0; index < siblings.length; index += 1) {
      const siblingItemIndex = this.itemIndexById.get(siblings[index].id)

      if (siblingItemIndex !== undefined && siblingItemIndex > itemIndex) {
        insertIndex = index
        break
      }
    }

    siblings.splice(insertIndex, 0, item)
  }
}
