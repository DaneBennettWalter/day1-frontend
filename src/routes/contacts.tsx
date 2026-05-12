import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ContactsList } from '@/features/contacts/components/ContactsList'
import { ContactForm } from '@/features/contacts/components/ContactForm'
import { useCreateContact } from '@/features/contacts/hooks'
import type { ContactFormData } from '@/features/contacts/schemas'

export function ContactsPage() {
  const navigate = useNavigate()
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const createMutation = useCreateContact()

  const handleCreate = (data: ContactFormData) => {
    createMutation.mutate(data, {
      onSuccess: (contact) => {
        setShowCreateDialog(false)
        navigate(`/contacts/${contact.id}`)
      },
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contacts</h1>
          <p className="text-muted-foreground mt-1">
            Manage customers, vendors, contractors, and more
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Contact
        </Button>
      </div>

      {/* List */}
      <ContactsList />

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Contact</DialogTitle>
          </DialogHeader>
          <ContactForm
            onSubmit={handleCreate}
            onCancel={() => setShowCreateDialog(false)}
            isSubmitting={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
