import { AlertTriangle, Clock, Ban } from 'lucide-react'

interface BanMessageProps {
  description: string
  isPermanent?: boolean
}

export function BanMessage({ description, isPermanent = false }: BanMessageProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {isPermanent ? (
            <Ban className="h-5 w-5 text-red-600" />
          ) : (
            <Clock className="h-5 w-5 text-red-600" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800">
            Account Suspended
          </h3>
          <p className="mt-1 text-sm text-red-700">
            {description}
          </p>
          <p className="mt-2 text-xs text-red-600">
            If you believe this is an error, please contact support.
          </p>
        </div>
      </div>
    </div>
  )
} 