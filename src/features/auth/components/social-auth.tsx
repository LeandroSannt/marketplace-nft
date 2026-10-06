import { FaFacebookF } from 'react-icons/fa6'
import { FcGoogle } from 'react-icons/fc'
import { Button } from '@/components/ui/button'
import { announceComingSoon } from '@/lib/coming-soon'

export function SocialAuth() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 text-caption text-foreground">
        <span aria-hidden className="h-px flex-1 bg-border" />
        Ou continue com
        <span aria-hidden className="h-px flex-1 bg-border" />
      </div>
      <Button
        type="button"
        variant="outline"
        size="social"
        onClick={() => {
          announceComingSoon('O login com Google')
        }}
      >
        <FcGoogle className="size-5" aria-hidden />
        Continuar com Google
      </Button>
      <Button
        type="button"
        variant="outline"
        size="social"
        onClick={() => {
          announceComingSoon('O login com Facebook')
        }}
      >
        <FaFacebookF className="size-4 text-brand-facebook" aria-hidden />
        Continuar com Facebook
      </Button>
    </div>
  )
}
