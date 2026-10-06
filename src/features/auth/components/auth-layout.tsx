import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { DESKTOP_QUERY, useMediaQuery } from '@/lib/use-media-query'

interface AuthLayoutProps {
  title: string
  description: string
  onClose: () => void
  backdrop: React.ReactNode
  children: React.ReactNode
}

export function AuthLayout({ title, description, onClose, backdrop, children }: AuthLayoutProps) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY)

  if (!isDesktop) {
    return (
      <section
        aria-labelledby="auth-title"
        className="mx-auto flex w-full max-w-89.5 flex-col gap-10 pt-6"
      >
        <p
          aria-hidden
          className="flex h-34 items-center justify-center text-display font-bold uppercase"
        >
          Kurio
        </p>
        <div className="flex flex-col gap-2">
          <h1 id="auth-title" className="text-title font-bold">
            {title}
          </h1>
          <p className="text-caption text-text-secondary">{description}</p>
        </div>
        {children}
      </section>
    )
  }

  return (
    <>
      {backdrop}
      <Dialog
        open
        onOpenChange={(open) => {
          if (!open) onClose()
        }}
      >
        <DialogContent className="max-h-[calc(100dvh-2rem)] w-125 max-w-125 overflow-y-auto rounded-lg border-none bg-surface-card px-20 pt-12 pb-10 shadow-glow-lg sm:max-w-125">
          <div className="flex flex-col items-center gap-2 pb-6 text-center">
            <DialogTitle className="text-title font-medium">{title}</DialogTitle>
            <DialogDescription className="text-caption text-text-secondary">
              {description}
            </DialogDescription>
          </div>
          {children}
        </DialogContent>
      </Dialog>
    </>
  )
}
