// localStorage 접근이 막혀 있거나 throw해도 앱이 깨지지 않도록 예외를 삼킨다.
export function readBool(key, fallback) {
  try {
    const value = window.localStorage.getItem(key)
    if (value === null) return fallback
    return value === 'true'
  } catch {
    return fallback
  }
}

export function writeBool(key, value) {
  try {
    window.localStorage.setItem(key, String(Boolean(value)))
  } catch {
    // 저장 실패는 무시한다
  }
}
