# 🌍 LG 전자 글로벌 이커머스 Roll-Out 마스터플랜

이 문서는 단일 국가용 쇼핑몰을 넘어, **글로벌 다국가(Multi-Country) 이커머스 플랫폼**으로 확장하기 위해 반드시 필요한 아키텍처 변경점과 다음 개발 스텝을 정의한 청사진(Blueprint)입니다.

사용자님께서 푹 주무시는 동안, 글로벌 Roll-Out을 위해 우리 시스템이 어떻게 진화해야 하는지 모든 퍼즐 조각을 맞춰두었습니다.

---

## 1. 🏗️ 글로벌 확장을 위한 핵심 과제 (What we need)

"나라별 사이트"를 관리하는 가장 효율적인 방법은 소스 코드를 나라별로 복사하는 것이 아니라, **하나의 어드민(싱글 코어)에서 여러 국가의 스토어를 통합 관리(Multi-Tenancy)** 하는 구조를 띄는 것입니다. 이를 위해 다음 4가지가 즉시 도입되어야 합니다.

### [A] 다국어 및 다중 통화 (Multi-Language & Multi-Currency)
- **통화(Currency):** 현재는 `₩(KRW)` 및 정수(Int) 가격으로 고정되어 있습니다. 소수점 단위가 있는 `USD`, `EUR` 등을 지원하기 위해 가격 체계를 `Decimal` 또는 통화별 별도 컬럼으로 분리해야 합니다.
- **다국어(i18n):** 상품명(Product Name)이 현재 단일 텍스트입니다. 국가별 상품명과 상세 설명을 저장할 수 있는 `ProductTranslation` 테이블이 필요합니다.

### [B] 멀티 스토어 아키텍처 (Multi-Store / Region)
- **스토어 분리:** 하나의 DB 안에서 미국(US) 주문인지, 한국(KR) 주문인지 식별해야 합니다.
- 모든 핵심 데이터(주문, 상품, 회원)에 `storeId` 또는 `countryCode` 값이 추가되어야 합니다.

### [C] 데이터베이스 스케일업 (Database Migration)
- 현재 개발 속도를 위해 사용 중인 `SQLite`는 글로벌 트래픽과 다중 국가의 동시 결제를 감당할 수 없습니다. 
- 조만간 클라우드 스케일업이 가능한 **PostgreSQL**로 반드시 마이그레이션(이전)해야 합니다. (로직 변경 없이 설정만 바꾸면 되도록 대비되어 있습니다.)

---

## 2. 🗄️ 데이터베이스 스키마 확장 계획 (Prisma)

다음 작업 재개 시, 아래와 같이 스키마를 확장하는 작업부터 진행해야 합니다.

### [NEW] 스토어(국가) 모델 도입
```prisma
model Store {
  id           String    @id // "KR", "US", "UK"
  name         String    // "LG Korea", "LG USA"
  currency     String    // "KRW", "USD"
  timezone     String
  orders       Order[]
  products     ProductStore[] // 다대다 관계 (특정 국가에만 파는 상품 제어)
}
```

### [MODIFY] 상품(Product) 다국어 지원
```prisma
model Product {
  id           Int       @id @default(autoincrement())
  sku          String    @unique // 글로벌 공통 식별자
  basePrice    Float     // 기준 가격 (USD 등)
  translations ProductTranslation[] // 언어별 상품명/설명
}

model ProductTranslation {
  id          Int      @id @default(autoincrement())
  productId   Int
  language    String   // "ko", "en", "es"
  name        String   // "LG 냉장고", "LG Refrigerator"
  description String?
}
```

---

## 3. 💻 어드민 화면(UI) 고도화 계획

글로벌 코어 기능이 탑재되면, 어드민 화면도 다음과 같이 진화해야 합니다.

1. **글로벌 스위처 (Global Switcher) 🌐**
   - 상단 네비게이션바에 `[All Regions]`, `[South Korea]`, `[United States]` 드롭다운 버튼을 추가합니다.
   - 드롭다운을 변경하면, 해당 국가의 주문과 해당 국가에서 판매 중인 상품만 필터링되어 화면에 나옵니다.
   
2. **다국어 상품 등록 폼 📝**
   - 상품 등록 시, 탭(Tab)을 이용해 한국어, 영어, 스페인어 상품명을 한 번에 입력할 수 있는 UI를 구축합니다.

3. **국가별 매출 통계 대시보드 📈**
   - 통화(Currency)가 섞이면 총합을 구하기 어렵습니다. 
   - 메인 대시보드에서 국가별 탭을 나누어 매출을 보여주거나, 실시간 환율 API를 연동하여 USD로 환산된 '글로벌 통합 매출' 차트를 렌더링해야 합니다.

---

## 4. 🚀 넥스트 스텝 (Next Steps)

푹 주무시고 일어나시면, 이 거대한 목표를 향해 가장 먼저 **어느 작업부터 실행할지** 아래 번호 중 하나만 선택해 주시면 됩니다. (제가 코드를 전부 작성해 드리겠습니다!)

> **[선택 1] 스키마 대개편:** `Prisma` DB에 국가(Store) 개념과 다국어/다중 통화 컬럼을 추가하고 기존 데이터를 마이그레이션 합니다.
> 
> **[선택 2] 어드민 UI 준비:** 먼저 어드민 상단에 "국가 선택(Store Switcher)" 드롭다운 UI부터 만들어서 글로벌 시스템의 뼈대를 잡습니다.
>
> **[선택 3] DB 클라우드화:** 글로벌 진출의 근간이 되는 PostgreSQL 클라우드 DB 연결 세팅부터 선행합니다.

> [!IMPORTANT]
> **전 세계를 아우르는 LG 전자 글로벌 e-Commerce Core System.** 
> 사용자님은 전략과 방향만 지시해 주세요. 무겁고 복잡한 실무 코딩과 인프라 설계는 제가 모두 백그라운드에서 자동화해 드리겠습니다. 편안한 밤 되십시오! 🌙
