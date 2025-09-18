"use client"
import { useEffect, useRef } from 'react'

type Props = React.HTMLAttributes<HTMLElement> & {
  name: string
  as?: keyof JSX.IntrinsicElements
}

export default function ViewTransition({ name, as = 'div', children, ...rest }: Props) {
  const ref = useRef<HTMLElement | null>(null)
  useEffect(() => {
    if (ref.current) (ref.current as any).style.viewTransitionName = name
  }, [name])
  const Comp: any = as
  return (
    <Comp ref={ref} {...rest}>
      {children}
    </Comp>
  )
}
