"""로컬 개발용 더미 데이터 시드 스크립트.

사용법:  python seed_dev_data.py [BE 경로] [--force]
BE 경로 기본값은 프론트 저장소 루트 기준 ../Trip_Portal_BE (어디서 실행해도 동일).
BE 저장소의 data/ 폴더(git 무시 대상)에만 파일을 만든다.
"""
import argparse
import os
import sqlite3
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

import pandas as pd

KST = timezone(timedelta(hours=9))
FMT = "%Y-%m-%d %H:%M:%S"
FILES = [
    "stuff_ongoing.xlsx", "borrow_log.xlsx", "major.xlsx",
    "building_info.xlsx", "facility_info.xlsx", "database.db",
]
LONG_ITEM = "초대형휴대용접이식돗자리세트"
LONG_TITLE = "2026학년도여정학생회물품대여서비스이용안내및유의사항총정리공지사항입니다"


def stock():
    rows = [
        ("우산", 8, "생활"), ("보조배터리", 5, "전자"), ("멀티탭", 4, "전자"),
        ("돗자리", 6, "생활"), ("담요", 3, "생활"), ("충전기(C타입)", 7, "전자"),
        ("블루투스 스피커", 2, "전자"), ("행사용 테이블", 4, "행사"),
        ("행사용 의자", 20, "행사"), ("확성기", 0, "행사"),
        (LONG_ITEM, 2, "생활"), ("종이컵", 100, "일회용품"),
        ("일회용 접시", 80, "일회용품"), ("나무젓가락", 150, "일회용품"),
    ]
    return pd.DataFrame(rows, columns=["물품", "재고현황", "카테고리"])


def borrow_log():
    now = datetime.now(KST)
    t = lambda days: (now - timedelta(days=days)).strftime(FMT)
    cols = ["이름", "전화번호", "학번", "학과", "대여물품", "대여담당자",
            "대여시각", "대여현황", "반납담당자", "반납시각"]
    rows = [
        ("김여정", "01011110001", "20260001", "컴퓨터공학과", "우산", "", t(0), "신청", "", ""),
        ("이새길", "01011110002", "20260002", "전자공학과", "보조배터리", "", t(0), "신청", "", ""),
        ("박하늘", "01011110003", "20260003", "경영학과", "돗자리, 담요", "", t(0), "신청", "", ""),
        ("최바다", "01022220001", "20250001", "기계공학과", "멀티탭", "홍관리", t(2), "미반납", "", ""),
        ("정구름", "01022220002", "20250002", "화학공학과", "행사용 테이블", "홍관리", t(10), "미반납", "", ""),
        ("강나무", "01022220003", "20250003", "건축학과", "충전기(C타입)", "홍관리", t(10), "미반납", "", ""),
        ("윤별", "01033330001", "20240001", "컴퓨터공학과", "우산", "홍관리", t(14), "반납완료", "홍관리", t(12)),
        ("한솔", "01033330002", "20240002", "전자공학과", "담요", "홍관리", t(8), "반납완료", "홍관리", t(7)),
        ("오름", "01033330003", "20240003", "경영학과", "돗자리", "홍관리", t(5), "반납완료", "홍관리", t(4)),
    ]
    return pd.DataFrame(rows, columns=cols)


def sqlite_seed(db_path):
    now = datetime.now(KST).replace(tzinfo=None)
    ts = lambda d: (now - timedelta(days=d)).strftime("%Y-%m-%d %H:%M:%S.%f")
    con = sqlite3.connect(db_path)
    try:
        # models.py 열 정의와 동일
        con.executescript("""
        CREATE TABLE IF NOT EXISTS notices (
            id INTEGER NOT NULL PRIMARY KEY,
            title VARCHAR(200) NOT NULL,
            content TEXT NOT NULL,
            author VARCHAR(50),
            views INTEGER,
            fixed BOOLEAN,
            created_at DATETIME,
            is_public BOOLEAN
        );
        CREATE TABLE IF NOT EXISTS notice_files (
            id INTEGER NOT NULL PRIMARY KEY,
            notice_id INTEGER NOT NULL REFERENCES notices (id),
            filename VARCHAR(300) NOT NULL
        );
        CREATE TABLE IF NOT EXISTS schedules (
            id INTEGER NOT NULL PRIMARY KEY,
            name VARCHAR(50), start_date VARCHAR(20), end_date VARCHAR(20)
        );
        CREATE TABLE IF NOT EXISTS insta_posts (
            id INTEGER NOT NULL PRIMARY KEY,
            img_filename VARCHAR(300) NOT NULL,
            link_url VARCHAR(500) NOT NULL,
            created_at DATETIME
        );
        """)
        notices = [
            ("[필독] 물품 대여 이용 안내", "## 이용 안내\n\n- 학생증을 지참해 주세요.\n- 대여 기간은 **7일**입니다.", "여정 학생회", 120, 1, ts(30), 1),
            ("오늘 올라온 공지입니다", "오늘 작성된 공지사항 본문입니다.", "여정 학생회", 3, 0, ts(0), 1),
            ("지난주 행사 결과 안내", "행사 결과를 안내드립니다.\n\n감사합니다.", "여정 학생회", 45, 0, ts(7), 1),
            ("비공개 임시 공지", "관리자만 볼 수 있는 임시 글입니다.", "여정 학생회", 0, 0, ts(2), 0),
            (LONG_TITLE, "긴 제목 레이아웃 확인용 공지입니다.", "여정 학생회", 9, 0, ts(3), 1),
            ("학생회비 납부 안내", "학생회비 납부 기간을 안내드립니다.", "여정 학생회", 77, 0, ts(15), 1),
        ]
        con.executemany(
            "INSERT INTO notices (title, content, author, views, fixed, created_at, is_public) VALUES (?,?,?,?,?,?,?)",
            notices)
        con.executemany(
            "INSERT INTO insta_posts (img_filename, link_url, created_at) VALUES (?,?,?)",
            [(f"dev_insta_{i}.jpg", f"https://www.instagram.com/p/dev{i}/", ts(i)) for i in (1, 2, 3)])
        con.commit()
    finally:
        con.close()


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    default_be = Path(__file__).resolve().parents[2].parent / "Trip_Portal_BE"
    ap.add_argument("be_path", nargs="?", default=str(default_be))
    ap.add_argument("--force", action="store_true", help="기존 data 파일 덮어쓰기")
    args = ap.parse_args()

    be = Path(args.be_path).resolve()
    if not (be / "app.py").exists():
        sys.exit(f"BE 경로가 올바르지 않습니다: {be}")
    data = be / "data"
    data.mkdir(exist_ok=True)

    existing = [f for f in FILES if (data / f).exists()]
    if existing and not args.force:
        sys.exit(f"이미 존재하는 파일: {', '.join(existing)}\n덮어쓰려면 --force 를 사용하세요.")

    # 1) 아무것도 지우기 전에, 기존 파일을 모두 교체할 수 있는지 확인한다(잠겨 있으면 이름 변경이 실패).
    for f in existing:
        src, probe = data / f, data / (f + ".probe")
        try:
            os.replace(src, probe)
            os.replace(probe, src)
        except OSError as e:
            if probe.exists() and not src.exists():
                os.replace(probe, src)
            sys.exit(f"{f} 을(를) 교체할 수 없습니다 ({e}).\n백엔드(app.py)를 먼저 종료하세요. 아무 파일도 변경하지 않았습니다.")

    # 2) 같은 폴더의 임시 이름으로 모두 만든 뒤 os.replace 로 한 번에 제자리에 교체한다.
    tmp = {f: data / (f + ".tmp" + Path(f).suffix) for f in FILES}
    try:
        stock().to_excel(tmp["stuff_ongoing.xlsx"], index=False)
        borrow_log().to_excel(tmp["borrow_log.xlsx"], index=False)
        pd.DataFrame({"학과명": ["컴퓨터공학과", "전자공학과", "기계공학과", "화학공학과", "건축학과", "경영학과"]}
                     ).to_excel(tmp["major.xlsx"], index=False)
        pd.DataFrame([
            ("A", "공학관", "공과대학 강의동입니다."),
            ("B", "학생회관", "학생회실과 동아리방이 있는 건물입니다."),
        ], columns=["building_id", "building_name", "description"]).to_excel(tmp["building_info.xlsx"], index=False)
        pd.DataFrame([
            ("A", "공학관 열람실", "공학관 2층", "조용히 공부할 수 있는 열람실입니다.", ""),
            ("B", "학생회실", "학생회관 1층", "물품 대여를 진행하는 학생회실입니다.", ""),
        ], columns=["building_id", "facility_name", "location", "description", "image_file"]
        ).to_excel(tmp["facility_info.xlsx"], index=False)
        sqlite_seed(tmp["database.db"])
        for f in FILES:
            os.replace(tmp[f], data / f)
    finally:
        for t in tmp.values():
            if t.exists():
                t.unlink()
    print(f"시드 완료: {data}")


if __name__ == "__main__":
    main()
