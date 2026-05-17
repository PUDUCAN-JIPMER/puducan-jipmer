'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { MapPin, Navigation, Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { PatientFormInputs } from '@/schema/patient'
import clsx from 'clsx'

type LocationValue = {
    lat: number
    lng: number
    accuracy?: number | null
    placeName?: string | null
}

export function ColumnFive({ form, isAsha }: { form: any; isAsha?: boolean }) {
    const { control, setValue } = useFormContext<PatientFormInputs>()
    const patient = useWatch({ control }) as PatientFormInputs

    const [isAddingFollowUp, setIsAddingFollowUp] = useState(false)
    const [newRemark, setNewRemark] = useState('')
    const [savingLocation, setSavingLocation] = useState(false)
    const [locationError, setLocationError] = useState('')
    const [manualLat, setManualLat] = useState<string>('')
    const [manualLng, setManualLng] = useState<string>('')
    const [reverseGeocoding, setReverseGeocoding] = useState(false)

    const currentLocation = patient.gpsLocation as LocationValue | null | undefined

    const googleMapsUrl = useMemo(() => {
        if (!currentLocation?.lat || !currentLocation?.lng) return ''
        return `https://www.google.com/maps/search/?api=1&query=${currentLocation.lat},${currentLocation.lng}`
    }, [currentLocation?.lat, currentLocation?.lng])

    useEffect(() => {
        if (!currentLocation?.lat || !currentLocation?.lng) return
        setManualLat(String(currentLocation.lat))
        setManualLng(String(currentLocation.lng))
    }, [currentLocation?.lat, currentLocation?.lng])

    const reverseGeocodeLocation = async (lat: number, lng: number) => {
        setReverseGeocoding(true)
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&accept-language=en&lat=${lat}&lon=${lng}`
            )
            if (!response.ok) return null
            const data = await response.json()
            return data?.display_name ?? null
        } catch (error) {
            console.error('Error fetching place name:', error)
            return null
        } finally {
            setReverseGeocoding(false)
        }
    }

    const clearPreviousLocation = (clearInputs = false) => {
        setLocationError('')
        setValue('gpsLocation', null, { shouldDirty: true })
        if (clearInputs) {
            setManualLat('')
            setManualLng('')
        }
    }

    const saveLocation = async (coords: LocationValue) => {
        const roundedCoords = {
            ...coords,
            lat: Number(coords.lat.toFixed(6)),
            lng: Number(coords.lng.toFixed(6)),
        }
        const placeName = await reverseGeocodeLocation(roundedCoords.lat, roundedCoords.lng)
        setValue('gpsLocation', { ...roundedCoords, placeName }, { shouldDirty: true })
        setLocationError('')
    }

    const parseManualCoordinates = () => {
        const lat = Number(manualLat)
        const lng = Number(manualLng)

        if (!manualLat || !manualLng || Number.isNaN(lat) || Number.isNaN(lng)) {
            return { error: 'Please enter valid latitude and longitude.' }
        }

        if (lat < -90 || lat > 90) {
            return { error: 'Latitude must be between -90 and 90.' }
        }

        if (lng < -180 || lng > 180) {
            return { error: 'Longitude must be between -180 and 180.' }
        }

        return { coords: { lat, lng, accuracy: null } }
    }

    /** Save new follow-up (optimistic, in form state) */
    const handleSaveNewFollowUp = () => {
        if (!newRemark.trim()) return

        const updatedFollowUps = [
            ...(patient.followUps ?? []),
            { remarks: newRemark, date: new Date().toISOString() },
        ]

        setValue('followUps', updatedFollowUps, { shouldDirty: true })
        setNewRemark('')
        setIsAddingFollowUp(false)
    }

    /** Save GPS from browser */
    const handleSaveLocation = async () => {
        setSavingLocation(true)
        clearPreviousLocation(true)
        try {
            if (!navigator.geolocation) {
                setLocationError('Geolocation is not supported by your browser.')
                setSavingLocation(false)
                return
            }
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        await saveLocation({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                            accuracy: position.coords.accuracy,
                        })
                    } catch (error) {
                        console.error('Error saving location:', error)
                        setLocationError('Could not save GPS location. Please try again.')
                    } finally {
                        setSavingLocation(false)
                    }
                },
                (err) => {
                    console.error('Error saving location:', err)
                    setLocationError('Could not get your GPS location. Check browser location permission and try again.')
                    setSavingLocation(false)
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0,
                }
            )
        } catch (e) {
            console.error(e)
            setLocationError('Could not save GPS location. Please try again.')
            setSavingLocation(false)
        }
    }

    const handleSaveManualLocation = async () => {
        const parsed = parseManualCoordinates()
        if (parsed.error) {
            setLocationError(parsed.error)
            return
        }
        clearPreviousLocation()
        await saveLocation(parsed.coords!)
    }

    return (
        <div className={clsx('flex w-full flex-col sm:border-l-2 md:pl-4 gap-4 md:w-1/2 lg:w-1/3', isAsha && 'md:w-2/3 lg:w-full px-2 mx-auto border-none')} >
            {/* --- Follow-Ups Section --- */}
            <div className="w-full space-y-3 pt-2">
                <div className="flex items-center space-x-4">
                    <Label className="text-base font-medium">Follow-ups </Label>
                    <Button
                        type="button"
                        size="icon"
                        className='w-auto px-2 py-1'
                        onClick={() => setIsAddingFollowUp(!isAddingFollowUp)}
                    >
                        <Plus className="h-5 w-5" /> Add
                    </Button>
                </div>
                {isAddingFollowUp && (
                    <div className="bg-muted/50 space-y-4 rounded-lg border p-3">
                        <Label htmlFor="new-remark">Add New Remarks / FollowUp Details</Label>
                        <Textarea
                            id="new-remark"
                            placeholder="Enter follow-up details..."
                            value={newRemark}
                            onChange={(e) => setNewRemark(e.target.value)}
                        />
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsAddingFollowUp(false)}
                            >
                                Cancel
                            </Button>
                            <Button size="sm" variant={'outline'} onClick={handleSaveNewFollowUp}>
                                Save Follow-up
                            </Button>
                        </div>
                    </div>
                )}
                {(patient.followUps?.length ?? 0) > 0 ? (
                    <div className="max-h-72 space-y-4 overflow-y-auto pr-2">
                        {patient.followUps
                            ?.slice()
                            .sort((a, b) => {
                                const dateA = new Date(a?.date ?? 0)
                                const dateB = new Date(b?.date ?? 0)
                                return dateB.getTime() - dateA.getTime()
                            })
                            .map((followUp, idx) => (
                                <div
                                    key={idx}
                                    className="border-primary mb-2 border-l-2 pl-3 text-sm"
                                >
                                    <p className="text-muted-foreground">{followUp?.remarks}</p>
                                    {followUp?.date && (
                                        <p className="text-muted-foreground text-xs">
                                            {new Date(followUp.date).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            ))}
                    </div>
                ) : (
                    !isAddingFollowUp && (
                        <p className="text-muted-foreground py-2 text-center text-sm">
                            No follow-ups yet.
                        </p>
                    )
                )}
            </div>

            {/* --- GPS Section --- */}
            <div className="space-y-3 rounded-xl border bg-muted/20 p-3">
                <div className="flex items-center justify-between gap-2">
                    <div>
                        <Label className="text-sm font-medium">Patient Location</Label>
                    </div>
                    <Button
                        type="button"
                        size="sm"
                        onClick={handleSaveLocation}
                        disabled={savingLocation || reverseGeocoding}
                        className="h-8 shrink-0 rounded-full bg-transparent px-3 text-xs text-white hover:bg-gray-600 border border-gray-600"
                    >
                        <Navigation className="h-4 w-4" />
                        {savingLocation ? 'Saving...' : 'Get Location'}
                    </Button>
                </div>

                <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Latitude</Label>
                            <Input
                                type="number"
                                step="any"
                                min="-90"
                                max="90"
                                placeholder="Lat"
                                value={manualLat}
                                onChange={(e) => setManualLat(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Longitude</Label>
                            <Input
                                type="number"
                                step="any"
                                min="-180"
                                max="180"
                                placeholder="Lng"
                                value={manualLng}
                                onChange={(e) => setManualLng(e.target.value)}
                            />
                        </div>
                    </div>
                    <Button type="button" className="w-full" variant="outline" size="sm" onClick={handleSaveManualLocation} disabled={reverseGeocoding}>
                        {reverseGeocoding ? 'Finding place...' : 'Save Coordinates'}
                    </Button>
                </div>

                {locationError && (
                    <p className="text-center text-xs text-red-600">{locationError}</p>
                )}

                {currentLocation && (
                    <div className="space-y-2 rounded-lg bg-background p-2 text-xs">
                        <div className="flex items-start gap-2">
                            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                            <div className="min-w-0 flex-1 space-y-1">
                                <p className="font-medium">Saved location</p>
                                <p className="text-muted-foreground">
                                    {currentLocation.lat?.toFixed(6) ?? 'N/A'}, {currentLocation.lng?.toFixed(6) ?? 'N/A'}
                                </p>
                                {typeof currentLocation.accuracy === 'number' && (
                                    <p className="text-muted-foreground">
                                        Accuracy: ±{Math.round(currentLocation.accuracy)}m
                                    </p>
                                )}
                                {currentLocation.placeName && (
                                    <p className="text-muted-foreground line-clamp-2">
                                        {currentLocation.placeName}
                                    </p>
                                )}
                            </div>
                        </div>

                        <Button
                            type="button"
                            className="h-8 w-full text-xs"
                            variant='outline'
                            onClick={() => window.open(googleMapsUrl, '_blank', 'noopener,noreferrer')}
                        >
                            <MapPin className="h-3.5 w-3.5" />
                            Open in Google Maps
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
