export function ResponsiveTable({ columns, rows, rowKey, empty = null, breakpoint = 'md' }) {
  if (!rows || rows.length === 0) return <div className="rtable__empty">{empty}</div>
  const cell = (col, row) => (col.render ? col.render(row) : row[col.key])
  const primary = columns.find((c) => c.primary) || columns[0]
  const others = columns.filter((c) => c !== primary)
  return (
    <div className={`ui-rtable rtable rtable--${breakpoint}`}>
      <table className="rtable__table">
        <thead>
          <tr>{columns.map((c) => <th key={c.key} scope="col">{c.header}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={rowKey(row, i)}>
              {columns.map((c) => <td key={c.key}>{cell(c, row)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      <ul className="rtable__cards">
        {rows.map((row, i) => (
          <li key={rowKey(row, i)}>
            <div className="rtable__card-title">{cell(primary, row)}</div>
            <dl className="rtable__card-body">
              {others.map((c) => (
                <div key={c.key} className="rtable__card-row">
                  <dt>{c.header}</dt>
                  <dd>{cell(c, row)}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </div>
  )
}
