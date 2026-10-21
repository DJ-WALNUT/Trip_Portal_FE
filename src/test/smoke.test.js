import { it, expect } from 'vitest'

it('jest-dom matchers loaded', () => {
  const el = document.createElement('div')
  document.body.append(el)
  expect(el).toBeInTheDocument()
})
