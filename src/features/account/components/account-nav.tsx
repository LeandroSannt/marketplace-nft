import { Link, useNavigate } from '@tanstack/react-router'
import { useLogout } from '@/features/auth/queries'
import { announceComingSoon } from '@/lib/coming-soon'

const itemClass =
  'shrink-0 cursor-pointer whitespace-nowrap text-body-md leading-11.25 text-text-secondary hover:text-text-accent'

export function AccountNav() {
  const logout = useLogout()
  const navigate = useNavigate()

  return (
    <nav aria-label="Conta" className="lg:w-55 lg:shrink-0">
      <ul className="flex [scrollbar-width:none] gap-6 overflow-x-auto border-b border-border lg:flex-col lg:gap-0 lg:border-none">
        <li>
          <Link
            to="/account/profile"
            className={itemClass}
            activeProps={{ className: 'font-bold !text-text-accent', 'aria-current': 'page' }}
          >
            Detalhes do perfil
          </Link>
        </li>
        <li>
          <Link
            to="/account/wallets"
            className={itemClass}
            activeProps={{ className: 'font-bold !text-text-accent', 'aria-current': 'page' }}
          >
            Carteiras
          </Link>
        </li>
        <li>
          <button
            type="button"
            className={itemClass}
            onClick={() => {
              announceComingSoon('O histórico de atividade')
            }}
          >
            Atividade
          </button>
        </li>
        <li>
          <button
            type="button"
            className={itemClass}
            onClick={() => {
              announceComingSoon('A lista de interesse')
            }}
          >
            Lista de interesse
          </button>
        </li>
        <li>
          <button
            type="button"
            disabled={logout.isPending}
            className={`${itemClass} font-bold text-text-accent`}
            onClick={() => {
              logout.mutate(undefined, {
                onSettled: () => {
                  void navigate({ to: '/' })
                },
              })
            }}
          >
            Sair
          </button>
        </li>
      </ul>
    </nav>
  )
}
