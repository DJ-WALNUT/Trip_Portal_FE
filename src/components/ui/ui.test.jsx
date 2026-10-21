import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { Badge, Button, Toggle, ResponsiveTable } from '@/components/ui'

describe('ui components', () => {
  it('Badge renders tone class', () => {
    render(<Badge tone="overdue">미반납</Badge>)
    expect(screen.getByText('미반납').className).toContain('badge--overdue')
    expect(screen.getByText('미반납').className).toContain('ui-badge')
    expect(screen.getByText('미반납').classList.contains('badge')).toBe(true)
  })

  it('Button defaults to type=button', () => {
    render(<Button>확인</Button>)
    expect(screen.getByRole('button').getAttribute('type')).toBe('button')
  })

  it('Toggle exposes switch role and forwards change', async () => {
    let seen
    // controlled input: React restores checked after the handler, so read it inside
    const onChange = vi.fn((e) => { seen = e.target.checked })
    render(<Toggle id="t" label="알림" checked={false} onChange={onChange} />)
    await userEvent.click(screen.getByRole('switch'))
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(seen).toBe(true)
  })

  const columns = [
    { key: 'n', header: '이름', primary: true },
    { key: 'v', header: '값' },
  ]
  const rows = [{ id: 1, n: 'a', v: 'x' }, { id: 2, n: 'b', v: 'y' }]

  it('ResponsiveTable renders both views and empty', () => {
    const { container, rerender } = render(
      <ResponsiveTable columns={columns} rows={rows} rowKey={(r) => r.id} empty={<p>비었음</p>} />,
    )
    expect(screen.getAllByRole('row')).toHaveLength(3)
    expect(container.querySelectorAll('.rtable__cards li')).toHaveLength(2)
    rerender(<ResponsiveTable columns={columns} rows={[]} rowKey={(r) => r.id} empty={<p>비었음</p>} />)
    expect(screen.getByText('비었음')).toBeTruthy()
  })

  it('ResponsiveTable uses render()', () => {
    const cols = [{ key: 'n', header: '이름', primary: true, render: (r) => <b>{r.n}!</b> }]
    render(<ResponsiveTable columns={cols} rows={rows} rowKey={(r) => r.id} />)
    expect(screen.getAllByText('a!')).toHaveLength(2)
  })

  it('ui.css has no selector repeating a ui- root as its own descendant', () => {
    // vitest runs with css:false, so ?raw yields '' and import.meta.url is not a file URL; read relative to the project root (cwd)
    const css = readFileSync(resolve('src/components/ui/ui.css'), 'utf-8')
    expect(css.length).toBeGreaterThan(500)
    expect(css).not.toMatch(/\.ui-([a-z-]+)[^{,\n]*\s\.ui-\1(?![\w-])/)
  })
})
