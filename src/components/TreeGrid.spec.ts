import { defineComponent } from 'vue'
import { shallowMount } from '@vue/test-utils'

import { sampleItems } from '@/app/sample-data'
import TreeGrid from './TreeGrid.vue'

vi.mock('ag-grid-vue3', () => ({
  AgGridVue: defineComponent({
    name: 'AgGridVue',
    props: {
      columnDefs: { type: Array, required: true },
      defaultColDef: { type: Object, required: true },
      rowData: { type: Array, required: true },
      treeData: { type: Boolean, required: true },
      groupDisplayType: { type: String, required: true },
      groupDefaultExpanded: { type: Number, required: true },
      getDataPath: { type: Function, required: true },
      getRowId: { type: Function, required: true },
      animateRows: { type: Boolean, required: true },
      headerHeight: { type: Number, required: true },
      rowHeight: { type: Number, required: true },
      domLayout: { type: String, required: true },
      suppressCellFocus: { type: Boolean, required: true },
      suppressRowHoverHighlight: { type: Boolean, required: true },
      overlayNoRowsTemplate: { type: String, required: true },
    },
    template: '<div class="ag-grid-vue-stub" />',
  }),
}))

describe('TreeGrid', () => {
  it('passes derived tree data and grid configuration to AgGridVue', () => {
    const wrapper = shallowMount(TreeGrid, {
      props: {
        items: sampleItems,
      },
    })

    const grid = wrapper.getComponent({ name: 'AgGridVue' })
    const rowData = grid.props('rowData') as Array<{
      id: string | number
      itemType: string
      path: string[]
      label: string
    }>
    const columnDefs = grid.props('columnDefs') as Array<{
      headerName: string
      valueGetter?: (params: { node?: { rowIndex?: number | null }; data?: unknown }) => unknown
      cellClass?: (params: { data?: { itemType?: string } }) => string
      cellRendererParams?: {
        innerRenderer: (params: { data?: { itemType?: string } }) => string
      }
    }>
    const categoryColumn = columnDefs[1]

    expect(wrapper.text()).toContain('Режим: просмотр')

    expect(grid.props('treeData')).toBe(true)
    expect(grid.props('groupDisplayType')).toBe('custom')
    expect(grid.props('groupDefaultExpanded')).toBe(-1)
    expect(grid.props('animateRows')).toBe(false)
    expect(grid.props('headerHeight')).toBe(74)
    expect(grid.props('rowHeight')).toBe(78)
    expect(grid.props('domLayout')).toBe('autoHeight')
    expect(grid.props('suppressCellFocus')).toBe(true)
    expect(grid.props('suppressRowHoverHighlight')).toBe(true)
    expect(grid.props('overlayNoRowsTemplate')).toBe('Нет данных для отображения')
    expect(grid.props('defaultColDef')).toMatchObject({
      sortable: false,
      filter: false,
      resizable: false,
      suppressMovable: true,
      editable: false,
    })

    expect(rowData).toHaveLength(sampleItems.length)
    expect(rowData[0]).toMatchObject({
      id: 1,
      label: 'Айтем 1',
      itemType: 'Группа',
      path: ['1'],
    })
    expect(rowData[1]).toMatchObject({
      id: '91064cee',
      itemType: 'Группа',
      path: ['1', '91064cee'],
    })
    expect(rowData[2]).toMatchObject({
      id: 3,
      itemType: 'Элемент',
      path: ['1', '3'],
    })
    expect(rowData[3]).toMatchObject({
      id: 4,
      itemType: 'Группа',
      path: ['1', '91064cee', '4'],
    })

    const getDataPath = grid.props('getDataPath') as (data: (typeof rowData)[number]) => string[]
    const getRowId = grid.props('getRowId') as (params: { data: { id: string | number } }) => string

    expect(getDataPath(rowData[3])).toEqual(['1', '91064cee', '4'])
    expect(getRowId({ data: rowData[1] })).toBe('91064cee')

    expect(columnDefs.map((column) => column.headerName)).toEqual([
      '№ п\\п',
      'Категория',
      'Наименование',
    ])
    expect(columnDefs[0].valueGetter?.({ node: { rowIndex: 0 } })).toBe(1)
    expect(columnDefs[0].valueGetter?.({ node: { rowIndex: null } })).toBe('')
    expect(categoryColumn.valueGetter?.({ data: rowData[0] })).toBe('Группа')
    expect(categoryColumn.valueGetter?.({})).toBe('')
    expect(categoryColumn.cellRendererParams?.innerRenderer({ data: rowData[0] })).toBe('Группа')
    expect(categoryColumn.cellRendererParams?.innerRenderer({})).toBe('')
    expect(categoryColumn.cellClass?.({ data: rowData[0] })).toContain(
      'tree-grid__cell--group',
    )
    expect(categoryColumn.cellClass?.({ data: rowData[2] })).toBe(
      'tree-grid__cell tree-grid__cell--category',
    )
  })

  it('builds an empty grid state for an empty dataset', () => {
    const wrapper = shallowMount(TreeGrid, {
      props: {
        items: [],
      },
    })

    const grid = wrapper.getComponent({ name: 'AgGridVue' })

    expect(grid.props('rowData')).toEqual([])
  })
})
