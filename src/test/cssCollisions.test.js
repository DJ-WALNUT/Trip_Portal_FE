import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// All pages are statically imported, so every stylesheet lands in one CSS bundle.
// A bare top-level class defined in two files silently overrides the other page.
// (Under jsdom `new URL('.', import.meta.url)` is not a file URL; the string form is.)
const SRC = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const EXCLUDED = [
  /^vendor\//,
  /^components\/ui\/ui\.css$/,
  /^index\.css$/,
  /^styles\/tokens\.css$/,
  /Teaser/,
]

const rel = (p) => relative(SRC, p).replace(/\\/g, '/')

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) return walk(p)
    return p.endsWith('.css') && !EXCLUDED.some((re) => re.test(rel(p))) ? [p] : []
  })

// Returns class names that appear as the leading, unscoped compound of a selector
// (e.g. `.foo`, `.foo:hover`, `.foo > a`, `.foo[data-x]`), not `.bar .foo` or `.foo.bar`.
export function bareClasses(css) {
  const out = new Set()
  const text = css.replace(/\/\*[\s\S]*?\*\//g, '')
  let buf = ''
  for (const ch of text) {
    if (ch === '{') {
      const prelude = buf.trim()
      buf = ''
      if (prelude.startsWith('@')) continue
      for (const sel of prelude.split(',')) {
        const m = sel.trim().match(/^\.([\w-]+)(?=$|[\s>+~:[])/)
        if (m) out.add(m[1])
      }
    } else if (ch === '}' || ch === ';') {
      buf = ''
    } else {
      buf += ch
    }
  }
  return out
}

describe('cross-file CSS class collisions', () => {
  it('parser picks only leading unscoped classes', () => {
    const got = bareClasses('.a{x:1} .b:hover,.c > i{y:2} .d .e{} .f.g{} @media (min-width:1px){.h{z:3}}')
    expect([...got].sort()).toEqual(['a', 'b', 'c', 'd', 'h'])
  })

  it('no bare top-level class is defined in more than one stylesheet', () => {
    const files = walk(SRC)
    expect(files.length).toBeGreaterThan(10)
    const owners = new Map()
    for (const f of files) {
      for (const cls of bareClasses(readFileSync(f, 'utf-8'))) {
        if (!owners.has(cls)) owners.set(cls, [])
        owners.get(cls).push(rel(f))
      }
    }
    const collisions = [...owners]
      .filter(([, list]) => list.length > 1)
      .map(([cls, list]) => `.${cls}: ${list.join(' | ')}`)
    expect(collisions).toEqual([])
  })
})
