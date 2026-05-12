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
import { useContacts } from '../hooks'
import { ContactBadge } from './ContactBadge'
import type { Contact } from '../types'

interface ContactPickerProps {
  value?: string
  onChange: (contactId: string | undefined) => void
  onCreateNew?: () => void
  placeholder?: string
  disabled?: boolean
}

export function ContactPicker({
  value,
  onChange,
  onCreateNew,
  placeholder = 'Select contact...',
  disabled,
}: ContactPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const { data: contacts = [], isLoading } = useContacts({ q: search })

  const selectedContact = contacts.find((c) => c.id === value)

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
          {selectedContact ? (
            <ContactDisplay contact={selectedContact} />
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search contacts..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? 'Loading...' : 'No contacts found.'}
            </CommandEmpty>
            {contacts.length > 0 && (
              <CommandGroup>
                {contacts.map((contact) => (
                  <CommandItem
                    key={contact.id}
                    value={contact.id}
                    onSelect={() => {
                      onChange(contact.id === value ? undefined : contact.id)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === contact.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <ContactDisplay contact={contact} />
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
                    Create new contact
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

function ContactDisplay({ contact }: { contact: Contact }) {
  return (
    <div className="flex items-center gap-2 overflow-hidden">
      <span className="truncate font-medium">{contact.name}</span>
      {contact.company && (
        <span className="truncate text-sm text-muted-foreground">
          · {contact.company}
        </span>
      )}
      <ContactBadge type={contact.type} className="shrink-0" />
    </div>
  )
}
