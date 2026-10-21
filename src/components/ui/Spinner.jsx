export function Spinner({ label = '불러오는 중…' }) {
  return (
    <div className="ui-spinner spinner" role="status">
      <span className="spinner__ring" aria-hidden="true" />
      <span className="spinner__label">{label}</span>
    </div>
  )
}
