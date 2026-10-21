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
