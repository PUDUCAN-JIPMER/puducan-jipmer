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
    <div className="space-y-1">
      <div className="capitalize">{diseases[0]}</div>

      {!expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="text-muted-foreground text-sm hover:underline"
        >
          +{diseases.length - 1} more...
        </button>
      ) : (
        <ul className="list-inside list-disc space-y-1">
          {diseases.slice(1).map((disease, i) => (
            <li key={i} className="capitalize">
              {disease}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}