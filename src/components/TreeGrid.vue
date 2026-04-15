<template>
  <section class="tree-grid">
    <p class="tree-grid__mode">Режим: просмотр</p>

    <div class="tree-grid__viewport">
      <AgGridVue
        class="ag-theme-quartz tree-grid__table"
        :column-defs="columnDefs"
        :default-col-def="defaultColDef"
        :row-data="rowData"
        :tree-data="true"
        :group-display-type="'custom'"
        :group-default-expanded="-1"
        :get-data-path="getDataPath"
        :get-row-id="getRowId"
        :animate-rows="false"
        :header-height="74"
        :row-height="78"
        :dom-layout="'autoHeight'"
        :suppress-cell-focus="true"
        :suppress-row-hover-highlight="true"
        overlay-no-rows-template="Нет данных для отображения"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import {
  ClientSideRowModelModule,
  ModuleRegistry,
  type ColDef,
  type GetDataPath,
  type GetRowIdParams,
  type ICellRendererParams,
} from 'ag-grid-community'
import { TreeDataModule } from 'ag-grid-enterprise'

import type { DemoItem } from '@/app/sample-data'
import { TreeStore } from '@/domain/tree-store/TreeStore'

ModuleRegistry.registerModules([ClientSideRowModelModule, TreeDataModule])

const GROUP_LABEL = 'Группа'
const ELEMENT_LABEL = 'Элемент'

interface TreeGridRow extends DemoItem {
  itemType: typeof GROUP_LABEL | typeof ELEMENT_LABEL
  path: string[]
}

const props = defineProps<{
  items: DemoItem[]
}>()

const defaultColDef: ColDef<TreeGridRow> = {
  sortable: false,
  filter: false,
  resizable: false,
  suppressMovable: true,
  editable: false,
}

const getDataPath: GetDataPath<TreeGridRow> = (data) => data.path

const getRowId = (params: GetRowIdParams<TreeGridRow>) => String(params.data.id)

const treeStore = computed(() => new TreeStore(props.items))

const rowData = computed<TreeGridRow[]>(() => {
  const store = treeStore.value

  return props.items.map((item) => {
    const parentsChain = store.getAllParents(item.id)
    const hasChildren = store.getChildren(item.id).length > 0

    return {
      ...item,
      itemType: hasChildren ? GROUP_LABEL : ELEMENT_LABEL,
      path: [...parentsChain].reverse().map((parent) => String(parent.id)),
    }
  })
})

const columnDefs: ColDef<TreeGridRow>[] = [
  {
    headerName: '№ п\\п',
    colId: 'rowNumber',
    width: 128,
    maxWidth: 128,
    valueGetter: (params) =>
      params.node?.rowIndex === null || params.node?.rowIndex === undefined
        ? ''
        : params.node.rowIndex + 1,
    cellClass: 'tree-grid__cell tree-grid__cell--number',
    headerClass: 'tree-grid__header tree-grid__header--number',
  },
  {
    headerName: 'Категория',
    colId: 'itemType',
    width: 590,
    minWidth: 360,
    showRowGroup: true,
    cellRenderer: 'agGroupCellRenderer',
    cellRendererParams: {
      suppressCount: true,
      innerRenderer: (params: ICellRendererParams<TreeGridRow>) => params.data?.itemType ?? '',
    },
    valueGetter: (params) => params.data?.itemType ?? '',
    cellClass: (params) =>
      params.data?.itemType === GROUP_LABEL
        ? 'tree-grid__cell tree-grid__cell--category tree-grid__cell--group'
        : 'tree-grid__cell tree-grid__cell--category',
    headerClass: 'tree-grid__header',
  },
  {
    headerName: 'Наименование',
    field: 'label',
    flex: 1,
    minWidth: 320,
    cellClass: 'tree-grid__cell tree-grid__cell--name',
    headerClass: 'tree-grid__header',
  },
]
</script>

<style scoped>
.tree-grid {
  padding: 28px 24px 32px;
  border-radius: 0;
  background: #f3f2f1;
  border: 1px solid #ece8e1;
}

.tree-grid__mode {
  margin: 0 0 20px;
  font-size: 28px;
  line-height: 1.2;
  font-weight: 500;
  color: #4a90e2;
}

.tree-grid__viewport {
  overflow-x: auto;
}

.tree-grid__table {
  min-width: 980px;
  --ag-font-family: 'Manrope', 'Avenir Next', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  --ag-font-size: 18px;
  --ag-foreground-color: #474747;
  --ag-background-color: #ffffff;
  --ag-header-foreground-color: #4b4b4b;
  --ag-header-background-color: #ffffff;
  --ag-odd-row-background-color: #ffffff;
  --ag-border-color: #d4d0c8;
  --ag-row-border-color: #d4d0c8;
  --ag-header-column-separator-color: #d4d0c8;
  --ag-row-hover-color: transparent;
  --ag-selected-row-background-color: #ffffff;
  --ag-range-selection-border-color: transparent;
  --ag-cell-horizontal-border: 1px solid #d4d0c8;
  --ag-wrapper-border-radius: 10px;
  --ag-borders: solid 1px;
  --ag-header-column-resize-handle-display: none;
  --ag-icon-size: 18px;
}

:deep(.ag-root-wrapper) {
  border-radius: 10px;
  overflow: hidden;
  box-shadow: none;
}

:deep(.ag-header) {
  border-bottom: 1px solid #d4d0c8;
}

:deep(.ag-header-cell) {
  padding-inline: 18px;
}

:deep(.ag-header-cell-label) {
  justify-content: flex-start;
}

:deep(.ag-cell) {
  display: flex;
  align-items: center;
  padding-inline: 18px;
  border-right: none;
}

:deep(.ag-cell-value) {
  width: 100%;
}

:deep(.ag-group-value) {
  font-weight: inherit;
}

:deep(.ag-group-cell-renderer) {
  display: inline-flex;
  align-items: center;
  min-height: 100%;
  gap: 10px;
}

:deep(.ag-group-expanded),
:deep(.ag-group-contracted) {
  color: #5a5a5a;
}

:deep(.ag-row-last .ag-cell) {
  border-bottom: none;
}

:deep(.tree-grid__header) {
  font-size: 24px;
  line-height: 1.1;
  font-weight: 700;
  color: #4b4b4b;
}

:deep(.tree-grid__header--number .ag-header-cell-label) {
  justify-content: center;
}

:deep(.tree-grid__cell) {
  font-size: 22px;
  line-height: 1.15;
  color: #535353;
}

:deep(.tree-grid__cell--number) {
  justify-content: center;
  font-weight: 700;
  color: #4b4b4b;
}

:deep(.tree-grid__cell--category) {
  font-weight: 500;
}

:deep(.tree-grid__cell--group) {
  font-weight: 700;
  color: #454545;
}

:deep(.tree-grid__cell--name) {
  font-weight: 700;
  color: #4b4b4b;
}

@media (max-width: 1024px) {
  .tree-grid {
    padding: 20px 16px 24px;
  }

  .tree-grid__mode {
    margin-bottom: 16px;
    font-size: 22px;
  }

  .tree-grid__table {
    --ag-font-size: 16px;
  }

  :deep(.tree-grid__header) {
    font-size: 18px;
  }

  :deep(.tree-grid__cell) {
    font-size: 18px;
  }
}
</style>
