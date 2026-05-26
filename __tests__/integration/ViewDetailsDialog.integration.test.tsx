import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ViewDetailsDialog from '@/components/dialogs/ViewDetailsDialog'

describe('ViewDetailsDialog integration', () => {
  it('renders formatted stageOfTheCancer value', () => {
    const patient = {
      name: 'Test Patient',
      stageOfTheCancer: { stage: 'Stage 0', subStage: 'B' },
    }

    const fieldsToDisplay = [{ label: 'Stage of the Cancer', key: 'stageOfTheCancer' }]

    render(
      <ViewDetailsDialog
        open={true}
        onOpenChange={() => { }}
        rowData={patient as any}
        fieldsToDisplay={fieldsToDisplay}
      />
    )

    // label and formatted value should be visible
    expect(screen.getByText('Stage of the Cancer')).toBeTruthy()
    expect(screen.getByText('Stage 0 - B')).toBeTruthy()
  })
})
