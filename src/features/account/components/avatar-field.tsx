import { ImageUpIcon, UserIcon } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { AVATAR_MAX_BYTES } from '@/contracts/profile'

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp']

interface AvatarFieldProps {
  value: string | null
  onChange: (value: string | null) => void
  error?: string
}

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve(typeof reader.result === 'string' ? reader.result : '')
    }
    reader.onerror = () => {
      reject(new Error('Não foi possível ler a imagem'))
    }
    reader.readAsDataURL(file)
  })
}

export function AvatarField({ value, onChange, error }: AvatarFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const inputId = useId()
  const errorId = `${inputId}-error`
  const hintId = `${inputId}-hint`
  const [localError, setLocalError] = useState<string | null>(null)
  const message = localError ?? error

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setLocalError('Envie uma imagem PNG, JPG ou WebP')
      return
    }
    if (file.size > AVATAR_MAX_BYTES) {
      setLocalError('A imagem deve ter no máximo 512 KB')
      return
    }
    try {
      onChange(await readAsDataUrl(file))
      setLocalError(null)
    } catch {
      setLocalError('Não foi possível ler a imagem')
    }
  }

  return (
    <div className="flex flex-col gap-2.5">
      <label htmlFor={inputId} className="text-body-md">
        Avatar
      </label>
      <div className="flex items-center gap-2.5">
        <span className="grid size-12.5 shrink-0 place-items-center overflow-hidden rounded-full border border-border bg-surface-raised">
          {value ? (
            <img src={value} alt="Pré-visualização do avatar" className="size-full object-cover" />
          ) : (
            <UserIcon className="size-6 text-text-secondary" aria-hidden />
          )}
        </span>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          className="sr-only"
          aria-describedby={message ? `${hintId} ${errorId}` : hintId}
          aria-invalid={Boolean(message)}
          onChange={(event) => {
            void handleFile(event.target.files?.[0])
            event.target.value = ''
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2 rounded-xs px-3"
          onClick={() => inputRef.current?.click()}
        >
          <ImageUpIcon className="size-4" aria-hidden />
          {value ? 'Trocar imagem' : 'Enviar imagem'}
        </Button>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="inline"
            className="px-2"
            onClick={() => {
              onChange(null)
              setLocalError(null)
            }}
          >
            Remover
          </Button>
        )}
      </div>
      <p id={hintId} className="text-caption-sm text-text-secondary">
        PNG, JPG ou WebP, até 512 KB.
      </p>
      {message && (
        <p id={errorId} role="alert" className="text-caption-sm text-error-foreground">
          {message}
        </p>
      )}
    </div>
  )
}
