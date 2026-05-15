'use client'
import { TableCell, TableRow } from '@/components/ui/table'
import { memo } from 'react'
import { GenericCell } from './GenericCell'
import { RowActions } from './RowActions'
import { RefreshCcw } from 'lucide-react'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'

type Header = {
  name: string
  key: string
}

type RowDataBase = {
  id: string | number
  [key: string]: unknown
}

type GenericRowProps = {
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
      className="border-border hidden border-b font-light sm:table-row cursor-pointer hover:bg-muted/40 transition-colors"
>
      <TableCell className="border-border border-r text-center">{index + 1}</TableCell>

      {headers.map((header, index) => (
        <TableCell
          key={index}
          className={`border-border border-r text-center ${
            header.key === 'name' ? 'font-semibold' : ''
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <GenericCell
              value={rowData[header.key]}
              keyName={header.key}
              isPatientTab={isPatientTab}
            />
            {isPatientTab && header.key === 'name' && Boolean(rowData._hasPendingWrites) && (
              <TooltipProvider>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <RefreshCcw className="h-4 w-4 animate-spin text-amber-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Pending Sync: Changes will be uploaded when online.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
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
