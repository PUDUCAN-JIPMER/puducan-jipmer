import { Patient } from '@/schema/patient'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

type DiseaseStats = {
    [disease: string]: {
        male: number[]
        female: number[]
        other: number[]
    }
}

const getAgeGroupIndex = (age: number) => {
    if (age < 5) return 0
    if (age < 10) return 1
    if (age < 20) return 2
    if (age < 30) return 3
    if (age < 40) return 4
    if (age < 50) return 5
    if (age < 60) return 6
    return 7
}

export function generateDiseasePDF(patients: Patient[]) {
    const doc = new jsPDF('landscape', 'mm', 'a4')
    const ageGroups = ['<5', '<10', '<20', '<30', '<40', '<50', '<60', '60+']
    const diseaseStats: DiseaseStats = {}

    let totalMaleGlobal = 0
    let totalFemaleGlobal = 0
    let totalOtherGlobal = 0

    patients.forEach((p) => {
        if (!p.diseases || !p.dob || !p.sex) return

        const birthYear = new Date(p.dob).getFullYear()
        if (Number.isNaN(birthYear)) return
        const currentYear = new Date().getFullYear()
        const age = currentYear - birthYear
        const ageIndex = getAgeGroupIndex(age)

        p.diseases.forEach((disease) => {
            if (!disease) return

            if (!diseaseStats[disease]) {
                diseaseStats[disease] = {
                    male: Array(8).fill(0),
                    female: Array(8).fill(0),
                    other: Array(8).fill(0),
                }
            }

            const normalizedSex = p.sex.toLowerCase().trim()
            if (normalizedSex === 'male') {
                diseaseStats[disease].male[ageIndex]++
                totalMaleGlobal++
            } else if (normalizedSex === 'female') {
                diseaseStats[disease].female[ageIndex]++
                totalFemaleGlobal++
            } else {
                diseaseStats[disease].other[ageIndex]++
                totalOtherGlobal++
            }
        })
    })

    const totalGlobal = totalMaleGlobal + totalFemaleGlobal + totalOtherGlobal

    if (totalGlobal === 0) {
        doc.setFillColor(248, 250, 252)
        doc.rect(0, 0, 297, 28, 'F')

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(18)
        doc.setTextColor(15, 23, 42)
        doc.text('PuduCan — Comprehensive Oncology & Disease Distribution Registry', 14, 16)

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(14)
        doc.setTextColor(51, 65, 85)
        doc.text('No patient data available for report generation.', 14, 45)

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        doc.setTextColor(100, 116, 139)
        doc.text(
            'The report could not generate analytical insights because no valid patient records were provided.',
            14,
            55
        )

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')

        doc.save(`Disease_Report_Comprehensive_${timestamp}.pdf`)
        return
    }

    doc.setFillColor(248, 250, 252)
    doc.rect(0, 0, 297, 28, 'F')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(20)
    doc.setTextColor(15, 23, 42)
    doc.text('PuduCan — Comprehensive Oncology & Disease Distribution Registry', 14, 15)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(100, 116, 139)
    doc.text(
        `Generated Matrix Dataset Asset • Timestamp: ${new Date().toLocaleString()} • Total Active Cases: ${totalGlobal}`,
        14,
        22
    )

    const columns = [
        'Disease Categorization',
        ...ageGroups.map((g) => `M ${g}`),
        ...ageGroups.map((g) => `F ${g}`),
        ...ageGroups.map((g) => `O ${g}`),
        'Total M',
        'Total F',
        'Total O',
        'Grand Total',
    ]

    const tableBodyData = Object.entries(diseaseStats).map(([disease, counts]) => {
        const totalMale = counts.male.reduce((a, b) => a + b, 0)
        const totalFemale = counts.female.reduce((a, b) => a + b, 0)
        const totalOther = counts.other.reduce((a, b) => a + b, 0)
        const grandTotal = totalMale + totalFemale + totalOther

        return [
            disease,
            ...counts.male,
            ...counts.female,
            ...counts.other,
            totalMale,
            totalFemale,
            totalOther,
            grandTotal,
        ]
    })

    autoTable(doc, {
        head: [columns],
        body: tableBodyData,
        startY: 32,
        styles: {
            fontSize: 7.5,
            cellPadding: 2,
            lineColor: [226, 232, 240],
            lineWidth: 0.1,
        },
        headStyles: {
            fillColor: [14, 165, 233],
            textColor: 255,
            fontStyle: 'bold',
        },
        didParseCell: (cellData) => {
            if (cellData.section === 'head') {
                const mLen = ageGroups.length
                const fStart = 1 + mLen
                const oStart = fStart + mLen
                const totalsStart = oStart + mLen

                if (cellData.column.index >= fStart && cellData.column.index < oStart) {
                    cellData.cell.styles.fillColor = [244, 63, 94]
                }
                if (cellData.column.index >= oStart && cellData.column.index < totalsStart) {
                    cellData.cell.styles.fillColor = [139, 92, 246]
                }
                if (cellData.column.index >= totalsStart) {
                    cellData.cell.styles.fillColor = [51, 65, 85]
                }
            }
        },
        margin: { horizontal: 14 },
    })

    doc.addPage()

    doc.setFillColor(248, 250, 252)
    doc.rect(0, 0, 297, 20, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(15, 23, 42)
    doc.text('Clinical Analytics Dashboard & Visual Metrics Projections', 14, 13)

    if (totalGlobal > 0) {
        let insightY = 32
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11)
        doc.setTextColor(30, 41, 59)
        doc.text('Key Statistical Insights', 14, insightY)

        let topDisease = 'None'
        let maxCount = 0
        Object.entries(diseaseStats).forEach(([dis, counts]) => {
            const sum =
                counts.male.reduce((a, b) => a + b, 0) +
                counts.female.reduce((a, b) => a + b, 0) +
                counts.other.reduce((a, b) => a + b, 0)
            if (sum > maxCount) {
                maxCount = sum
                topDisease = dis
            }
        })

        insightY += 8
        doc.setFillColor(241, 245, 249)
        doc.roundedRect(14, insightY, 120, 45, 2, 2, 'F')

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9)
        doc.setTextColor(15, 23, 42)
        doc.text('Primary Diagnostic Trend:', 18, insightY + 8)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(14, 165, 233)
        doc.text(`${topDisease} (${maxCount} Active Files)`, 18, insightY + 13)

        doc.setFont('helvetica', 'bold')
        doc.setTextColor(15, 23, 42)
        doc.text('Demographic Split-Ratio:', 18, insightY + 23)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(71, 85, 105)
        doc.text(
            `• Male Distribution Coefficient: ${((totalMaleGlobal / totalGlobal) * 100).toFixed(1)}%`,
            18,
            insightY + 29
        )
        doc.text(
            `• Female Distribution Coefficient: ${((totalFemaleGlobal / totalGlobal) * 100).toFixed(1)}%`,
            18,
            insightY + 34
        )
        doc.text(
            `• Trans/Other Representation: ${((totalOtherGlobal / totalGlobal) * 100).toFixed(1)}%`,
            18,
            insightY + 39
        )

        let barChartY = 92
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11)
        doc.setTextColor(30, 41, 59)
        doc.text('Volumetric Demographic Distribution (Proportional)', 14, barChartY)

        const graphLeftX = 60
        const labelX = 14
        const graphBaseWidth = 75
        const barHeight = 8
        const spacingY = 5

        const chartItems = [
            { label: 'Male', count: totalMaleGlobal, color: [14, 165, 233] },
            { label: 'Female', count: totalFemaleGlobal, color: [244, 63, 94] },
            { label: 'Trans/Other', count: totalOtherGlobal, color: [139, 92, 246] },
        ]

        barChartY += 6
        chartItems.forEach((item) => {
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(8.5)
            doc.setTextColor(71, 85, 105)
            doc.text(item.label, labelX, barChartY + 5)

            const calculatedWidth = (item.count / totalGlobal) * graphBaseWidth
            const finalWidth = Math.max(calculatedWidth, 6)

            doc.setFillColor(item.color[0], item.color[1], item.color[2])
            doc.rect(graphLeftX, barChartY, finalWidth, barHeight, 'F')

            doc.setFont('helvetica', 'bold')
            doc.setFontSize(8)
            doc.setTextColor(15, 23, 42)
            doc.text(String(item.count), graphLeftX + finalWidth + 4, barChartY + 5)

            barChartY += barHeight + spacingY
        })

        const pieCenterX = 215
        const pieCenterY = 70
        const pieRadius = 32

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11)
        doc.setTextColor(30, 41, 59)
        doc.text('Pathology Core Categorization Weight', 160, 28)

        const colorsPalette = [
            [14, 165, 233],
            [234, 179, 8],
            [16, 185, 129],
            [244, 63, 94],
            [139, 92, 246],
            [100, 116, 139],
        ]

        let currentAngle = 0
        let legendY = 115

        Object.entries(diseaseStats).forEach(([disease, counts], idx) => {
            const diseaseTotal =
                counts.male.reduce((a, b) => a + b, 0) +
                counts.female.reduce((a, b) => a + b, 0) +
                counts.other.reduce((a, b) => a + b, 0)

            if (diseaseTotal === 0) return

            const percentage = diseaseTotal / totalGlobal
            const sliceAngle = percentage * 360
            const color = colorsPalette[idx % colorsPalette.length]

            doc.setFillColor(color[0], color[1], color[2])

            const segments = Math.max(10, Math.round(sliceAngle / 4))
            for (let i = 0; i < segments; i++) {
                const subAngleStart = currentAngle + i * (sliceAngle / segments)
                const subAngleEnd = currentAngle + (i + 1) * (sliceAngle / segments)

                const radStart1 = (subAngleStart * Math.PI) / 180
                const radEnd1 = (subAngleEnd * Math.PI) / 180

                const x1 = pieCenterX + pieRadius * Math.cos(radStart1)
                const y1 = pieCenterY + pieRadius * Math.sin(radStart1)
                const x2 = pieCenterX + pieRadius * Math.cos(radEnd1)
                const y2 = pieCenterY + pieRadius * Math.sin(radEnd1)

                doc.triangle(pieCenterX, pieCenterY, x1, y1, x2, y2, 'F')
            }

            doc.setFillColor(color[0], color[1], color[2])
            doc.rect(160, legendY, 4, 4, 'F')

            doc.setFont('helvetica', 'normal')
            doc.setFontSize(8.5)
            doc.setTextColor(51, 65, 85)
            doc.text(
                `${disease}: ${diseaseTotal} case(s) (${(percentage * 100).toFixed(1)}%)`,
                167,
                legendY + 3.5
            )

            currentAngle += sliceAngle
            legendY += 6
        })

        doc.setFillColor(255, 255, 255)
        doc.circle(pieCenterX, pieCenterY, pieRadius * 0.55, 'F')

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(12)
        doc.setTextColor(15, 23, 42)
        doc.text(`${totalGlobal}`, pieCenterX - 3, pieCenterY + 1)
        doc.setFontSize(6.5)
        doc.setTextColor(148, 163, 184)
        doc.text('TOTAL CASES', pieCenterX - 7, pieCenterY + 4.5)
    }

    doc.setDrawColor(241, 245, 249)
    doc.setLineWidth(0.5)
    doc.line(14, 185, 283, 185)
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(7.5)
    doc.setTextColor(148, 163, 184)
    doc.text(
        'Confidential Content • Medical Information Management System Systems Framework • PuduCan Alpha Build',
        14,
        191
    )

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')

    doc.save(`Disease_Report_Comprehensive_${timestamp}.pdf`)
}
