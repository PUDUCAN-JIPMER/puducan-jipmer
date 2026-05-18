'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { MapPin, Navigation, Plus } from 'lucide-react'
import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { PatientFormInputs } from '@/schema/patient'
import clsx from 'clsx'

export function ColumnFive({ form, isAsha }: { form: any; isAsha?: boolean }) {
    const { getValues, setValue } = useFormContext<PatientFormInputs>()
    const patient = getValues()

    const [isAddingFollowUp, setIsAddingFollowUp] = useState(false)
    const [newRemark, setNewRemark] = useState('')
    const [savingLocation, setSavingLocation] = useState(false)
    const [manualLat, setManualLat] = useState<string>('')
    const [manualLng, setManualLng] = useState<string>('')
    const [locationError, setLocationError] = useState('')
    const [reverseGeocoding] = useState(false)

    const currentLocation = patient.gpsLocation as {
        lat?: number
        lng?: number
        accuracy?: number | null
        placeName?: string
    }

    const googleMapsUrl =
        currentLocation?.lat && currentLocation?.lng
            ? `https://www.google.com/maps?q=${currentLocation.lat},${currentLocation.lng}`
            : '#'

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
        try {
            if (!navigator.geolocation) {
                alert('Geolocation is not supported by your browser')
                return
            }
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const coords = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                    }
                    setValue('gpsLocation', coords, { shouldDirty: true })
                    setSavingLocation(false)
                },
                (err) => {
                    console.error('Error saving location:', err)
                    setLocationError(
                        'Could not get your GPS location. Check browser location permission and try again.'
                    )
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
            setSavingLocation(false)
        }
    }

    /** Save manually entered lat/lng */
    const handleSaveManualLocation = () => {
        if (!manualLat || !manualLng) {
            alert('Please enter both latitude and longitude')
            return
        }
        const coords = {
            lat: parseFloat(manualLat),
            lng: parseFloat(manualLng),
            accuracy: null,
        }
        setValue('gpsLocation', coords, { shouldDirty: true })
    }

    return (
        <div
            className={clsx(
                'flex w-full flex-col gap-4 sm:border-l-2 md:w-1/2 md:pl-4 lg:w-1/3',
                isAsha && 'mx-auto border-none px-2 md:w-2/3 lg:w-full'
            )}
        >
            {/* --- Follow-Ups Section --- */}
            <div className="w-full space-y-3 pt-2">
                <div className="flex items-center space-x-4">
                    <Label className="text-base font-medium">Follow-ups </Label>
                    <Button
                        type="button"
                        size="icon"
                        className="w-auto px-2 py-1"
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
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setIsAddingFollowUp(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant={'outline'}
                                onClick={handleSaveNewFollowUp}
                            >
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
            <div className="bg-muted/20 space-y-3 rounded-xl border p-3">
                <div className="flex items-center justify-between gap-2">
                    <div>
                        <Label className="text-sm font-medium">Patient Location</Label>
                    </div>
                    <Button
                        type="button"
                        size="sm"
                        onClick={handleSaveLocation}
                        disabled={savingLocation || reverseGeocoding}
                        className="h-8 shrink-0 rounded-full border border-gray-600 bg-transparent px-3 text-xs text-white hover:bg-gray-600"
                    >
                        <Navigation className="h-4 w-4" />
                        {savingLocation ? 'Saving...' : 'Get Location'}
                    </Button>
                </div>

                <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <Label className="text-muted-foreground text-xs">Latitude</Label>
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
                            <Label className="text-muted-foreground text-xs">Longitude</Label>
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
                    <Button
                        type="button"
                        className="w-full"
                        variant="outline"
                        size="sm"
                        onClick={handleSaveManualLocation}
                        disabled={reverseGeocoding}
                    >
                        {reverseGeocoding ? 'Finding place...' : 'Save Coordinates'}
                    </Button>
                </div>

                {locationError && (
                    <p className="text-center text-xs text-red-600">{locationError}</p>
                )}

                {currentLocation && (
                    <div className="bg-background space-y-2 rounded-lg p-2 text-xs">
                        <div className="flex items-start gap-2">
                            <MapPin className="text-primary mt-0.5 h-3.5 w-3.5 shrink-0" />
                            <div className="min-w-0 flex-1 space-y-1">
                                <p className="font-medium">Saved location</p>
                                <p className="text-muted-foreground">
                                    {currentLocation.lat?.toFixed(6) ?? 'N/A'},{' '}
                                    {currentLocation.lng?.toFixed(6) ?? 'N/A'}
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
                            variant="outline"
                            onClick={() =>
                                window.open(googleMapsUrl, '_blank', 'noopener,noreferrer')
                            }
                        >
                            View in Google Maps
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
