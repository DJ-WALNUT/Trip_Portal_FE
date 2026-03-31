import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Trophy, RotateCcw, Play, Bug } from 'lucide-react';
import './DinoGame.css';

const DINO_RUN_1 = '/images/easter/engini-run-1.png';
const DINO_RUN_2 = '/images/easter/engini-run-2.png';

// --- [보안] 점수 암호화 (이전과 동일) ---
const SECRET_SALT = "engini_physics_v1_";
const STORAGE_KEY = "trip_portal_egg_score_v1";

const encryptScore = (score) => btoa(SECRET_SALT + score.toString());
const decryptScore = (encryptedVal) => {
  try {
    const decoded = atob(encryptedVal);
    if (decoded.startsWith(SECRET_SALT)) {
      return parseInt(decoded.replace(SECRET_SALT, ''), 10);
    }
    return 0;
  } catch { return 0; }
};

// --- [물리 상수] 구글 다이노 게임과 유사한 느낌을 위한 값 ---
const DEFAULT_GRAVITY = 0.6;          // 중력 (매 프레임마다 아래로 당기는 힘)
const DEFAULT_JUMP = 10;     // 점프력 (위로 솟구치는 힘)
const DEFAULT_SPEED = 5;   // 초기 게임 속도
const GAME_SPEED_MAX = 100;    // 최대 게임 속도
const ACCELERATION = 0.2;   // 가속도 (프레임마다 빨라지는 정도)

const DinoGame = ({ isOpen, onClose, isHardMode }) => {
  // === React State (UI 렌더링용) ===
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [dinoSprite, setDinoSprite] = useState(DINO_RUN_1);

  // === Refs (게임 루프 내부 변수 - 렌더링 유발 X) ===
  const requestRef = useRef(null);
  const containerRef = useRef(null);
  const dinoRef = useRef(null);
  const obstacleRef = useRef(null);

  // [수정] 컴포넌트 내부에 별도의 const를 재선언하지 말고, 
  // 필요할 때 직접 계산하거나 값을 변수에 할당합니다.
  const currentPhysics = {
    gravity: isHardMode ? 0.8 : DEFAULT_GRAVITY,
    jumpStrength: isHardMode ? 12 : DEFAULT_JUMP,
    startSpeed: isHardMode ? 10 : DEFAULT_SPEED
  };

  // 물리 엔진 상태 변수
  const gameState = useRef({
    dinoY: 0,           // 공룡 높이 (px)
    dinoVelocity: 0,    // 공룡 수직 속도
    isJumping: false,   // 점프 중 여부
    
    obstacleX: 600,     // 장애물 위치 (px) - 초기값은 화면 밖
    gameSpeed: currentPhysics.startSpeed, // 현재 게임 속도
    score: 0,           // 내부 점수 (소수점 포함)
    tick: 0             // 애니메이션 프레임 카운터
  });

  // 초기 로드
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setHighScore(decryptScore(saved));
  }, []);

  // 게임 시작/재시작
  const startGame = useCallback(() => {
    setIsPlaying(true);
    setIsGameOver(false);
    setScore(0);
    setDinoSprite(DINO_RUN_1);

    // 상태 초기화
    gameState.current = {
      dinoY: 0,
      dinoVelocity: 0,
      isJumping: false,
      obstacleX: containerRef.current ? containerRef.current.offsetWidth + 50 : 600,
      gameSpeed: currentPhysics.startSpeed,
      score: 0,
      tick: 0
    };
  }, [isHardMode, currentPhysics.startSpeed]);

  // 점프 트리거 (물리 엔진에 힘만 전달)
  const jump = useCallback(() => {
    // 바닥에 있을 때만 점프 가능
    if (gameState.current.dinoY === 0 && !gameState.current.isJumping) {
      gameState.current.isJumping = true;
      gameState.current.dinoVelocity = currentPhysics.jumpStrength;
    }
  }, [currentPhysics.jumpStrength]);

  // === [핵심] 게임 루프 (60FPS) ===
  const gameLoop = useCallback(() => {
    if (!isPlaying || isGameOver) return;

    const state = gameState.current;
    state.tick++;
    
    // 1. 공룡 물리 계산 (중력 적용)
    if (state.isJumping || state.dinoY > 0) {
      state.dinoY += state.dinoVelocity;       // 속도만큼 이동
      state.dinoVelocity -= currentPhysics.gravity;           // 중력만큼 속도 감소
    }

    // 바닥 충돌 처리
    if (state.dinoY <= 0) {
      state.dinoY = 0;
      state.dinoVelocity = 0;
      state.isJumping = false;
    }

    // 2. 장애물 이동 및 리스폰
    state.obstacleX -= state.gameSpeed;

    // 화면 왼쪽 끝으로 나가면 재배치 (랜덤 간격 효과)
    if (state.obstacleX < -50) {
      // 컨테이너 너비 가져오기
      const containerWidth = containerRef.current ? containerRef.current.offsetWidth : 600;
      
      // 랜덤 갭 추가 (속도가 빠를수록 더 멀리서 나올 수도 있게)
      const randomGap = Math.random() * 300 + 50; 
      state.obstacleX = containerWidth + randomGap;
      
      // 속도 증가
      if (state.gameSpeed < GAME_SPEED_MAX) {
        state.gameSpeed += ACCELERATION;
      }
    }

    // 3. 점수 증가
    state.score += 0.1; // 프레임당 점수
    
    // UI 업데이트 (너무 자주는 말고 5프레임마다 혹은 점수 바뀔 때)
    if (Math.floor(state.score) > score) {
       setScore(Math.floor(state.score));
    }
    
    // 4. [수정됨] 스프라이트 애니메이션
    // 점수와 상관없이 tick을 기준으로 일정하게 교체합니다.
    if (state.dinoY > 0) {
      // 점프 중일 때는 달리는 모션 멈춤 (첫 번째 이미지 고정)
      setDinoSprite(DINO_RUN_1);
    } else {
      // 바닥에 있을 때: 15프레임마다 발을 구릅니다 (숫자를 줄이면 더 빨리 뜀)
      if (state.tick % 15 === 0) {
        setDinoSprite(prev => prev === DINO_RUN_1 ? DINO_RUN_2 : DINO_RUN_1);
      }
    }

    // 5. [DOM 업데이트] Ref를 사용하여 직접 스타일 조작 (리액트 렌더링 우회 -> 성능 최적화)
    if (dinoRef.current) {
      dinoRef.current.style.bottom = `${state.dinoY}px`;
    }
    if (obstacleRef.current) {
      obstacleRef.current.style.left = `${state.obstacleX}px`;
    }

    // 6. 충돌 감지
    if (dinoRef.current && obstacleRef.current) {
      const dinoRect = dinoRef.current.getBoundingClientRect();
      const obsRect = obstacleRef.current.getBoundingClientRect();

      // 히트박스 보정 (여백을 주어 억울한 죽음 방지)
      const margin = 12; 

      if (
        dinoRect.right - margin > obsRect.left + margin &&
        dinoRect.left + margin < obsRect.right - margin &&
        dinoRect.bottom - margin > obsRect.top + margin
      ) {
        handleGameOver();
        return; // 루프 종료
      }
    }

    requestRef.current = requestAnimationFrame(gameLoop);
  }, [isPlaying, isGameOver, currentPhysics.gravity, score]);

  // 루프 실행기
  useEffect(() => {
    if (isPlaying && !isGameOver) {
      requestRef.current = requestAnimationFrame(gameLoop);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isPlaying, isGameOver, gameLoop]);

  // 게임 오버 처리
  const handleGameOver = () => {
    setIsGameOver(true);
    cancelAnimationFrame(requestRef.current);
    
    const finalScore = Math.floor(gameState.current.score);
    setScore(finalScore);

    setHighScore(prev => {
      if (finalScore > prev) {
        localStorage.setItem(STORAGE_KEY, encryptScore(finalScore));
        return finalScore;
      }
      return prev;
    });
  };

  // 키보드 컨트롤
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (!isPlaying) startGame();
        else if (isGameOver) startGame();
        else jump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isPlaying, isGameOver, jump, startGame]);

  if (!isOpen) return null;

  return (
    <div className="dino-overlay animate-fade-in" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`dino-card ${isHardMode ? 'hard-mode-border' : ''}`}>
        <div className="dino-header">
          <div className="dino-title">
            <span className={`badge ${isHardMode ? 'hard' : ''}`}>
              {isHardMode ? "⚠️ 이스%에@" : "이스터에그"}
            </span>
            <h3>{isHardMode ? "HARD MODE : 달@# 엔지$!" : "달려라 엔지니!"}</h3>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* 게임 영역 참조(ref) 추가 */}
        <div 
          ref={containerRef}
          className="dino-screen" 
          onClick={!isPlaying || isGameOver ? startGame : jump}
          onTouchStart={!isPlaying || isGameOver ? startGame : jump}
        >
          {isHardMode && (
            <div className="hard-mode-overlay">
              <div className="glitch-text">⚠️ SYSTEM: KONAMI_PROTOCOL_OVERLOAD</div>
              <p>중력이 1.3배 증가했습니다. 행운을 빕니다.</p>
            </div>
          )}
          <div className="score-board">
            <span className="current-score">SCORE: {score.toString().padStart(5, '0')}</span>
            <span className="high-score"><Trophy size={14}/> HI: {highScore.toString().padStart(5, '0')}</span>
          </div>

          {!isPlaying && !isGameOver && (
            <div className="game-message">
              <Play size={48} className="blink" />
              <p>화면을 터치하거나 스페이스바를 누르세요</p>
            </div>
          )}

          {isGameOver && (
            <div className="game-message game-over">
              <h2>GAME OVER</h2>
              <button className="restart-btn" onClick={(e) => { e.stopPropagation(); startGame(); }}>
                <RotateCcw size={16} /> 다시 하기
              </button>
            </div>
          )}

          <div 
            ref={dinoRef}
            className="dino-char"
            style={{ backgroundImage: `url(${dinoSprite})` }}
          />

          {isPlaying && (
            <div 
              ref={obstacleRef}
              className="obstacle"
            >
              <Bug size={isHardMode ? 45 : 34} color={isHardMode ? "#ff0000" : "#e74c3c"} />
            </div>
          )}
        </div>
        
        <div className="dino-footer">
           <p>PC: 스페이스바 / Mobile: 터치</p>
        </div>
      </div>
    </div>
  );
};

export default DinoGame;