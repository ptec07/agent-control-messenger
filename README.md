# Agent Control Messenger

운영자 관제 UI가 있는 최소 기능 메신저/승인 시스템 프로토타입.

## 현재 배포 상태

### 운영 프론트엔드
- Vercel: `https://agent-control-messenger-frontend.vercel.app`
- 직접 진입 확인 완료:
  - `/threads`
  - `/threads/:id`
  - `/approval-requests`

### 운영 백엔드
- Render: `https://agent-control-messenger-backend-git.onrender.com`
- health check: `/health`
- 현재 프론트는 위 Render 백엔드를 사용한다.

### 데모 데이터
운영/공개 환경에서는 `demo/bootstrap` 같은 상태 변경 엔드포인트를 외부에 그대로 노출하지 않는 것을 권장한다.

로컬 개발 환경에서 데모 데이터를 넣으려면:

```bash
curl -X POST http://127.0.0.1:8000/demo/bootstrap
```

현재 확인된 데모 화면:
- `/threads`
- `/threads/<thread_id>`
- `/approval-requests`

> 현재 백엔드는 `InMemoryStore` 기반이므로 재배포/재시작 시 상태가 초기화된다.

## 실행 방법

### 1) 백엔드
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
PYTHONPATH=. python -m app
```

기본 주소: `http://127.0.0.1:8000`

#### 백엔드 배포 준비 파일
- `backend/Dockerfile`
- `backend/Procfile`
- `backend/render.yaml`
- `render.yaml` (repo 루트 Render blueprint)

#### 백엔드 배포 메모
- 현재 운영 백엔드는 Render Git-backed 서비스 `agent-control-messenger-backend-git` 이다.
- 운영 URL: `https://agent-control-messenger-backend-git.onrender.com`
- health check 경로는 `/health`
- 공개 프론트 주소를 `ACM_FRONTEND_ORIGIN` 환경 변수로 넣어야 한다.

#### 일반 Docker 실행 예시
```bash
cd backend
docker build -t agent-control-messenger-backend .
docker run --rm -p 8000:8000 \
  -e ACM_FRONTEND_ORIGIN=https://your-frontend.vercel.app \
  -e PORT=8000 \
  agent-control-messenger-backend
```

> 현재 저장소는 `InMemoryStore`를 사용하므로 재시작/스케일아웃 시 상태가 유지되지 않는다. 배포는 가능하지만 운영용으로는 DB 기반 저장소로 바꾸는 것이 다음 단계다.

### 2) 프론트엔드
```bash
cd frontend
npm install
npm run dev
```

기본 주소: `http://127.0.0.1:5173`

프론트 dev 서버는 `/api/*` 요청을 백엔드로 프록시한다. 그래서 `/threads`, `/approval-requests`, `/threads/:id` 같은 SPA 경로를 브라우저에 직접 열어도 프론트 라우팅과 API 경로가 충돌하지 않는다.

### Vercel 프론트 + 별도 백엔드 배포
이 프로젝트는 **프론트만 Vercel**, **백엔드는 별도 호스팅(Render/Railway/Fly.io/VPS 등)** 구조를 권장한다.

#### 현재 운영 URL
- 프론트: `https://agent-control-messenger-frontend.vercel.app`
- 백엔드: `https://agent-control-messenger-backend-git.onrender.com`

#### 프론트(Vercel)
- 배포 루트: `frontend/`
- Vercel 설정 파일: `frontend/vercel.json`
- SPA 직접 진입(`/threads`, `/approval-requests`, `/threads/:id`)을 위해 route별 rewrite와 fallback build(`dist/404.html`)를 함께 사용한다.

#### Vercel 환경 변수
Vercel 프로젝트에 아래 환경 변수를 넣으면 된다.

```bash
VITE_API_BASE_URL=https://<your-backend-host>
VITE_WS_URL=wss://<your-backend-host-without-path>
```

예:
```bash
VITE_API_BASE_URL=https://acm-backend.example.com
VITE_WS_URL=wss://acm-backend.example.com
```

프론트 코드는 자동으로 아래처럼 붙는다.
- thread list → `https://<backend>/threads`
- approval queue → `https://<backend>/approval-requests`
- websocket → `wss://<backend>/ws`

#### Vercel CLI 배포 예시
```bash
cd frontend
npx vercel
# 또는
npx vercel --prod
```

#### 백엔드
백엔드는 WebSocket + 메모리 상태를 사용하므로 Vercel serverless보다 장기 실행 가능한 호스팅이 적합하다.

### 3) 데모 데이터 넣기
```bash
curl -X POST http://127.0.0.1:8000/demo/bootstrap
```

그러면 다음 화면을 바로 볼 수 있다.
- `/threads`
- `/threads/<thread_id>`
- `/approval-requests`

## 테스트

### 백엔드
```bash
source /home/ptec07/.hermes/hermes-agent/venv/bin/activate
python -m pytest backend/tests -q
```

### 프론트엔드
```bash
cd frontend
npm test -- --run tests/App.test.tsx tests/StatusStates.test.tsx tests/ThreadListContainer.test.tsx tests/ApprovalQueueContainer.test.tsx tests/ThreadListView.test.tsx tests/ApprovalQueueView.test.tsx tests/ThreadDetailContainer.test.tsx tests/ApprovalCard.test.tsx tests/ThreadDetailView.test.tsx tests/ws.test.ts
```

### 프론트 빌드
```bash
cd frontend
npm run build
```
