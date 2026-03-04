# 🔥 Firebase 프로젝트 설정 가이드

이 가이드는 Firestore를 이용한 실시간 채팅 기능을 위한 Firebase 설정 방법을 설명합니다.

## 1. Firebase 프로젝트 생성

### 1-1. Firebase Console 접속
1. [Firebase Console](https://console.firebase.google.com/) 접속
2. "프로젝트 추가" 클릭

### 1-2. 프로젝트 설정
1. **프로젝트 이름**: `gganbu` 또는 원하는 이름 입력
2. **Google Analytics**: 선택 사항 (나중에 추가 가능)
3. 프로젝트 생성 완료

---

## 2. 웹 앱 추가

### 2-1. 앱 등록
1. Firebase 프로젝트 대시보드에서 **웹 아이콘(</>)** 클릭
2. **앱 닉네임**: `gganbu-client` 입력
3. **Firebase Hosting 설정**: 체크 안 함 (Vercel 사용)
4. "앱 등록" 클릭

### 2-2. Firebase SDK 설정 복사
다음과 같은 설정이 표시됩니다:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnop"
};
```

**이 정보를 복사해두세요!** `.env.local` 파일에 사용됩니다.

---

## 3. Firestore Database 생성

### 3-1. Firestore 활성화
1. 좌측 메뉴에서 **"Firestore Database"** 클릭
2. **"데이터베이스 만들기"** 클릭

### 3-2. 보안 규칙 선택
- **테스트 모드로 시작**: 개발용 (30일 후 만료)
- **프로덕션 모드로 시작**: 권장 (아래에서 규칙 수정)

**프로덕션 모드** 선택 권장

### 3-3. 위치 선택
- **asia-northeast3 (Seoul)** 선택 (한국 서버)

### 3-4. 데이터베이스 만들기 클릭

---

## 4. Firestore 보안 규칙 설정

### 4-1. 규칙 탭 이동
1. Firestore Database 페이지에서 **"규칙"** 탭 클릭

### 4-2. 규칙 작성
다음 규칙을 복사하여 붙여넣기:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 채팅 메시지 컬렉션
    match /messages/{message} {
      // 모두 읽기 가능
      allow read: if true;

      // 쓰기는 조건부 허용
      allow write: if request.resource.data.text != null
                   && request.resource.data.text is string
                   && request.resource.data.text.size() > 0
                   && request.resource.data.text.size() <= 200
                   && request.resource.data.createdAt != null;

      // 삭제는 차단 (서버에서만 오래된 메시지 삭제)
      allow delete: if false;
    }
  }
}
```

### 4-3. 규칙 게시
"게시" 버튼 클릭

---

## 5. 클라이언트 환경변수 설정

### 5-1. `.env.local` 파일 생성
`client/` 디렉토리에서:

```bash
cd client
cp .env.local.example .env.local
```

### 5-2. Firebase 설정 입력
`.env.local` 파일을 열고 Firebase Console에서 복사한 값 입력:

```env
# WebSocket 서버
VITE_WS_URL=http://localhost:3001

# Firebase 설정 (2단계에서 복사한 값)
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdefghijklmnop
```

---

## 6. Firestore 컬렉션 구조

채팅 앱은 다음과 같은 구조를 사용합니다:

```
messages (collection)
  └── {documentId} (auto-generated)
      ├── text: string (채팅 메시지, 최대 200자)
      └── createdAt: timestamp (생성 시간)
```

**자동 생성**: 첫 메시지를 보내면 자동으로 컬렉션이 생성됩니다.

---

## 7. 승인된 도메인 추가 (배포 후)

### 7-1. Authentication 설정
1. 좌측 메뉴에서 **"Authentication"** 클릭
2. **"설정"** 탭 → **"승인된 도메인"** 클릭

### 7-2. 도메인 추가
- **localhost** (기본으로 있음)
- **your-app.vercel.app** (Vercel 배포 후 추가)

---

## 8. 테스트

### 8-1. 로컬 테스트
```bash
cd client
npm run dev
```

브라우저에서 http://localhost:5173 접속하여 채팅 기능 테스트

### 8-2. Firestore 데이터 확인
Firebase Console → Firestore Database → `messages` 컬렉션에서 메시지 확인

---

## 9. 프로덕션 배포 시 주의사항

### 9-1. Vercel 환경변수 설정
Vercel 대시보드에서 동일한 Firebase 환경변수를 추가해야 합니다.

### 9-2. CORS 설정
- Firebase는 기본적으로 모든 도메인 허용
- 추가 CORS 설정 불필요

### 9-3. 보안 규칙 재확인
- 프로덕션 배포 전 보안 규칙 다시 확인
- 필요하면 rate limiting 추가 고려

---

## 📊 Firestore 사용량 (무료 Tier)

| 항목 | 무료 한도 |
|------|-----------|
| 저장 용량 | 1GB |
| 문서 읽기 | 50,000회/일 |
| 문서 쓰기 | 20,000회/일 |
| 문서 삭제 | 20,000회/일 |

**500개 메시지 제한**으로 무료 한도 내에서 충분히 사용 가능합니다.

---

## 🐛 트러블슈팅

### Firebase 연결 실패
- `.env.local` 파일이 올바른 위치(`client/`)에 있는지 확인
- 환경변수 이름이 `VITE_` prefix로 시작하는지 확인
- 개발 서버 재시작: `npm run dev`

### 메시지 전송 실패
- Firebase Console에서 보안 규칙 확인
- 브라우저 개발자 도구(F12) → Console에서 오류 확인

### 메시지가 안 보임
- Firestore Database가 생성되었는지 확인
- 네트워크 연결 확인

---

## ✅ 설정 완료 체크리스트

- [ ] Firebase 프로젝트 생성
- [ ] 웹 앱 등록
- [ ] Firestore Database 생성
- [ ] 보안 규칙 설정
- [ ] `.env.local` 파일 생성 및 설정
- [ ] 로컬 테스트 성공
- [ ] (배포 후) 승인된 도메인 추가

모든 항목을 완료하면 Firebase 채팅 기능이 정상적으로 작동합니다!
