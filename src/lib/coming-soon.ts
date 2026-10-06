import { toast } from 'sonner'

export function announceComingSoon(feature: string) {
  toast.info(`${feature} estará disponível em breve.`, {
    description: 'Esta área não faz parte desta versão do marketplace.',
  })
}
