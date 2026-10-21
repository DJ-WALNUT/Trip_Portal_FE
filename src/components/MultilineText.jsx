import { Fragment } from 'react'

// \n을 <br />로 바꿔 텍스트로만 출력한다(HTML 해석 없음).
export default function MultilineText({ text }) {
  const lines = String(text ?? '').split('\n')
  return (
    <>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {line}
        </Fragment>
      ))}
    </>
  )
}
