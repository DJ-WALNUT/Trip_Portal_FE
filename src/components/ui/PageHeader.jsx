export function PageHeader({ title, description, actions, icon }) {
  return (
    <header className="ui-page-header page-header">
      <div className="page-header__text">
        <h1 className="page-header__title">
          {icon ? <span className="page-header__icon" aria-hidden="true">{icon}</span> : null}
          {title}
        </h1>
        {description ? <p className="page-header__desc">{description}</p> : null}
      </div>
      {actions ? <div className="page-header__actions">{actions}</div> : null}
    </header>
  )
}
