# 🛍️ 이커머스 어드민 페이지 (E-Commerce Admin)

본 프로젝트는 쇼핑몰 관리자(Admin)를 위한 상품, 주문, 회원 등을 관리하는 백오피스 웹 애플리케이션입니다. 
빠른 개발과 쾌적한 로컬 테스트 환경을 위해 아래와 같은 모던 웹 스택을 채택하여 설계되었습니다.

---

## 🌟 주요 고도화 기능 (Key Features)

### 🎨 1. 마젠토(Magento) 스타일의 모던 UI/UX
- **Light Theme:** 어둡고 칙칙한 테마에서 벗어나, 가독성이 뛰어난 모던 화이트/라이트 그레이 테마를 글로벌 적용했습니다.
- **주문 상세 레이아웃:** 어드민의 표준인 마젠토 2(Magento 2)의 3단 블록 레이아웃(주문/고객 정보, 배송지, 결제 수단)을 도입하여 실무 친화적인 화면을 구성했습니다.

### 📊 2. 강력한 데이터 필터링 & 검색
- **상태별 탭 (Status Tabs):** 전체 보기, 결제완료, 배송중, 배송완료, 취소, 반품 등 탭 하나로 빠르게 분류합니다.
- **다이나믹 텍스트 검색:** 고객명 또는 주문번호로 실시간 검색이 가능합니다.
- **날짜 필터링 (Date Picker):** `react-datepicker`를 도입하여 원하는 기간의 데이터만 정밀하게 조회합니다.

### 🚀 3. 대용량 트래픽 대비 최적화
- **페이지네이션 (Pagination):** 수만 건의 데이터가 쌓여도 브라우저가 버벅이지 않도록 백엔드(Prisma `skip`/`take`)와 프론트엔드 연동 페이징 컨트롤을 구현했습니다.

### 📄 4. 실무 필수 기능
- **엑셀 다운로드 (Export CSV):** 버튼 클릭 한 번에 현재 필터링된 화면의 모든 주문 데이터를 `.csv` 포맷으로 다운로드합니다.

### 🤖 5. 개발자 편의성 및 API 확장성
- **Swagger UI (`/api-docs`):** 프론트엔드 연동 전, 또는 외부 서비스(Postman 등) 테스트를 위해 완벽한 API 명세서와 테스트 화면을 내장했습니다.
- **AI Agent 연동:** 시스템 우측 하단에 AI 비서 기능(Agent Chat)을 연동하여 시스템 관리를 돕습니다.
- **안전한 트랜잭션:** 주문 생성 시 실제 가격을 서버에서 재계산하고 재고를 차감하는 실무 수준의 무결성 검증을 마쳤습니다.

---

## 🏗️ 시스템 아키텍처 및 프레임워크 설계

본 프로젝트는 프론트엔드(화면)와 백엔드(서버/DB)가 철저히 분리된 **SPA(Single Page Application)** 구조를 따릅니다.

### 1. 프론트엔드 (Frontend) - `최상단 폴더 (/)`
* **프레임워크:** `React` + `Vite` + `TypeScript`
* **선택 이유:** 
  * 표, 차트, 폼 등 복잡한 데이터 상태 관리를 위해 가장 강력한 생태계를 가진 **React** 채택.
  * 기존 Webpack 대비 압도적으로 빠른 **Vite** 빌드 도구 사용.

### 2. 백엔드 API 서버 (Backend) - `server/ 폴더`
* **프레임워크:** `Node.js` + `Express.js`
* **선택 이유:** 프론트엔드와 동일한 언어(JavaScript)를 사용하여 개발 이질감을 없애고, 가장 직관적인 Express로 Restful API를 빠르게 구축합니다.

### 3. 데이터베이스 및 ORM (DB & ORM) - `server/prisma/ 폴더`
* **데이터베이스:** `Neon PostgreSQL` (클라우드 환경 원격 DB)
  * 로컬 환경에 무거운 DB를 설치할 필요 없이 클라우드 원격 DB를 연결하여 어디서든 일관된 개발 및 실서버 배포가 가능하도록 구성되어 있습니다.
  * 기존 Java Spring Boot 백엔드와 **동일한 `public` 스키마 공간을 공유**하여, 운영 DB를 즉각적으로 조회하고 제어합니다.
* **ORM:** `Prisma`
  * 최신 TypeScript 기반의 SQL 빌더 도구로, 직관적인 객체 지향 형태로 관계형 데이터베이스를 매우 쉽게 조작할 수 있습니다.

---

## 🚀 로컬 환경에서 원격 클라우드 DB 연동 방법

본 프로젝트는 로컬 PC에서 개발 및 테스트를 진행할 때에도, 운영 서버와 동일한 **원격 PostgreSQL 클라우드 DB(Neon)** 에 연결하여 실시간 데이터를 사용합니다.

### 1단계: DB 환경 변수 설정
`server` 폴더 내에 `.env` 파일을 생성하거나 열어 다음과 같이 Neon DB 연결 문자열을 작성합니다.
```env
# server/.env 파일
DATABASE_URL="postgresql://neondb_owner:k2iN3PscvKjD@ep-twilight-waterfall-a1z22iq2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
```
> **주의**: 비밀번호 및 접속 정보가 유출되지 않도록 실제 운영 시에는 `.env` 파일을 절대 깃허브(Git)에 커밋하지 않아야 합니다!

### 2단계: 최신 데이터베이스 스키마 동기화 (Prisma)
DB 구조(테이블, 컬럼 등)가 변경되었거나, 최초로 다운로드를 받아 실행할 때, 내 로컬 코드가 원격 DB 구조를 정확히 인지하도록 `prisma db push` 명령어를 실행해야 합니다.

```bash
cd server
npx prisma generate  # Prisma Client(자바스크립트용 DB 연결 객체) 최신화
npx prisma db push   # 작성된 schema.prisma 구조를 원격 DB와 동기화
```

### 3단계: 외부 툴(DBeaver, pgAdmin 등)로 직접 접속하기
로컬 터미널이나 서버 코드 외에, 시각적인 DB 관리 도구를 통해 원격 DB에 붙어 직접 SQL을 실행하거나 데이터를 볼 수 있습니다.

**[접속 정보 가이드]**
* **Host (호스트 주소):** `ep-twilight-waterfall-a1z22iq2.ap-southeast-1.aws.neon.tech`
* **Port (포트):** `5432`
* **Database (데이터베이스명):** `neondb`
* **Username (사용자명):** `neondb_owner`
* **Password (비밀번호):** `k2iN3PscvKjD` 
* **SSL (보안 옵션):** `Require (필수)`로 체크

---

## 🚀 로컬 개발 환경 실행 방법

프로젝트를 로컬에서 구동하기 위해서는 프론트엔드와 백엔드 서버를 각각 실행해야 합니다.
*(주의: `npm install` 명령어는 프로젝트를 처음 다운로드 받았을 때나 새로운 라이브러리가 추가되었을 때 **최초 1회만** 실행하시면 됩니다.)*

### 1단계: 백엔드 서버 실행
```bash
cd server
npm install   # 최초 1회만
npm run dev
```
*(성공 시 `Server is running on http://localhost:3000` 출력)*

### 2단계: 프론트엔드 서버 실행 (새 터미널 창)
```bash
# 프로젝트 루트 폴더(최상단)에서 실행
npm install   # 최초 1회만
npm run dev
```
*(성공 시 브라우저에서 `http://localhost:5173` 접속)*

---

## 🛠️ 주요 테스트 도구

### 1. Swagger API 명세서
백엔드 서버가 실행된 상태에서 브라우저로 아래 주소에 접속하여 API를 직관적으로 테스트하세요.
* 🔗 **주소:** `http://localhost:3000/api-docs`

### 2. 데이터베이스 관리 도구 (Prisma Studio)
DB에 저장된 실제 데이터를 엑셀처럼 시각적으로 보고 직접 수정하고 싶을 때 사용합니다. 원격 DB의 내용도 즉시 반영됩니다.
```bash
cd server
npx prisma studio
```
*(명령어 실행 후 `http://localhost:5555` 로 접속)*
