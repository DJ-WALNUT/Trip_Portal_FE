export function Button({ variant = 'primary', size = 'md', as: Tag = 'button', block = false, className = '', ...rest }) {
  const cls = ['ui-btn', 'btn', `btn--${variant}`, `btn--${size}`, block ? 'btn--block' : '', className].filter(Boolean).join(' ')
  const props = Tag === 'button' ? { type: 'button', ...rest } : rest
  return <Tag className={cls} {...props} />
}
