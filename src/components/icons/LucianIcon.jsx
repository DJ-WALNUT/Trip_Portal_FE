import '@/vendor/lucian-icons/box.js'
import '@/vendor/lucian-icons/search.js'
import '@/vendor/lucian-icons/map.js'
import '@/vendor/lucian-icons/check.js'
import '@/vendor/lucian-icons/download.js'
import '@/vendor/lucian-icons/bell.js'
import '@/vendor/lucian-icons/wrench.js'
import '@/vendor/lucian-icons/lock.js'
import '@/vendor/lucian-icons/chart.js'
import '@/vendor/lucian-icons/megaphone.js'
import '@/vendor/lucian-icons/camera.js'
import '@/vendor/lucian-icons/sparkle.js'
import '@/vendor/lucian-icons/archive.js'
import '@/vendor/lucian-icons/history.js'
import '@/vendor/lucian-icons/home.js'
import '@/vendor/lucian-icons/calendar.js'
import '@/vendor/lucian-icons/graduation.js'
import '@/vendor/lucian-icons/settings.js'
import { useEffect, useRef } from 'react'

export default function LucianIcon({
  name,
  state,
  size = 24,
  tone,
  accent,
  label,
  animate,
  className,
}) {
  const ref = useRef(null)

  // `state` is a getter-only property on upgraded elements, so React must not
  // forward it as a prop; apply it through the attribute / setState instead.
  useEffect(() => {
    const el = ref.current
    if (!el || state === undefined) return
    if (typeof el.setState === 'function') {
      try {
        el.setState(state)
      } catch (err) {
        if (!(err instanceof RangeError)) throw err
      }
    }
    el.setAttribute('state', state)
  }, [state])

  const Tag = `lucian-${name}`
  return (
    <Tag
      ref={ref}
      size={size}
      tone={tone}
      accent={accent}
      animate={animate}
      class={className}
      label={label || undefined}
      aria-hidden={label ? undefined : 'true'}
    />
  )
}
