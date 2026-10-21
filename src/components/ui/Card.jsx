export function Card({ as = 'div', className = '', children, ...rest }) {
  const Tag = as
  return <Tag className={['card', className].filter(Boolean).join(' ')} {...rest}>{children}</Tag>
}
