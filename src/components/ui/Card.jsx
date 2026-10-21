export function Card({ as = 'div', className = '', children, ...rest }) {
  const Tag = as
  return <Tag className={['ui-card', 'card', className].filter(Boolean).join(' ')} {...rest}>{children}</Tag>
}
