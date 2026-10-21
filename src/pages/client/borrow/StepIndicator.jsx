const STEPS = ['물품', '정보', '완료']

function StepIndicator({ current }) {
  return (
    <ol className="borrow-steps" aria-label="진행 단계">
      {STEPS.map((label, i) => {
        const n = i + 1
        const state = n < current ? 'done' : n === current ? 'current' : 'todo'
        return (
          <li
            key={label}
            className={`borrow-steps__item borrow-steps__item--${state}`}
            aria-current={n === current ? 'step' : undefined}
          >
            <span className="borrow-steps__num">{n}</span>
            <span className="borrow-steps__label">{label}</span>
          </li>
        )
      })}
    </ol>
  )
}

export default StepIndicator
