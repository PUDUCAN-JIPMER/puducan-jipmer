import { describe, it, expect } from 'vitest'
import { formatFieldValue } from '@/components/dialogs/formatFieldValue'

describe('formatFieldValue', () => {
  it('returns N/A for null or empty', () => {
    expect(formatFieldValue('anything', null)).toBe('N/A')
    expect(formatFieldValue('anything', '')).toBe('N/A')
  })

  it('formats arrays of strings', () => {
    expect(formatFieldValue('diseases', ['Cancer', 'Diabetes'])).toBe('Cancer, Diabetes')
  })

  it('formats gpsLocation', () => {
    expect(formatFieldValue('gpsLocation', { lat: 12.34, lng: 56.78 })).toBe('Lat: 12.34, Lng: 56.78')
  })

  it('formats assignedHospital', () => {
    expect(formatFieldValue('assignedHospital', { id: 'h1', name: 'City Hospital' })).toBe('City Hospital')
  })

  it('formats insurance object', () => {
    expect(formatFieldValue('insurance', { type: 'Government', id: 'G-123' })).toBe('Government (G-123)')
    expect(formatFieldValue('insurance', { type: 'Private' })).toBe('Private')
  })

  it('formats stageOfTheCancer', () => {
    expect(formatFieldValue('stageOfTheCancer', { stage: 'Stage 0', subStage: 'B' })).toBe('Stage 0 - B')
    expect(formatFieldValue('stageOfTheCancer', { stage: 'Stage II' })).toBe('Stage II')
  })

  it('formats booleans and strings', () => {
    expect(formatFieldValue('transferred', true)).toBe('Yes')
    expect(formatFieldValue('name', 'john')).toBe('John')
  })
})
