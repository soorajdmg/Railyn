import { useEffect, useState } from 'react'

export function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 900)
  useEffect(() => {
    const handler = () => setMobile(window.innerWidth < 900)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return mobile
}
