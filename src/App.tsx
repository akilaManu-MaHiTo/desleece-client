import { useState } from 'react'
import { routes } from './routes'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import './App.css'

function App() {
  useSmoothScroll()
  const [cartCount, setCartCount] = useState(0)
  const currentPath = window.location.pathname
  const Page = routes[currentPath] ?? routes['/']

  return <Page cartCount={cartCount} onAddToCart={() => setCartCount((count) => count + 1)} />
}

export default App
