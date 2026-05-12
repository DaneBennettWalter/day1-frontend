import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RentRoll } from '@/features/properties/components/RentRoll'

export function RentRollPage() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/properties')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Properties
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Rent Roll</h1>
          <p className="text-muted-foreground mt-1">
            View all units across your portfolio
          </p>
        </div>
      </div>

      {/* Rent Roll */}
      <RentRoll />
    </div>
  )
}
