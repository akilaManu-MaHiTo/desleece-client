import type { ComponentType } from 'react'
import Home from './pages/Home'

export type PageProps = {
  cartCount: number
  onAddToCart: () => void
}

export const routes: Record<string, ComponentType<PageProps>> = {
  '/': Home,
  '/home': Home,
}
