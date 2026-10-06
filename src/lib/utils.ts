import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            'display-lg',
            'display',
            'heading-lg',
            'heading',
            'title-lg',
            'title',
            'body-xl',
            'body-lg',
            'body-md',
            'body',
            'caption',
            'caption-sm',
            'tiny',
            'micro',
          ],
        },
      ],
      shadow: [{ shadow: ['card', 'glow', 'glow-lg', 'drop', 'sheet', 'control'] }],
      rounded: [{ rounded: ['pill'] }],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
