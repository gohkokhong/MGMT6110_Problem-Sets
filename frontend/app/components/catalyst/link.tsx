import React from 'react'
import { Link as RouterLink } from 'react-router'

export const Link = React.forwardRef(function Link(
  { href, ...props }: { href: string } & Omit<React.ComponentPropsWithoutRef<'a'>, 'href'>,
  ref: React.ForwardedRef<HTMLAnchorElement>
) {
  return <RouterLink to={href} {...(props as any)} ref={ref} />
})
