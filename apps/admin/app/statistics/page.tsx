import { AdminStatistics, ProtectedRoute } from '@hchat/ui/admin'

export default function StatisticsPage() {
  return (
    <ProtectedRoute>
      <AdminStatistics />
    </ProtectedRoute>
  )
}
