import { Link, useNavigate } from '@tanstack/react-router'
import { ChevronDownIcon, LogInIcon, LogOutIcon, UserIcon, WalletIcon } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useCurrentUser } from '@/features/auth/hooks'
import { useLogout } from '@/features/auth/queries'
import { cn } from '@/lib/utils'

export function AccountMenu() {
  const { isAuthenticated, user } = useCurrentUser()
  const logout = useLogout()
  const navigate = useNavigate()

  if (!isAuthenticated) {
    return (
      <Link
        to="/login"
        className={cn(
          buttonVariants({ size: 'default' }),
          'h-8.75 w-25 gap-1 px-0 text-body-lg font-medium',
        )}
      >
        <LogInIcon className="size-5" aria-hidden />
        Entrar
      </Link>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex h-8.75 max-w-45 cursor-pointer items-center gap-2 rounded-md border border-border px-3 text-body-md text-foreground hover:border-primary"
        aria-label={`Menu da conta de ${user?.displayName ?? 'colecionador'}`}
      >
        {user?.avatarUrl ? (
          <img src={user.avatarUrl} alt="" className="size-5 shrink-0 rounded-full object-cover" />
        ) : (
          <UserIcon className="size-4 shrink-0 text-text-accent" aria-hidden />
        )}
        <span className="truncate">{user?.displayName ?? 'Minha conta'}</span>
        <ChevronDownIcon className="size-4 shrink-0" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuItem asChild>
          <Link to="/account/profile">
            <UserIcon aria-hidden /> Perfil do colecionador
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/account/wallets">
            <WalletIcon aria-hidden /> Carteiras
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            logout.mutate(undefined, {
              onSettled: () => {
                void navigate({ to: '/' })
              },
            })
          }}
        >
          <LogOutIcon aria-hidden /> Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
