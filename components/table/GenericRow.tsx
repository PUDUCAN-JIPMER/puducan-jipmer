'use client'
import { TableCell, TableRow } from '@/components/ui/table'
import { memo } from 'react'
import { GenericCell } from './GenericCell'
import { RowActions } from './RowActions'
import { Checkbox } from '../ui/checkbox'

type Header = {
  name: string
  key: string
}

type RowDataBase = {
  id: string | number
  [key: string]: unknown
}

type GenericRowProps = {
  isSelected?: boolean
  onToggleSelect: () => void
  activeTab: string
  isPatientTab: boolean
  isRemovedPatientsTab?: boolean
  rowData: RowDataBase
  index: number
  onView: (data: RowDataBase) => void
  onUpdate: (data: RowDataBase) => void
  onDelete: (data: RowDataBase) => void
  headers: Header[]
}

// ✅ Only the desktop <tr>
export const GenericRow = memo(function GenericRow(props: GenericRowProps) {
  const {
    isSelected = false,
    onToggleSelect,
    activeTab,
    isPatientTab,
    rowData,
    isRemovedPatientsTab,
    index,
    onView,
    onDelete,
    headers,
  } = props

  return (
    <TableRow
      key={rowData.id}
      onClick={() => onView(rowData)}
      data-selected={isSelected}
      className={`border-border hidden border-b font-light sm:table-row cursor-pointer hover:bg-muted/40 transition-colors ${
  isSelected ? 'bg-primary/5 dark:bg-primary/10' : ''
}`}
    >
      <TableCell className="border-border border-r text-center">
        <div className='flex items-center justify-center'>
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggleSelect}
            aria-label={`Select row ${index + 1}`}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </TableCell>
      <TableCell className="border-border border-r text-center">{index + 1}</TableCell>

      {headers.map((header, index) => (
        <TableCell
          key={index}
          className={`border-border border-r text-center ${header.key === 'name' ? 'font-semibold' : ''
            }`}
        >
          <GenericCell
            value={rowData[header.key]}
            keyName={header.key}
            isPatientTab={isPatientTab}
          />
        </TableCell>
      ))}

      <TableCell className="space-x-2 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <RowActions
          rowData={rowData}
          activeTab={activeTab}
          isPatientTab={isPatientTab}
          isRemovedPatientsTab={isRemovedPatientsTab}
          onView={onView}
          onDelete={onDelete}
        />
      </TableCell>
    </TableRow>
  )
})
