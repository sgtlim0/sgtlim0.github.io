import dynamic from 'next/dynamic'
import { SkeletonCard } from '@hchat/ui'

const LoginPage = dynamic(
  () => import('@hchat/ui/admin/LoginPage'),
  { loading: () => <SkeletonCard /> }
)

export default function LoginRoute() {
  return <LoginPage />;
}
