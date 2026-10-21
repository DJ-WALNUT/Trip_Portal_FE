import React, { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { Card, Button, ResponsiveTable } from '@/components/ui'
import './AdminSiteInfo.css'

const authMessage = (err) =>
  [401, 403].includes(err?.response?.status) ? err.response.data?.message : undefined

const NEW_ID = 'new'
const EMPTY = { id: NEW_ID, name: '', start: '', end: '' }

function ScheduleManager() {
  const [rows, setRows] = useState([])
  const [editing, setEditing] = useState(null)
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await axios.get('/api/schedule')
      setRows(Array.isArray(res.data) ? res.data : [])
    } catch {
      setRows([])
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const startAdd = () => {
    setErrors({})
    setEditing({ ...EMPTY })
  }
  const startEdit = (row) => {
    setErrors({})
    setEditing({ id: row.id, name: row.name, start: row.start, end: row.end })
  }
  const cancel = () => {
    setErrors({})
    setEditing(null)
  }

  const save = async () => {
    if (busy || !editing) return
    const body = { name: editing.name, start: editing.start, end: editing.end }
    setBusy(true)
    try {
      if (editing.id === NEW_ID) await axios.post('/api/admin/schedule', body)
      else await axios.put(`/api/admin/schedule/${editing.id}`, body)
      alert('저장되었습니다.')
      setEditing(null)
      setErrors({})
      await load()
    } catch (err) {
      if (err?.response?.status === 400) setErrors(err.response.data?.errors || {})
      else alert(authMessage(err) || '저장 실패')
    } finally {
      setBusy(false)
    }
  }

  const remove = async (row) => {
    if (!window.confirm('이 학사일정을 삭제하시겠습니까?')) return
    try {
      await axios.delete(`/api/admin/schedule/${row.id}`)
      if (editing?.id === row.id) setEditing(null)
      await load()
    } catch (err) {
      alert(authMessage(err) || '삭제 실패')
    }
  }

  const isEditing = (row) => editing && editing.id === row.id
  const field = (key, label, type) => (
    <input
      type={type}
      aria-label={label}
      value={editing[key]}
      onChange={(e) => setEditing({ ...editing, [key]: e.target.value })}
    />
  )
  const errorList = Object.entries(errors)

  const columns = [
    {
      key: 'name',
      header: '이름',
      primary: true,
      render: (row) =>
        isEditing(row) ? (
          <div>
            {field('name', '일정 이름', 'text')}
            {errorList.map(([k, msg]) => (
              <p key={k} className="admin-site-info-error" role="alert">{msg}</p>
            ))}
          </div>
        ) : (
          row.name
        ),
    },
    { key: 'start', header: '시작일', render: (row) => (isEditing(row) ? field('start', '시작일', 'date') : row.start) },
    { key: 'end', header: '종료일', render: (row) => (isEditing(row) ? field('end', '종료일', 'date') : row.end) },
    {
      key: 'actions',
      header: '관리',
      render: (row) =>
        isEditing(row) ? (
          <span className="admin-site-info-schedule__actions">
            <Button disabled={busy} onClick={save}>저장</Button>
            <Button variant="ghost" onClick={cancel}>취소</Button>
          </span>
        ) : (
          <span className="admin-site-info-schedule__actions">
            <Button variant="ghost" onClick={() => startEdit(row)}>수정</Button>
            <Button variant="danger" onClick={() => remove(row)}>삭제</Button>
          </span>
        ),
    },
  ]

  const shown = editing && editing.id === NEW_ID ? [editing, ...rows] : rows

  return (
    <Card as="section" className="admin-site-info-card admin-site-info-card--wide">
      <div className="admin-site-info-card__head">
        <h2 className="admin-site-info-card__title">학사일정</h2>
        <Button variant="ghost" disabled={!!editing} onClick={startAdd}>+ 일정 추가</Button>
      </div>
      <p className="admin-site-info-card__desc">학사일정은 위의 저장 버튼과 별개로, 이 카드에서 바로 저장됩니다.</p>
      <ResponsiveTable
        breakpoint="lg"
        columns={columns}
        rows={shown}
        rowKey={(row) => row.id}
        empty="등록된 학사일정이 없습니다."
      />
    </Card>
  )
}

export default ScheduleManager
