import React, { useState } from 'react'

interface DiseasesCellProps {
  diseases?: string[]
}

export function DiseasesCell({ diseases }: DiseasesCellProps) {
  const [expanded, setExpanded] = useState(false)

  if (!diseases?.length) {
    return <span className="text-muted-foreground italic">Suspected Case</span>
  }

  if (diseases.length === 1) {
    return <div className="capitalize">{diseases[0]}</div>
  }

  return (
   <div className="flex items-start gap-2"> 
      <div className="capitalize">{diseases[0]}</div>

            {!expanded ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setExpanded(true)
          }}
          className="text-muted-foreground text-sm hover:underline"
        >
          +{diseases.length - 1} more...
        </button>
      ) : (
        <div className="flex flex-col">
          <ul className="list-inside list-disc space-y-1">
            {diseases.slice(1).map((disease, i) => (
              <li key={i} className="capitalize">
                {disease}
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setExpanded(false)
            }}
            className="text-muted-foreground text-sm hover:underline"
          >
            Show Less
          </button>
        </div>
      )}
    </div>
  )
}