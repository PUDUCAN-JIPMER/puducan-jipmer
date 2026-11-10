import HospitalSearch from '@/components/search/HospitalSearch'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useFormContext, UseFormReturn, useForm, FormProvider, SubmitHandler } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

/**
 * GenericUserForm
 * A reusable form wrapper that integrates react-hook-form with Zod validation.
 *
 * @template T - Shape of the form data.
 * @param {{
 *   schema: z.ZodSchema<T>;
 *   defaultValues?: Partial<T>;
 *   onSubmit: (data: T) => void;
 *   children: React.ReactNode;
 * }} props
 * @returns JSX.Element
 */
export function GenericUserForm<T extends Record<string, any>>({
  schema,
  defaultValues,
  onSubmit,
  children,
}: {
  schema: z.ZodSchema<T>
  defaultValues?: Partial<T>
  onSubmit: (data: T) => void
  children: React.ReactNode
}) {
  const methods = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const handleSubmit: SubmitHandler<T> = (data) => {
    onSubmit(data)
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleSubmit)} noValidate>
        {children}
        <button type="submit" className="sr-only" />
      </form>
    </FormProvider>
  )
}
import DiagnosisTimingField from './fields/DiagnosisTimingField'
import DiseaseMultiSelect from './fields/DiseaseMultiSelect'
import RationCardSelect from './fields/RationCardSelect'
import clsx from 'clsx'

type RightColumnProps = {
    form: UseFormReturn<any>
    isAsha?: boolean
}

export function ColumnThree({ form, isAsha }: RightColumnProps) {
    const { watch, control } = useFormContext()

    return (
        <div className={clsx('flex w-full flex-col gap-4 md:w-1/2 lg:w-1/3', isAsha && 'md:w-2/3 lg:w-full px-2 mx-auto')}>
            {/* Wrapped inside FormField for showing required alert messages. */}
            <FormField
                control={form.control}
                name="diseases"
                render={() => (
                    <FormItem>
                        <FormControl>
                            <DiseaseMultiSelect sex={watch('sex')} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <RationCardSelect control={control} />

            <FormField
                control={form.control}
                name="assignedHospital"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-muted-foreground text-sm">
                            Assigned Hospital
                        </FormLabel>
                        <FormControl>
                            <HospitalSearch value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <DiagnosisTimingField form={form} />
        </div>
    )
}
