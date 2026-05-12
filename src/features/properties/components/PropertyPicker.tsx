import { useState } from 'react'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useProperties } from '../hooks'
import { PropertyBadge } from './PropertyBadge'
import type { PropertyWithStats } from '../types'

interface PropertyPickerProps {
  value?: string
  onChange: (propertyId: string | undefined) => void
  onCreateNew?: () => void
  placeholder?: string
  disabled?: boolean
}

export function PropertyPicker({
  value,
  onChange,
  onCreateNew,
  placeholder = 'Select property...',
  disabled,
}: PropertyPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const { data: properties = [], isLoading } = useProperties({ q: search })

  const selectedProperty = properties.find((p) => p.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedProperty ? (
            <PropertyDisplay property={selectedProperty} />
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[500px] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search properties..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? 'Loading...' : 'No properties found.'}
            </CommandEmpty>
            {properties.length > 0 && (
              <CommandGroup>
                {properties.map((property) => (
                  <CommandItem
                    key={property.id}
                    value={property.id}
                    onSelect={() => {
                      onChange(property.id === value ? undefined : property.id)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === property.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <PropertyDisplay property={property} />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {onCreateNew && (
              <>
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      setOpen(false)
                      onCreateNew()
                    }}
                    className="text-primary"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create new property
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

function PropertyDisplay({ property }: { property: PropertyWithStats }) {
  const { address, type } = property
  const addressStr = `${address.street}, ${address.city}, ${address.state} ${address.zip}`

  return (
    <div className="flex items-center gap-2 overflow-hidden">
      <span className="truncate font-medium">{addressStr}</span>
      <PropertyBadge type={type} />
    </div>
  )
}
