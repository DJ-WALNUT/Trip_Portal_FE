// 서버 사이트 정보를 기본값 위에 덮어쓴다. 기본값에 없는 서버 키는 무시한다.
export function mergeSiteInfo(defaults, server) {
  const result = { ...defaults }
  if (server === null || typeof server !== 'object' || Array.isArray(server)) return result
  for (const key of Object.keys(defaults)) {
    if (server[key] !== undefined && server[key] !== null) result[key] = server[key]
  }
  return result
}

export const instagramUrl = (id) => 'https://www.instagram.com/' + id
