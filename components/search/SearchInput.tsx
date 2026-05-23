import { forwardRef } from 'react'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

interface SearchInputProps {
    value: string
    onChange: (val: string) => void
    placeholder?: string
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
    ({ value, onChange, placeholder = 'Search...' }, ref) => {
        return (
            <div className="relative w-full md:w-[500px]">
                <Search
                    className="text-muted-foreground absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2"
                    aria-hidden="true"
                />

                <Input
                    ref={ref}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    aria-label="Search"
                    className="w-full pl-8"
                />
            </div>
        )
    }
)

SearchInput.displayName = 'SearchInput'