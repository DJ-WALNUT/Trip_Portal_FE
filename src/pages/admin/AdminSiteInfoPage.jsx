import React, { useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useSiteInfo } from '@/context/SiteInfoContext'
import { PageHeader, Card, Field, Toggle, Button, BottomBar, Spinner, EmptyState } from '@/components/ui'
import SchoolLinksEditor from './SchoolLinksEditor'
import ScheduleManager from './ScheduleManager'
import './AdminCommon.css'
import './AdminSiteInfo.css'

// 편집 대상 키 (system.snowfall 은 대시보드 토글이 관리하므로 제외)
const KEYS = [
  'contact.address', 'contact.room', 'contact.email', 'contact.manager',
  'sns.instagram', 'sns.linktree', 'sns.kakao',
  'links.school', 'links.external',
  'home.hero_sub', 'home.hero_title', 'footer.copyright',
  'maintenance.notice', 'maintenance.available',
  'rental.enabled', 'rental.return_days', 'rental.cancel_notice',
]

const idOf = (key) => `site-info-${key}`
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)
const clone = (v) => JSON.parse(JSON.stringify(v))
const AUTH_MSG = (err) =>
  [401, 403].includes(err?.response?.status) ? err.response.data?.message : undefined
const pick = (data) => Object.fromEntries(KEYS.filter((k) => k in data).map((k) => [k, clone(data[k])]))

function AdminSiteInfoPage() {
  const navigate = useNavigate()
  const { refresh } = useSiteInfo()
  const [original, setOriginal] = useState(null)
  const [draft, setDraft] = useState(null)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const savingRef = useRef(false)
  const [loadError, setLoadError] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (localStorage.getItem('adminRole') !== 'master') {
      alert('마스터 권한이 필요합니다.')
      navigate('/admin/dashboard')
      return undefined
    }
    let alive = true
    setLoadError(false)
    axios
      .get('/api/site-info')
      .then((res) => {
        if (!alive) return
        const data = pick(res.data.data)
        setOriginal(data)
        setDraft(clone(data))
      })
      .catch(() => {
        if (alive) setLoadError(true)
      })
    return () => {
      alive = false
    }
  }, [navigate, attempt])

  const changedKeys = useMemo(
    () => (original && draft ? KEYS.filter((k) => k in original && !same(draft[k], original[k])) : []),
    [original, draft]
  )

  // 첫 오류 필드로 스크롤 + 포커스
  useEffect(() => {
    const first = KEYS.find((k) => errors[k])
    if (!first) return
    const el = document.getElementById(idOf(first)) || document.getElementById(first)
    if (el) {
      el.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
      el.focus?.()
    }
  }, [errors])

  if (!draft && loadError) {
    return (
      <div className="admin-site-info">
        <PageHeader title="정보 관리" />
        <EmptyState title="정보를 불러오지 못했습니다.">
          <Button onClick={() => setAttempt((n) => n + 1)}>다시 시도</Button>
        </EmptyState>
      </div>
    )
  }

  if (!draft) {
    return (
      <div className="admin-site-info">
        <PageHeader title="정보 관리" />
        <Spinner />
      </div>
    )
  }

  const set = (key, value) => {
    setDraft((d) => ({ ...d, [key]: value }))
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e))
  }

  const save = async () => {
    if (savingRef.current || changedKeys.length === 0) return
    savingRef.current = true
    setSaving(true)
    const changes = {}
    changedKeys.forEach((k) => {
      changes[k] = k === 'rental.return_days' && draft[k] !== '' ? Number(draft[k]) : clone(draft[k])
    })
    try {
      const res = await axios.put('/api/admin/site-info', changes)
      const data = pick(res.data.data)
      setOriginal(data)
      setDraft(clone(data))
      setErrors({})
      alert('저장되었습니다.')
      refresh()
    } catch (err) {
      if (err?.response?.status === 400) setErrors(err.response.data?.errors || {})
      else alert(AUTH_MSG(err) || '저장 실패')
    } finally {
      savingRef.current = false
      setSaving(false)
    }
  }

  const err = (key) =>
    errors[key] ? <p className="admin-site-info-error" id={`${idOf(key)}-error`} role="alert">{errors[key]}</p> : null
  const a11y = (key) => ({ 'aria-invalid': errors[key] ? true : undefined, 'aria-describedby': errors[key] ? `${idOf(key)}-error` : undefined })

  const text = (key, label, props = {}) => (
    <Field label={label} htmlFor={idOf(key)} hint={props.hint}>
      <input
        id={idOf(key)}
        type={props.type || 'text'}
        value={draft[key]}
        onChange={(e) => set(key, e.target.value)}
        {...a11y(key)}
      />
      {err(key)}
    </Field>
  )
  const area = (key, label, rows = 3) => (
    <Field label={label} htmlFor={idOf(key)}>
      <textarea id={idOf(key)} rows={rows} value={draft[key]} onChange={(e) => set(key, e.target.value)} {...a11y(key)} />
      {err(key)}
    </Field>
  )
  const ext = draft['links.external']
  const setExt = (patch) => set('links.external', { ...ext, ...patch })

  return (
    <div className="admin-site-info">
      <PageHeader title="정보 관리" description="사이트에 표시되는 문구와 링크를 한곳에서 관리합니다." />

      <div className="admin-site-info-grid">
        <Card as="section" className="admin-site-info-card">
          <h2 className="admin-site-info-card__title">연락처·위치</h2>
          {text('contact.address', '학생회실 주소')}
          {text('contact.room', '수령·반납 장소')}
          {text('contact.email', '문의 이메일', { type: 'email' })}
          {text('contact.manager', '운영 책임자')}
        </Card>

        <Card as="section" className="admin-site-info-card">
          <h2 className="admin-site-info-card__title">SNS</h2>
          <Field label="인스타그램 계정" htmlFor={idOf('sns.instagram')} hint="앞의 @는 자동으로 제거됩니다.">
            <div className="admin-site-info-prefix">
              <span className="admin-site-info-prefix__at" aria-hidden="true">@</span>
              <input
                id={idOf('sns.instagram')}
                type="text"
                value={draft['sns.instagram']}
                onChange={(e) => set('sns.instagram', e.target.value)}
                {...a11y('sns.instagram')}
              />
            </div>
            {err('sns.instagram')}
          </Field>
          {text('sns.linktree', '링크트리 주소', { type: 'url' })}
          {text('sns.kakao', '카카오 채널 주소', { type: 'url' })}
        </Card>

        <Card as="section" className="admin-site-info-card">
          <h2 className="admin-site-info-card__title">링크</h2>
          <p className="admin-site-info-card__label">학교 바로가기 (1~10개)</p>
          <SchoolLinksEditor value={draft['links.school']} onChange={(next) => set('links.school', next)} errors={errors['links.school']} />
          <p className="admin-site-info-card__label">헤더 외부 링크</p>
          <Field label="외부 링크 이름" htmlFor={idOf('links.external')}>
            <input id={idOf('links.external')} type="text" value={ext.label} onChange={(e) => setExt({ label: e.target.value })} {...a11y('links.external')} />
          </Field>
          <Field label="외부 링크 주소" htmlFor={`${idOf('links.external')}-url`}>
            <input id={`${idOf('links.external')}-url`} type="url" value={ext.url} onChange={(e) => setExt({ url: e.target.value })} {...a11y('links.external')} />
            {err('links.external')}
          </Field>
        </Card>

        <Card as="section" className="admin-site-info-card">
          <h2 className="admin-site-info-card__title">홈·푸터 문구</h2>
          {text('home.hero_sub', '히어로 작은 문구')}
          {text('home.hero_title', '히어로 제목')}
          {area('footer.copyright', '푸터 저작권 문구')}
        </Card>

        <Card as="section" className="admin-site-info-card">
          <h2 className="admin-site-info-card__title">점검 안내</h2>
          {area('maintenance.notice', '점검 안내 문구')}
          {area('maintenance.available', '점검 중 이용 가능 서비스')}
        </Card>

        <Card as="section" className="admin-site-info-card">
          <h2 className="admin-site-info-card__title">대여 운영</h2>
          <Toggle
            id={idOf('rental.enabled')}
            name="rental.enabled"
            label="대여 신청 받기"
            checked={!!draft['rental.enabled']}
            onChange={(e) => set('rental.enabled', e.target.checked)}
          />
          {err('rental.enabled')}
          <Field label="반납 기간(일)" htmlFor={idOf('rental.return_days')} hint="1~30일">
            <input
              id={idOf('rental.return_days')}
              type="number"
              min="1"
              max="30"
              value={draft['rental.return_days']}
              onChange={(e) => set('rental.return_days', e.target.value === '' ? '' : Number(e.target.value))}
              {...a11y('rental.return_days')}
            />
            {err('rental.return_days')}
          </Field>
          {area('rental.cancel_notice', '자동 취소 안내')}
        </Card>

        <ScheduleManager />
      </div>

      <BottomBar>
        <span className="admin-site-info-dirty" role="status">저장하지 않은 변경 {changedKeys.length}개</span>
        <Button size="lg" disabled={changedKeys.length === 0 || saving} onClick={save}>저장</Button>
      </BottomBar>
    </div>
  )
}

export default AdminSiteInfoPage
