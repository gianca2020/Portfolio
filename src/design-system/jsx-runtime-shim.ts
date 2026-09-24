/**
 * Design System bundle only: the automatic JSX runtime, re-implemented over
 * the global React 18 `createElement`, so the IIFE bundle has no dependency on
 * react/jsx-runtime internals (previews load React from a CDN as `window.React`).
 */
import React from 'react'
import type { ElementType, Key, ReactElement, ReactNode } from 'react'

type Props = Record<string, unknown> & { children?: ReactNode }

export function jsx(type: ElementType, props: Props, key?: Key): ReactElement {
  const { children, ...rest } = props
  const config = key === undefined ? rest : { ...rest, key }
  if (children === undefined) return React.createElement(type, config)
  return Array.isArray(children)
    ? React.createElement(type, config, ...(children as ReactNode[]))
    : React.createElement(type, config, children)
}

export const jsxs = jsx
export const jsxDEV = jsx
export const Fragment = React.Fragment
