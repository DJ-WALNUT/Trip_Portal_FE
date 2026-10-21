export function EmptyState({ icon, title, description, children }) {
  return (
    <div className="ui-empty-state empty-state">
      {icon ? <div className="empty-state__icon" aria-hidden="true">{icon}</div> : null}
      <p className="empty-state__title">{title}</p>
      {description ? <p className="empty-state__desc">{description}</p> : null}
      {children}
    </div>
  )
}
