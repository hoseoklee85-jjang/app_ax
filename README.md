# 🛍️ 이커머스 어드민 페이지 (E-Commerce Admin)

본 프로젝트는 쇼핑몰 관리자(Admin)를 위한 상품, 주문, 회원 등을 관리하는 백오피스 웹 애플리케이션입니다. 
빠른 개발과 쾌적한 로컬 테스트 환경을 위해 아래와 같은 모던 웹 스택을 채택하여 설계되었습니다.

---

## 🏗️ 시스템 아키텍처 및 프레임워크 설계

본 프로젝트는 프론트엔드(화면)와 백엔드(서버/DB)가 철저히 분리된 **SPA(Single Page Application)** 구조를 따릅니다.

### 1. 프론트엔드 (Frontend) - `최상단 폴더 (/)`
* **프레임워크:** `React` + `Vite` + `TypeScript`
* **선택 이유:** 
  * 어드민 페이지 특성상 표, 차트, 폼 등 복잡한 데이터 상태 관리가 필수적이므로 전 세계에서 가장 생태계가 큰 **React**를 사용합니다.
  * 기존 Webpack 대비 구동 속도가 압도적으로 빠른 **Vite**를 사용하여 개발 생산성을 극대화했습니다.
  * **TypeScript**를 통해 런타임 에러를 사전에 방지합니다.
* **구동 방식:** `npm run dev` (기본 포트: 5173)

### 2. 백엔드 API 서버 (Backend) - `server/ 폴더`
* **프레임워크:** `Node.js` + `Express.js`
* **선택 이유:** 
  * 프론트엔드와 동일한 언어(JavaScript)를 사용하여 개발 이질감을 줄입니다.
  * 무거운 프레임워크 대신 가장 가볍고 직관적인 **Express**를 사용하여 필요한 API(예: `/api/products`)만 빠르게 구축합니다.
* **구동 방식:** `npm run dev` (기본 포트: 3000)

### 3. 데이터베이스 및 ORM (DB & ORM) - `server/prisma/ 폴더`
* **데이터베이스:** `SQLite`
  * **선택 이유:** 로컬 테스트 시 MySQL이나 Oracle 같은 복잡한 DB 서버 설치 없이, 단일 파일(`dev.db`) 형태로 데이터를 완벽하게 보존하고 관리할 수 있습니다. 
* **ORM:** `Prisma`
  * **선택 이유:** SQL 쿼리문을 직접 작성하지 않고 JavaScript 코드로 DB를 조작할 수 있게 해주는 최신 도구입니다. 
  * 추후 실제 라이브 서버로 배포할 때, 코드 수정 없이 설정 주소만 변경하면 바로 PostgreSQL이나 MySQL로 전환(Migration)이 가능한 뛰어난 확장성을 가집니다.

---

## 🚀 로컬 개발 환경 실행 방법

프로젝트를 로컬에서 구동하기 위해서는 프론트엔드와 백엔드 서버를 각각 실행해야 합니다.

### 1단계: 백엔드 서버 실행
```bash
cd server
npm install
npm run dev
```
*(성공 시 `Server is running on http://localhost:3000` 메시지 출력)*

### 2단계: 프론트엔드 서버 실행 (새 터미널 창)
```bash
# 프로젝트 루트 폴더(최상단)에서 실행
npm install
npm run dev
```
*(성공 시 브라우저에서 `http://localhost:5173` 자동 오픈)*

---

## 🗄️ 데이터베이스 관리 도구 (Prisma Studio)
DB에 저장된 실제 데이터를 엑셀처럼 시각적으로 보고 수정하고 싶을 때 사용합니다.
```bash
cd server
npx prisma studio
```
*(명령어 실행 후 `http://localhost:5555` 로 접속)*
