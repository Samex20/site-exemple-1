import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
// Lenis disabled - conflicts with scroll-snap
// import Lenis from 'lenis'

export function useLenis() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    // Lenis smooth scroll disabled for scroll-snap compatibility
    // Native scroll-snap works better without it
  }, [])
}
