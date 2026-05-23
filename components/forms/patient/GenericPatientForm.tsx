'use client'

import { UseFormHandleSubmit, UseFormReset, UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { PatientFormInputs } from '@/schema/patient'
import { Form } from '@/components/ui/form'
import { ColumnOne, ColumnTwo, ColumnThree, ColumnFour, ColumnFive } from '.'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'

interface PatientFormProps {
    form: UseFormReturn<PatientFormInputs, any>
    reset: UseFormReset<PatientFormInputs>
    handleSubmit: UseFormHandleSubmit<PatientFormInputs, any>
    onSubmit: (data: PatientFormInputs) => Promise<void>
    isEdit?: boolean
}

const STEPS = [
    { id: 1, name: 'Personal Info' },
    { id: 2, name: 'Medical Details' },
    { id: 3, name: 'Diagnosis' },
    { id: 4, name: 'Treatment' },
]

const EDIT_STEPS = [
    ...STEPS,
    { id: 5, name: 'Follow-ups' },
]

// Required fields for validation per step
const REQUIRED_FIELDS: Record<number, string[]> = {
    1: ['name', 'phoneNumber'],
    2: ['dob', 'sex', 'patientStatus'],
    3: ['assignedHospital'],
    4: [],
    5: [],
}

export default function GenericPatientForm({
    form,
    reset,
    handleSubmit,
    onSubmit,
    isEdit = false,
}: PatientFormProps) {
    const [currentStep, setCurrentStep] = useState(1)
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
    const steps = isEdit ? EDIT_STEPS : STEPS
    const totalSteps = steps.length

    const { getValues } = form

    const isStepValid = (stepId: number): boolean => {
        const required = REQUIRED_FIELDS[stepId] || []
        if (required.length === 0) return true

        const values = getValues()
        return required.every(field => {
            const value = values[field as keyof PatientFormInputs]
            if (Array.isArray(value)) {
                return value.length > 0 && value.some(v => v && v.trim() !== '')
            }
            if (value && typeof value === 'object') {
                return Object.keys(value).length > 0
            }
            return value !== undefined && value !== null && value.toString().trim() !== ''
        })
    }

    const handleNext = () => {
        if (currentStep < totalSteps && isStepValid(currentStep)) {
            setCompletedSteps(prev => new Set([...prev, currentStep]))
            setCurrentStep(currentStep + 1)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    const goToStep = (step: number) => {
        if (step < currentStep) {
            setCurrentStep(step)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        } else if (step > currentStep) {
            let allValid = true
            for (let s = currentStep; s < step; s++) {
                if (!isStepValid(s)) {
                    allValid = false
                    break
                }
            }
            if (allValid) {
                const newCompleted = new Set(completedSteps)
                for (let s = 1; s < step; s++) {
                    if (isStepValid(s)) newCompleted.add(s)
                }
                setCompletedSteps(newCompleted)
                setCurrentStep(step)
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }
        }
    }

    const renderStepContent = () => {
        switch (currentStep) {
            case 1: return <ColumnOne form={form} />
            case 2: return <ColumnTwo form={form} />
            case 3: return <ColumnThree form={form} />
            case 4: return <ColumnFour form={form} />
            case 5: return <ColumnFive form={form} />
            default: return null
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="py-4 select-none">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Sidebar */}
                    <div className="md:w-64 lg:w-72 shrink-0">
                        <div className="sticky top-4 rounded-xl border bg-card p-4">
                            <h3 className="text-sm font-semibold text-foreground mb-4 pb-2 border-b">
                                Progress
                            </h3>
                            <div className="space-y-2">
                                {steps.map((step) => {
                                    const isValid = isStepValid(step.id)
                                    const isCompleted = completedSteps.has(step.id) || (step.id < currentStep && isValid)
                                    const canNavigate = step.id < currentStep || isValid

                                    return (
                                        <button
                                            key={step.id}
                                            type="button"
                                            onClick={() => canNavigate && goToStep(step.id)}
                                            disabled={!canNavigate}
                                            className={cn(
                                                "w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 text-left",
                                                currentStep === step.id
                                                    ? "bg-primary/10 text-primary border-l-4 border-primary"
                                                    : "hover:bg-muted text-muted-foreground",
                                                !canNavigate && "opacity-50 cursor-not-allowed"
                                            )}
                                        >
                                            <div className="flex-1">
                                                <p className={cn(
                                                    "text-sm font-medium",
                                                    currentStep === step.id ? "text-primary" : "text-foreground"
                                                )}>
                                                    {step.name}
                                                </p>
                                            </div>
                                            {isCompleted && <Check className="h-4 w-4 text-green-500" />}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                        <div className="rounded-xl border bg-card p-6">
                            {/* Mobile Progress */}
                            <div className="md:hidden mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-muted-foreground">
                                        Step {currentStep} of {totalSteps}
                                    </span>
                                    <span className="text-sm font-medium text-primary">
                                        {steps[currentStep - 1]?.name}
                                    </span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                    <div
                                        className="bg-primary h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                                    />
                                </div>
                            </div>

                            <h3 className="text-lg font-semibold text-foreground mb-4 md:hidden">
                                {steps[currentStep - 1]?.name}
                            </h3>

                            <div className="w-full">
                                {renderStepContent()}
                            </div>

                            {/* Navigation Buttons */}
                            <div className="flex justify-between mt-8 pt-4 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleBack}
                                    disabled={currentStep === 1}
                                    className="h-10 px-4"
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Back
                                </Button>

                                {currentStep < totalSteps ? (
                                    <Button
                                        type="button"
                                        onClick={handleNext}
                                        className="h-10 px-6"
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                ) : (
                                    <Button
                                        type="submit"
                                        className="h-10 px-6 bg-green-600 hover:bg-green-700"
                                    >
                                        {isEdit ? 'Update Patient' : 'Save Patient'}
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <Button
                                variant="outline"
                                onClick={() => reset()}
                                type="button"
                                className="border-red-500 text-red-600 hover:bg-red-50"
                            >
                                Clear All
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </Form>
    )
}