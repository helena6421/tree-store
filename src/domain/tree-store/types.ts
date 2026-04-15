export type TreeItemId = string | number

export interface TreeItem {
  id: TreeItemId
  parent: TreeItemId | null
}

export interface ITreeStore<T extends TreeItem> {
  getAll(): T[]
  getItem(id: TreeItemId): T | undefined
  getChildren(id: TreeItemId): T[]
  getAllChildren(id: TreeItemId): T[]
  getAllParents(id: TreeItemId): T[]
  addItem(item: T): void
  removeItem(id: TreeItemId): void
  updateItem(item: T): void
}
