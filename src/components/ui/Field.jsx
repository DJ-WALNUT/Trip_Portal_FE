export function Field({ label, htmlFor, hint, children }) {
  return (
    <div className="ui-field field">
      <label className="field__label" htmlFor={htmlFor}>{label}</label>
      {children}
      {hint ? <p className="field__hint">{hint}</p> : null}
    </div>
  )
}
