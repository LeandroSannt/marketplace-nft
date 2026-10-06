import { createFileRoute, Outlet } from '@tanstack/react-router'
import { AccountNav } from '@/features/account/components/account-nav'
import { requireAuth } from '@/lib/require-auth'

export const Route = createFileRoute('/account')({
  beforeLoad: ({ location }) => {
    requireAuth(location)
  },
  component: AccountLayout,
})

function AccountLayout() {
  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
      <AccountNav />
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  )
}
