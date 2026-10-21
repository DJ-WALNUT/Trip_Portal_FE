export function Toggle({ checked, onChange, label, id, name }) {
  return (
    <label className="ui-toggle toggle" htmlFor={id}>
      <input className="toggle__input" type="checkbox" role="switch" id={id} name={name} checked={checked} onChange={onChange} />
      <span className="toggle__track" aria-hidden="true" />
      <span className="toggle__label">{label}</span>
    </label>
  )
}
