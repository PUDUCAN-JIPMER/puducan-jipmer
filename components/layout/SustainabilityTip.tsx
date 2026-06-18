'use client'
import { useEffect, useState } from 'react'

const tips = [
    "Reduce paper usage by using digital records.",
    "Switch off unused lights in hospital rooms.",
    "Encourage reusable bottles to reduce plastic waste.",
    "Print only necessary medical documents.",
    "Turn off medical equipment when not in use to save electricity.",
    "Use energy-efficient lighting in healthcare facilities.",
    "Promote digital prescriptions to reduce paper waste.",
    "Reduce water wastage by fixing leaking taps promptly.",
    "Use reusable medical supplies wherever safe and possible.",
    "Dispose of biomedical waste responsibly.",
    "Encourage staff to switch off monitors when idle.",
    "Minimize single-use plastics in healthcare settings.",
    "Prefer eco-friendly cleaning products when available.",
    "Save electricity by using natural daylight during daytime.",
    "Encourage double-sided printing to reduce paper use.",
    "Switch to digital reports to reduce unnecessary printing.",
    "Turn off fans and ACs in unused rooms.",
    "Promote proper waste segregation in hospitals.",
    "Reduce food waste in healthcare cafeterias.",
    "Use rechargeable batteries when possible.",
    "Encourage eco-conscious commuting like cycling or carpooling.",
    "Avoid unnecessary water flow while washing hands.",
    "Reduce energy consumption by unplugging unused devices.",
    "Plant greenery around healthcare facilities for cleaner air.",
    "Support recycling initiatives in hospitals and clinics.",
    "Use cloth bags instead of plastic bags.",
    "Encourage awareness about sustainability among staff.",
    "Reduce unnecessary packaging of medical supplies.",
    "Choose refillable stationery over disposable items.",
    "Save paper by sharing reports digitally.",
    "Use motion-sensor lighting in low-traffic areas.",
    "Maintain medical equipment regularly for better efficiency.",
    "Encourage proper disposal of expired medicines.",
    "Reduce carbon footprint by optimizing transportation.",
    "Use reusable cups instead of disposable ones.",
    "Educate patients about environmental sustainability.",
    "Choose sustainable alternatives whenever possible.",
    "Keep hospital spaces clean to improve overall efficiency.",
    "Reduce unnecessary electricity usage during daytime.",
    "Small sustainable actions today create a healthier tomorrow."
]

export default function SustainabilityTip() {
    const [tip, setTip] = useState(tips[0])
    const [expanded, setExpanded] = useState(false)

    useEffect(() => {
        const randomTip = tips[Math.floor(Math.random() * tips.length)]
        setTip(randomTip)
    }, [])

    const shortTip = tip.length > 40 ? tip.slice(0, 40) + '...' : tip

    return (
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <span className="shrink-0">
                🌱 <strong className="text-foreground">Daily Sustainability Tip:</strong>
            </span>
            <span>
                {expanded ? tip : shortTip}
            </span>
            {tip.length > 40 && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="underline text-xs whitespace-nowrap shrink-0"
                >
                    {expanded ? 'Less' : 'More'}
                </button>
            )}
        </div>
    )
}
