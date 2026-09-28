import clsx from 'clsx'
import { UserIcon } from '@heroicons/react/24/solid'

type AvatarProps = {
  src?: string | null
  square?: boolean
  initials?: string
  alt?: string
  className?: string
  /** Fires on a broken/expired src (e.g. a lapsed presigned URL) - callers fall back to the placeholder themselves, this component has no img-load state of its own. */
  onError?: () => void
}

export function Avatar({ src, square = false, initials, alt = '', className, onError }: AvatarProps) {
  return (
    <span
      data-slot="avatar"
      className={clsx(
        className,
        'inline-grid shrink-0 overflow-hidden place-items-center align-middle [--avatar-radius:20%]',
        square ? 'rounded-[--avatar-radius]' : 'rounded-full'
      )}
    >
      {!src && initials && (
        <svg
          className="size-full select-none fill-current text-[48px]"
          viewBox="0 0 100 100"
          aria-hidden={alt ? undefined : 'true'}
        >
          {alt && <title>{alt}</title>}
          <rect width="100" height="100" fill="currentColor" opacity="0.15" />
          <text
            x="50%"
            y="50%"
            alignmentBaseline="middle"
            dominantBaseline="middle"
            textAnchor="middle"
            dy=".125em"
          >
            {initials}
          </text>
        </svg>
      )}
      {!src && !initials && (
        <UserIcon
          className="h-[70%] w-[70%] opacity-40"
          aria-hidden={alt ? undefined : 'true'}
          role={alt ? 'img' : undefined}
          aria-label={alt || undefined}
        />
      )}
      {src && (
        <img className="size-full object-cover" src={src} alt={alt} onError={onError} />
      )}
    </span>
  )
}
