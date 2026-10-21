// 사이트 정보 기본값. 서버(/api/site-info)가 응답하지 않거나 값이 비어 있을 때 쓰인다.
// 백엔드 Trip_Portal_BE/site_settings.py 의 기본값과 같아야 한다(system.snowfall 제외).
// 값만 고치면 되고, 로직은 넣지 않는다. 그룹 순서: 연락처·위치 → SNS → 링크 → 홈 → 푸터 → 점검 → 대여.
export const DEFAULT_SITE_INFO = {
  // ── 연락처·위치 ──
  // 푸터에 표시되는 학생회실 주소
  'contact.address': '14662 경기 부천시 원미구 지봉로 43 가톨릭대학교 니콜스관 N507 공과대학 학생회실',
  // 대여 완료 화면의 수령·반납 안내 장소
  'contact.room': '공대방(N507)',
  // 푸터에 표시되는 문의 이메일
  'contact.email': 'cukeng2026@gmail.com',
  // 푸터의 "홈페이지 운영 책임자"
  'contact.manager': '김세호',

  // ── SNS ──
  // 플로팅 SNS 링크, 홈 인스타 카드의 @ 표시, 학과 페이지 공과대학 카드
  'sns.instagram': 'cuk.engineering',
  // 플로팅 SNS의 링크트리 버튼
  'sns.linktree': 'https://linktr.ee/cuk_engineering',
  // 플로팅 SNS의 카카오 채널 버튼
  'sns.kakao': 'https://pf.kakao.com/_xcyDGn',

  // ── 링크 ──
  // 홈 화면과 점검 화면의 학교 바로가기 목록 (1~10개)
  'links.school': [
    { label: '학교 홈페이지', url: 'https://www.catholic.ac.kr' },
    { label: '학사일정', url: 'https://www.catholic.ac.kr/ko/support/calendar2024_list.do' },
    { label: '트리니티', url: 'https://uportal.catholic.ac.kr' },
    { label: '사이버캠퍼스', url: 'https://e-cyber.catholic.ac.kr' },
    { label: '공결허가원', url: 'https://www.catholic.ac.kr/ko/support/absence_notification.do' },
  ],
  // 헤더의 외부 링크 버튼
  'links.external': { label: '2025 새길', url: 'https://2025saegil.cukeng.kr' },

  // ── 홈 ──
  // 홈 히어로 위쪽 작은 문구
  'home.hero_sub': '제4대 공과대학 학생회 [여정]',
  // 홈 히어로 큰 제목
  'home.hero_title': '변화를 새길, 우리의 여정!',

  // ── 푸터 ──
  // 푸터 저작권 문구 (여러 줄)
  'footer.copyright': '© 2026 Catholic University of Korea.\nCUK Engineering Student Council Trip. All Rights Reserved',

  // ── 점검 ──
  // 점검 화면 안내 문구 (여러 줄)
  'maintenance.notice': '보다 안정적인 서비스를 위해\n서버를 점검하고 있습니다.\n매일 05:00 ~ 06:00은 정기 점검 시간입니다.',
  // 점검 화면의 이용 가능 서비스 안내 (여러 줄)
  'maintenance.available': '이용 가능 서비스:\n학교페이지 바로가기, 조직도 열람,\n단과대 및 학과 편성',

  // ── 대여 ──
  // 헤더, 홈, 대여 신청 화면의 대여 사용 여부
  'rental.enabled': true,
  // 대여 완료 화면의 반납일(일 수)
  'rental.return_days': 4,
  // 대여 완료 화면의 자동 취소 안내 (여러 줄)
  'rental.cancel_notice': '※ 신청 시각 기준 24시간이 지나면 자동으로 신청이 취소되오니,\n참고하여 수령해주시길 바랍니다.',
}
