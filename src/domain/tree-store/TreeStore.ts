import type { ITreeStore, TreeItemId, TreeItem } from './types'

type ParentKey = TreeItemId | null

export class TreeStore<T extends TreeItem> implements ITreeStore<T> {
  private readonly items: T[]
  private readonly itemById = new Map<TreeItemId, T>()
  private readonly childrenByParentId = new Map<ParentKey, T[]>()
  private readonly parentById = new Map<TreeItemId, ParentKey>()

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
    return this.childrenByParentId.get(id) ?? []
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

    let currentItem = this.itemById.get(id)

    while (currentItem) {
      result.push(currentItem)

      const parentId = this.parentById.get(currentItem.id)

      if (parentId === null || parentId === undefined) {
        break
      }

      currentItem = this.itemById.get(parentId)
    }

    return result
  }

  public addItem(_item: T): void {
    throw new Error('Method not implemented yet')
  }

  public removeItem(_id: TreeItemId): void {
    throw new Error('Method not implemented yet')
  }

  public updateItem(_item: T): void {
    throw new Error('Method not implemented yet')
  }

  private buildIndexes(): void {
    for (const item of this.items) {
      this.itemById.set(item.id, item)
      this.parentById.set(item.id, item.parent)

      const siblings = this.childrenByParentId.get(item.parent)

      if (siblings) {
        siblings.push(item)
        continue
      }

      this.childrenByParentId.set(item.parent, [item])
    }
  }
}
