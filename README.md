# 🍺 Gganbu Meeting - 실시간 주가 모니터링 & 채팅

이재용, 정의선, 젠슨 황이 만난 2025년 10월 30일 기준 주가 변동률을 실시간으로 보여주는 웹 애플리케이션

![Preview](preview.png)

## 📋 프로젝트 개요

- **삼성전자** (이재용), **현대차** (정의선), **NVIDIA** (젠슨 황)의 주가를 실시간 모니터링
- 2025년 10월 30일 기준 가격 대비 변동률 표시
- 가격 변동 시 애니메이션 효과 (상승: 빨강, 하락: 파랑)
- 실시간 채팅 기능 (최대 500개 메시지)
- 다크모드 디자인

## 🏗️ 아키텍처

```
┌─────────────────────────────┐
│   Next.js (App Router)      │
│   ├── Client Components     │  ← SWR 10초 폴링
│   └── Route Handlers        │  ← API: /api/stocks
│         (Vercel)             │
└─────────────────────────────┘
         │                 │
         │ Firebase SDK    │ HTTP API Calls
         ↓                 ↓
┌─────────────────┐  ┌──────────────────┐
│   Firestore     │  │  LS 증권 API     │
│   (채팅 DB)     │  │  Yahoo Finance   │
└─────────────────┘  └──────────────────┘
```

### 기술 스택

**Full Stack (Next.js)**
- Next.js 16 + TypeScript + App Router
- SWR (10초 폴링 - 실시간 주가 데이터)
- Firebase Firestore (실시간 채팅)
- DOMPurify (XSS 방지)
- Route Handlers (서버 사이드 API)
- LS 증권 OpenAPI (한국 주식)
- Yahoo Finance API (미국 주식)

**배포**
- Vercel (Full Stack)

## 🚀 빠른 시작

### 1. 저장소 클론

```bash
git clone <your-repo>
cd gganbu
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

```bash
cp .env.local.example .env.local
# .env.local에 Firebase 및 LS 증권 API Key 입력
```

### 4. Firebase 설정

**[Firebase 설정 가이드](./FIREBASE_SETUP.md)** 문서를 참고하여 Firestore 설정

### 5. 개발 서버 실행

```bash
npm run dev
```

앱: http://localhost:3000

---

## 📁 프로젝트 구조

```
gganbu/
├── src/
│   ├── app/                # App Router
│   │   ├── api/stocks/    # Route Handler (주식 API)
│   │   ├── globals.css    # 글로벌 스타일
│   │   └── page.tsx       # 메인 페이지
│   ├── components/        # UI 컴포넌트
│   ├── hooks/             # Custom Hooks (SWR, Firebase)
│   ├── lib/               # Firebase, Constants
│   ├── types/             # TypeScript 타입
│   └── utils/             # 유틸리티 함수
├── public/                # 정적 자산
├── .env.local             # 환경 변수
├── FIREBASE_SETUP.md      # Firebase 설정 가이드
├── DEPLOYMENT.md          # 배포 가이드
├── default.jpg            # 배경 이미지
└── preview.png            # 프리뷰 이미지
```

---

## 🔧 주요 기능

### 1. 실시간 주가 모니터링
- **SWR 10초 폴링** 기반 실시간 업데이트
- **Route Handler API**: Next.js 서버에서 주식 데이터 가져오기
- **가격 변동 애니메이션**: 상승(빨강), 하락(파랑)
- **기준 가격**: 2025년 10월 30일 종가 기준

### 2. 실시간 채팅
- **Firestore** 실시간 동기화
- **500개 메시지 제한**: 오래된 메시지 자동 삭제
- **보안**:
  - XSS 방지 (DOMPurify)
  - 욕설 필터링 (확장 가능)
  - 200자 제한
  - 3초 전송 간격 제한
- **익명 채팅**: 별도 인증 불필요

### 3. UI/UX
- **다크모드** 디자인
- **반응형** 레이아웃
- **실시간 날짜/시간** 표시
- 이미지 오버레이 형태의 주가 표시

---

## 📝 환경변수 설정

### .env.local

```env
# LS 증권 API (서버 사이드에서만 사용)
LS_APP_KEY=your_app_key
LS_APP_SECRET=your_app_secret

# Firebase 설정 (클라이언트 사이드)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Google Analytics (선택사항)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## 🌐 배포 가이드

### Vercel 배포

1. GitHub에 코드 푸시
2. [Vercel 대시보드](https://vercel.com) 접속
3. Import Project → GitHub 저장소 선택
4. 설정:
   - Build Command: `npm run build`
   - Install Command: `npm install`
5. Environment Variables 추가 (`.env.local` 내용)
6. Deploy

**상세 가이드**: [DEPLOYMENT.md](./DEPLOYMENT.md) 참조

---

## 🔐 보안 고려사항

### API Key 보호
- ✅ 서버에서만 LS 증권 API 호출
- ✅ 클라이언트는 서버에만 연결
- ✅ `.env` 파일은 Git에 포함되지 않음

### XSS 방지
- ✅ DOMPurify로 채팅 메시지 sanitize
- ✅ Firebase 보안 규칙으로 악의적인 쓰기 차단

### Rate Limiting
- ✅ 채팅 3초 제한
- ✅ 메시지 길이 200자 제한

---

## 🐛 트러블슈팅

### API 연결 실패
- LS 증권 API Key 확인
- `.env.local` 파일 위치 확인 (루트 디렉토리)
- 환경 변수 이름 확인 (`NEXT_PUBLIC_` 프리픽스)

### Firebase 오류
- Firebase 설정 확인
- 보안 규칙 확인
- 승인된 도메인 추가 (Vercel 도메인)

### 이미지 최적화
- [CloudConvert](https://cloudconvert.com/jpg-to-webp)에서 WebP 변환
- `default.webp`로 저장 후 `page.tsx` 수정

---

## 📊 TODO / 개선사항

- [x] React → Next.js 마이그레이션
- [x] Socket.io → SWR 폴링 전환
- [x] TypeScript 마이그레이션
- [x] client 폴더를 루트로 이동
- [ ] 2025년 10월 30일 실제 기준 가격 입력
- [ ] 이미지 WebP 변환
- [ ] 모바일 반응형 최적화
- [ ] 사용자별 닉네임 기능 (선택)
- [ ] 채팅 알림 기능

---

## 📄 라이선스

MIT License

---

## 👥 제작자

만든이: Claude Code & You

**문의**: GitHub Issues
