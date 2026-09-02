'use client'
import { useState } from 'react'

interface Props extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'onError'> {
  src?: string
  /** Shown if `src` fails to load — a missing local file, or a dead remote URL. */
  fallbackSrc: string
  alt: string
}

/**
 * An <img> that swaps to a fallback when its source fails.
 *
 * Used for the mission cover, which points at a local file that may not be
 * present in every checkout; without this the banner would render a broken
 * image rather than the previous artwork.
 */
export function ImageWithFallback({ src, fallbackSrc, alt, ...rest }: Props) {
  const [failed, setFailed] = useState(false)
  const resolved = !src || failed ? fallbackSrc : src

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...rest}
      src={resolved}
      alt={alt}
      onError={() => setFailed(true)}
    />
  )
}
