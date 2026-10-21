# 로컬 백엔드 (개발용)

운영 서버(`https://trip-api.cukeng.kr`) 대신 로컬 Flask 백엔드와 더미 데이터로 프론트를 확인하기 위한 도구입니다.
`Trip_Portal_BE`는 이 저장소와 같은 상위 폴더에 있다고 가정합니다. (`data/`, `.env`는 BE에서 git 무시 대상입니다.)

## 1. 가상환경 (이 폴더에서, PowerShell)

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r ../../../Trip_Portal_BE/requirements.txt
```

## 2. BE `.env` 만들기 (`Trip_Portal_BE/.env`)

```
ADMIN_PASSWORD=devmaster
SUB_PASSWORD=devsub
FLASK_SECRET_KEY=dev
```

## 3. 더미 데이터 넣기

```powershell
python seed_dev_data.py            # 기본 BE 경로: 프론트 저장소 옆 ../Trip_Portal_BE
python seed_dev_data.py --force    # 이미 파일이 있으면 덮어쓰기
```

## 4. 백엔드 실행 (포트 5000)

```powershell
cd ../../../Trip_Portal_BE
python app.py
```

(위 가상환경이 활성화된 상태여야 합니다. 서버는 BE 폴더에서 실행해야 `data/` 경로를 찾습니다.)

## 5. 프론트 실행

```powershell
$env:VITE_API_TARGET='http://localhost:5000'; npm run dev
```

관리자 로그인: 마스터 `devmaster`, 서브 `devsub`.

## 주의

로그 엑셀 다운로드 버튼은 운영 URL이 하드코딩되어 있으니 클릭 금지입니다.

## 정보 관리 기능 로컬 테스트

1. 위 4~5단계대로 백엔드(5000)와 프론트 dev 서버를 띄웁니다. 백엔드는 시작할 때 `db.create_all()`로 `site_settings` 테이블을 만들고 기본값을 채웁니다.
2. `/admin`에서 마스터 비밀번호(`devmaster`)로 로그인한 뒤 `/admin/site-info`를 열어 설정과 학사일정을 수정합니다. 서브 관리자(`devsub`)는 수정 API가 403입니다.
3. 값을 저장한 뒤 홈, 푸터, 대여 화면에 반영되는지 확인하고, 확인이 끝나면 `rental.enabled` 등 바꾼 값을 원래대로 되돌립니다. (`seed_dev_data.py --force`는 백엔드를 끈 상태에서만 실행)
4. 백엔드 테스트는 BE 폴더에서 이 가상환경으로 실행합니다. (`requirements-dev.txt`에 pytest)

```powershell
cd ../../../Trip_Portal_BE
pip install -r requirements-dev.txt
python -m pytest -q
```

참고: BE `.env`의 비밀번호가 위와 다르면 `ADMIN_PASSWORD`/`SUB_PASSWORD`를 해당 프로세스 환경변수로만 지정해 `python app.py`를 실행할 수 있습니다. (`.env`보다 우선)
