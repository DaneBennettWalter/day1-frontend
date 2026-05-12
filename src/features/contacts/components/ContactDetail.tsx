import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Edit, Mail, MapPin, Phone, Building } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useContact, useUpdateContact } from '../hooks'
import { ContactBadge } from './ContactBadge'
import { ContactForm } from './ContactForm'
import type { ContactFormData } from '../schemas'

export function ContactDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)

  const { data: contact, isLoading } = useContact(id!)
  const updateMutation = useUpdateContact()

  const handleUpdate = (data: ContactFormData) => {
    if (!id) return
    updateMutation.mutate(
      { id, data },
      {
        onSuccess: () => setIsEditing(false),
      }
    )
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Loading contact...</p>
      </div>
    )
  }

  if (!contact) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-muted-foreground">
            Contact not found
          </p>
          <Button
            variant="outline"
            onClick={() => navigate('/contacts')}
            className="mt-4"
          >
            Back to Contacts
          </Button>
        </div>
      </div>
    )
  }

  if (isEditing) {
    return (
      <div className="max-w-2xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(false)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <h1 className="text-2xl font-bold">Edit Contact</h1>
        </div>
        <div className="border rounded-lg p-6">
          <ContactForm
            contact={contact}
            onSubmit={handleUpdate}
            onCancel={() => setIsEditing(false)}
            isSubmitting={updateMutation.isPending}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/contacts')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{contact.name}</h1>
            <ContactBadge type={contact.type} className="mt-2" />
          </div>
        </div>
        <Button onClick={() => setIsEditing(true)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </div>

      {/* Details */}
      <div className="space-y-6 border rounded-lg p-6">
        {/* Company */}
        {contact.company && (
          <div className="flex items-start gap-3">
            <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Company</p>
              <p className="font-medium">{contact.company}</p>
            </div>
          </div>
        )}

        {/* Email */}
        {contact.email && (
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <a
                href={`mailto:${contact.email}`}
                className="font-medium text-primary hover:underline"
              >
                {contact.email}
              </a>
            </div>
          </div>
        )}

        {/* Phone */}
        {contact.phone && (
          <div className="flex items-start gap-3">
            <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <a
                href={`tel:${contact.phone}`}
                className="font-medium text-primary hover:underline"
              >
                {contact.phone}
              </a>
            </div>
          </div>
        )}

        {/* Address */}
        {contact.address &&
          (contact.address.street ||
            contact.address.city ||
            contact.address.state ||
            contact.address.zip) && (
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <div className="font-medium">
                  {contact.address.street && <p>{contact.address.street}</p>}
                  <p>
                    {[contact.address.city, contact.address.state]
                      .filter(Boolean)
                      .join(', ')}
                    {contact.address.zip && ` ${contact.address.zip}`}
                  </p>
                </div>
              </div>
            </div>
          )}

        {/* Notes */}
        {contact.notes && (
          <div>
            <p className="text-sm text-muted-foreground mb-2">Notes</p>
            <p className="whitespace-pre-wrap text-sm">{contact.notes}</p>
          </div>
        )}

        {/* Metadata */}
        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Created: {new Date(contact.createdAt).toLocaleDateString()}
          </p>
          <p className="text-xs text-muted-foreground">
            Updated: {new Date(contact.updatedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  )
}
