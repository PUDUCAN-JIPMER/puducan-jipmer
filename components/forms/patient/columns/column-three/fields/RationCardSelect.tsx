import { Control } from 'react-hook-form'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form'
import { SelectGroup, SelectLabel } from '@radix-ui/react-select'

type RationCardSelectProps = {
    control: Control<any>
}

export default function RationCardSelect({ control }: RationCardSelectProps) {
    return (
        <FormField
            control={control}
            name="rationCardColor"
            render={({ field }) => (
                <FormItem>
                    <FormControl>
                        <SelectGroup>
                            <SelectLabel className="text-muted-foreground mb-1 text-sm">
                                Ration Card Color
                            </SelectLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger className="w-full text-muted-foreground mb-1 text-sm">
                                    <SelectValue placeholder="Ration Card Color" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="red">Red</SelectItem>
                                    <SelectItem value="yellow">Yellow</SelectItem>
                                    <SelectItem value="none">None</SelectItem>
                                </SelectContent>
                            </Select>
                        </SelectGroup>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}
