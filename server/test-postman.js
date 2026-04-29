const http = require('http');

async function testCustomerOrder() {
  console.log("🚀 [Postman Simulator] 테스트를 시작합니다...\n");

  try {
    // 1. 먼저 DB에 있는 진짜 상품(Product) 정보를 하나 가져옵니다.
    console.log("📦 1. 등록된 상품 목록을 불러옵니다...");
    const productsRes = await fetch('http://localhost:3000/api/products');
    const products = await productsRes.json();

    if (!products || products.length === 0) {
      console.log("❌ 등록된 상품이 없습니다. 먼저 어드민 페이지에서 상품을 등록하거나 Fake Order를 한 번 생성해주세요.");
      return;
    }

    // 첫 번째 상품을 고릅니다.
    const targetProduct = products[0];
    console.log(`   -> 선택된 상품: [ID: ${targetProduct.id}] ${targetProduct.name} (가격: ${targetProduct.price}원, 남은 재고: ${targetProduct.stock}개)`);

    // 2. 가상의 고객 장바구니 데이터를 만듭니다. (Postman의 Body 영역과 동일)
    const orderPayload = {
      customer: "포스트맨 테스터",
      customerEmail: "tester@postman.com",
      customerPhone: "010-1234-5678",
      shippingAddress: "서울특별시 강남구 해커톤빌딩 7층",
      paymentMethod: "NAVERPAY",
      notes: "Postman 시뮬레이터로 보낸 테스트 주문입니다!",
      items: [
        {
          productId: targetProduct.id,
          quantity: 2 // 2개 구매
        }
      ]
    };

    console.log("\n✉️ 2. 다음 데이터를 POST /api/orders 로 전송합니다:");
    console.log(JSON.stringify(orderPayload, null, 2));

    // 3. 실제 주문 API 호출
    console.log("\n⏳ 3. 주문 생성 API 호출 중...");
    const orderRes = await fetch('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderPayload)
    });

    const orderData = await orderRes.json();

    if (orderRes.ok) {
      console.log("\n✅ [성공] API 응답 결과:");
      console.log(JSON.stringify(orderData, null, 2));
      console.log(`\n🎉 주문 성공! 총 결제금액이 서버에서 안전하게 재계산되어 [${orderData.total}원]으로 저장되었습니다.`);
      console.log(`상태는 [${orderData.status}]로 시작합니다.`);
    } else {
      console.log("\n❌ [실패] API 응답 에러:");
      console.log(orderData);
    }

  } catch (err) {
    console.error("❌ 요청 중 오류 발생:", err.message);
  }
}

testCustomerOrder();
