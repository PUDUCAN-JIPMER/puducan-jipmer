'use client'
import { useState } from 'react'
import { Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { UseFormHandleSubmit, UseFormReset, UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { PatientFormInputs } from '@/schema/patient'
import { Form } from '@/components/ui/form'
import { ColumnOne, ColumnTwo, ColumnThree, ColumnFour, ColumnFive } from '.'
import { toast } from 'sonner'

interface PatientFormProps {
    form: UseFormReturn<PatientFormInputs, any>
    reset: UseFormReset<PatientFormInputs>
    handleSubmit: UseFormHandleSubmit<PatientFormInputs, any>
    onSubmit: (data: PatientFormInputs) => Promise<void>
    onClear?: () => void
    isEdit?: boolean
    isSaving?: boolean
}

const STEPS = [
    { id: 1, name: 'Personal Info' },
    { id: 2, name: 'Medical Details' },
    { id: 3, name: 'Diagnosis' },
    { id: 4, name: 'Treatment' },
]

const EDIT_STEPS = [...STEPS, { id: 5, name: 'Follow-ups' }]

export default function GenericPatientForm({
    form,
    reset,
    handleSubmit,
    onSubmit,
    onClear,
    isEdit = false,
    isSaving = false,
}: PatientFormProps) {
    const steps = isEdit ? EDIT_STEPS : STEPS

    const [currentStep, setCurrentStep] = useState(1)

    const totalSteps = steps.length
    const {
        formState: { errors },
    } = form
    const goToStep = (step: number) => {
        setCurrentStep(step)
    }
    const handleNext = () => {
        if (currentStep < totalSteps) {
            setCurrentStep((prev) => prev + 1)
        }
    }

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep((prev) => prev - 1)
        }
    }
    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return <ColumnOne form={form} />

            case 2:
                return <ColumnTwo form={form} />

            case 3:
                return <ColumnThree form={form} />

            case 4:
                return <ColumnFour form={form} />

            case 5:
                return <ColumnFive form={form} />

            default:
                return null
        }
    }

    const collectErrorMessages = (value: unknown, out: string[]) => {
        if (!value || typeof value !== 'object') return

        // react-hook-form stores message on leaf FieldError
        const maybe = value as { message?: unknown; types?: unknown }
        if (typeof maybe.message === 'string' && maybe.message.trim()) {
            out.push(maybe.message.trim())
        }

        for (const v of Object.values(value as Record<string, unknown>)) {
            if (v && typeof v === 'object') collectErrorMessages(v, out)
        }
    }

    return (
        <Form {...form}>
            <form
                onSubmit={(e) => {
                    e.preventDefault()

                    if (currentStep === totalSteps) {
                        handleSubmit(
                            onSubmit,
                            (invalid) => {
                                const fields = Object.keys(invalid ?? {})
                                const messages: string[] = []
                                collectErrorMessages(invalid, messages)
                                const uniqueMessages = Array.from(new Set(messages)).slice(0, 5)

                                const description =
                                    uniqueMessages.length > 0
                                        ? uniqueMessages.join('\n')
                                        : 'Please check the highlighted fields and try again.'

                                toast.error(`Missing/invalid details (${fields.length || 0})`, {
                                    description,
                                    duration: 7000,
                                })
                            }
                        )(e)
                    }
                }}
                className="py-4 select-none"
            >
                <div className="flex flex-col gap-6 md:flex-row">
                    {/* Sidebar */}
                    <div className="md:w-64 lg:w-72 shrink-0">
                        <div className="sticky top-4 rounded-xl border bg-card p-4">
                            <h3 className="text-sm font-semibold text-foreground mb-4 pb-2 border-b">
                                Progress
                            </h3>
                            <div className="space-y-2">
                                {steps.map((step) => (
                                    <button
                                        key={step.id}
                                        type="button"
                                        onClick={() => goToStep(step.id)}
                                        className={cn(
                                            'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-all duration-200',
                                            currentStep === step.id
                                                ? 'bg-primary/10 text-primary border-primary border-l-4'
                                                : 'hover:bg-muted text-muted-foreground'
                                        )}
                                    >
                                        <div className="flex-1">
                                            <p
                                                className={cn(
                                                    'text-sm font-medium',
                                                    currentStep === step.id
                                                        ? 'text-primary'
                                                        : 'text-foreground'
                                                )}
                                            >
                                                {step.name}
                                            </p>
                                        </div>
                                        {currentStep > step.id && (
                                            <Check className="h-4 w-4 text-green-500" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        <div className="bg-card rounded-xl border p-6">
                            {/* Mobile Progress */}
                            <div className="mb-6 md:hidden">
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="text-muted-foreground text-sm">
                                        Step {currentStep} of {totalSteps}
                                    </span>
                                    <span className="text-primary text-sm font-medium">
                                        {steps[currentStep - 1]?.name}
                                    </span>
                                </div>
                                <div className="bg-muted h-2 w-full rounded-full">
                                    <div
                                        className="bg-primary h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                                    />
                                </div>
                            </div>

                            <h3 className="text-foreground mb-4 text-lg font-semibold md:hidden">
                                {steps[currentStep - 1]?.name}
                            </h3>

                            <div className="space-y-6">{renderStepContent()}</div>

                            {/* Navigation Buttons */}
                            <div className="mt-8 flex justify-between border-t pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleBack}
                                    disabled={currentStep === 1}
                                    className="h-10 px-4"
                                >
                                    <ChevronLeft className="mr-1 h-4 w-4" />
                                    Back
                                </Button>

                                {currentStep < totalSteps ? (
                                    <Button
                                        type="button"
                                        onClick={handleNext}
                                        className="h-10 px-6"
                                    >
                                        Next
                                        <ChevronRight className="ml-1 h-4 w-4" />
                                    </Button>
                                ) : (
                                    <Button
                                        type="submit"
                                        disabled={isSaving}
                                        className="h-10 bg-green-600 px-6 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
                                    >
                                        {isSaving ? (isEdit ? 'Updating...' : 'Saving...') : isEdit ? 'Update Patient' : 'Save Patient'}
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    if (onClear) {
                                        onClear()
                                    } else {
                                        reset()
                                    }
                                }}
                                type="button"
                                className="border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
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
