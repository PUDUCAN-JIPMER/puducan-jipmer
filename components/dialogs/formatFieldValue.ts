export function formatFieldValue(key: string, value: any): string {
  if (value == null) return 'N/A'
  if (value === '') return 'N/A'

  if (Array.isArray(value)) {
    if (value.length === 0) return 'N/A'
    if (typeof value[0] === 'string') return value.join(', ')
    if (typeof value[0] === 'object') {
      return value.map((v) => `${v.date || ''}${v.date && v.remarks ? ' - ' : ''}${v.remarks || ''}`).join('; ')
    }
  }

  if (typeof value === 'object') {
    // Special handling for known object-shaped fields
    if (key === 'gpsLocation') return `Lat: ${value.lat}, Lng: ${value.lng}`
    if (key === 'assignedHospital') return `${value.name}`
    if (key === 'insurance') return `${value.type}${value.id ? ` (${value.id})` : ''}`
    if (key === 'stageOfTheCancer') {
      const stage = value?.stage ?? ''
      const sub = value?.subStage ?? ''
      if (!stage && !sub) return 'N/A'
      return `${stage}${sub ? ` - ${sub}` : ''}`.trim()
    }

    try {
      return JSON.stringify(value)
    } catch (_) {
      return String(value)
    }
  }

  if (typeof value === 'boolean') return value ? 'Yes' : 'No'

  if (typeof value === 'string') {
    return value.charAt(0).toUpperCase() + value.slice(1)
  }

  return String(value)
}

export default formatFieldValue
