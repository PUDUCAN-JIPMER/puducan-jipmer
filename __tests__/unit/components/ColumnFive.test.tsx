import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

import { ColumnFive } from '@/components/forms/patient/columns/column-five/ColumnFive'
import { PatientFormInputs } from '@/schema/patient'

function TestWrapper() {
    const form = useForm<PatientFormInputs>({
        defaultValues: {
            name: 'Test Patient',
            sex: 'female',
            address: 'Puducherry',
            assignedHospital: { id: 'jipmer-main-001', name: 'JIPMER Puducherry' },
            hasAadhaar: true,
            followUps: [],
            gpsLocation: null,
        },
    })

    return (
        <FormProvider {...form}>
            <ColumnFive form={form} />
        </FormProvider>
    )
}

describe('ColumnFive location picker', () => {
    beforeEach(() => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({ display_name: 'JIPMER, Puducherry, India' }),
            })
        )
        vi.spyOn(window, 'open').mockImplementation(() => null)
    })

    afterEach(() => {
        vi.restoreAllMocks()
        vi.unstubAllGlobals()
    })

    it('saves manual coordinates with correct latitude/longitude order, place name, and Google Maps URL', async () => {
        const user = userEvent.setup()
        render(<TestWrapper />)

        await user.type(screen.getByPlaceholderText('Lat'), '11.9498194')
        await user.type(screen.getByPlaceholderText('Lng'), '79.7994787')
        await user.click(screen.getByRole('button', { name: /save coordinates/i }))

        expect(await screen.findByText('11.949819, 79.799479')).toBeInTheDocument()
        expect(screen.getByText('JIPMER, Puducherry, India')).toBeInTheDocument()

        expect(fetch).toHaveBeenCalledWith(
            'https://nominatim.openstreetmap.org/reverse?format=jsonv2&accept-language=en&lat=11.949819&lon=79.799479'
        )

        await user.click(screen.getByRole('button', { name: /open in google maps/i }))

        expect(window.open).toHaveBeenCalledWith(
            'https://www.google.com/maps/search/?api=1&query=11.949819,79.799479',
            '_blank',
            'noopener,noreferrer'
        )
    })

    it('shows validation errors for invalid latitude and does not save coordinates', async () => {
        const user = userEvent.setup()
        render(<TestWrapper />)

        await user.type(screen.getByPlaceholderText('Lat'), '100')
        await user.type(screen.getByPlaceholderText('Lng'), '79.7994787')
        await user.click(screen.getByRole('button', { name: /save coordinates/i }))

        expect(screen.getByText('Latitude must be between -90 and 90.')).toBeInTheDocument()
        expect(screen.queryByText(/saved location/i)).not.toBeInTheDocument()
        expect(fetch).not.toHaveBeenCalled()
    })

    it('saves browser GPS coordinates and displays reported accuracy', async () => {
        const user = userEvent.setup()
        const getCurrentPosition = vi.fn((success) => {
            success({
                coords: {
                    latitude: 11.9498194,
                    longitude: 79.7994787,
                    accuracy: 12.4,
                },
            })
        })

        Object.defineProperty(navigator, 'geolocation', {
            configurable: true,
            value: { getCurrentPosition },
        })

        render(<TestWrapper />)

        await user.click(screen.getByRole('button', { name: /get location/i }))

        await waitFor(() => {
            expect(getCurrentPosition).toHaveBeenCalledWith(expect.any(Function), expect.any(Function), {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            })
        })

        expect(await screen.findByText('11.949819, 79.799479')).toBeInTheDocument()
        expect(screen.getByText('Accuracy: ±12m')).toBeInTheDocument()
    })
})
