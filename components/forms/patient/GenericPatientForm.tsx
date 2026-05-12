'use client'

import { UseFormHandleSubmit, UseFormReset, UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { PatientFormInputs } from '@/schema/patient'
import { Form } from '@/components/ui/form'
import { ColumnOne, ColumnTwo, ColumnThree, ColumnFour, ColumnFive } from '.'

interface PatientFormProps {
    form: UseFormReturn<PatientFormInputs>
    reset: UseFormReset<PatientFormInputs>
    handleSubmit: UseFormHandleSubmit<PatientFormInputs>
    onSubmit: (data: PatientFormInputs) => Promise<void>
    isEdit?: boolean
}

export default function GenericPatientForm({
    form,
    reset,
    handleSubmit,
    onSubmit,
    isEdit = false,
}: PatientFormProps) {
    const {
        formState: { errors },
    } = form

    console.log(errors)

    // ---------- UI ----------
    return (
        // keep this a form to preserve semantics, but don't submit here
        <Form {...form}>
            <form
                onSubmit={handleSubmit(onSubmit, (errors) => {
                    // console.log('Validation failed:', errors)
                })}
                className="grid min-w-full gap-6 py-4 select-none"
            >
                <div className="flex w-full flex-col gap-6 md:flex-row ">
                    {/* COLUMN ONE*/}
                    <ColumnOne form={form} isEdit={isEdit} />

                    {/* COLUMN TWO */}
                    <ColumnTwo form={form} />

                    {/*COLUMN THREE */}
                    <ColumnThree form={form} />

                    {/*COLUMN FOUR */}
                    <ColumnFour form={form} />

                    {isEdit && <ColumnFive form={form} />}
                </div>
                <div className="mt-6 flex justify-between gap-2">
                    <Button
                        variant="outline"
                        onClick={() => reset()}
                        type="button"
                        className="h-12 w-[20%] border-red-500 text-red-600"
                    >
                        Clear
                    </Button>
                    <Button type="submit" className="h-12 w-[80%]" name="Save">
                        {isEdit ? 'Update' : 'Save'}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
