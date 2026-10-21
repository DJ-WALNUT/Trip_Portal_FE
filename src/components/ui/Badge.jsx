export function Badge({ tone = 'neutral', children }) {
  return <span className={`ui-badge badge badge--${tone}`}>{children}</span>
}
