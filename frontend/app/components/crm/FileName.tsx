import { Fragment } from 'react'

/** A file name that wraps at its underscores, not in the middle of a word. */
export function FileName({ name }: { name: string }) {
  return (
    <>
      {name.split('_').map((part, i) => (
        <Fragment key={i}>
          {i > 0 && (
            <>
              _<wbr />
            </>
          )}
          {part}
        </Fragment>
      ))}
    </>
  )
}
