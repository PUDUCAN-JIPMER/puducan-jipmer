'use client'
import { memo } from 'react'
import { GenericCell } from './GenericCell'
import { RowActions } from './RowActions'

type Header = {
    name: string
    key: string
}

type RowDataBase = {
    id: string | number
    [key: string]: unknown
}

type GenericMobileRowProps = {
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

// ✅ Mobile card row (not inside <table>)
export const GenericMobileRow = memo(function GenericMobileRow(props: GenericMobileRowProps) {
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
        <div
            key={rowData.id + 'mobile'}
            className="flex flex-col gap-2 border-1 border-b p-4 sm:hidden"
        >
            {/* <div className="text-muted-foreground text-sm">#{index + 1}</div> */}
            <div className="flex items-start justify-between">
                <div className="text-muted-foreground text-sm">#{index + 1}</div>

                <RowActions
                    rowData={rowData}
                    activeTab={activeTab}
                    isPatientTab={isPatientTab}
                    isRemovedPatientsTab={isRemovedPatientsTab}
                    onView={onView}
                    onDelete={onDelete}
                />
            </div>
            {/* <div className="flex w-full justify-evenly px-3 py-2"> */}
            <div className="flex w-full flex-col px-3 py-2">
                {/* <div className="flex flex-col"> */}
                <div className="mt-3 flex flex-col gap-3">
                    {headers.map((header, index) => (
                        <div key={index} className="flex w-full justify-between space-y-3 text-sm">
                            <span className="text-muted-foreground mr-2 font-medium">
                                {header.name}:
                            </span>
                            <GenericCell
                                value={rowData[header.key]}
                                keyName={header.key}
                                isPatientTab={isPatientTab}
                            />
                        </div>
                    ))}
                </div>

                {/* <div className="border-l-2 mx-4"></div> */}

                {/* <div className="flex h-full flex-col gap-2 pt-2">
                    <RowActions
                        rowData={rowData}
                        activeTab={activeTab}
                        isPatientTab={isPatientTab}
                        isRemovedPatientsTab={isRemovedPatientsTab}
                        onView={onView}
                        onDelete={onDelete}
                    />
                </div> */}
            </div>
        </div>
    )
})
