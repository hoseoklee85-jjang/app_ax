const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: 고객용 주문 생성 (Checkout)
 *     description: 프론트엔드 장바구니에서 최종 결제 요청을 받아 새로운 주문을 생성합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customer:
 *                 type: string
 *                 example: "홍길동"
 *               customerEmail:
 *                 type: string
 *                 example: "hong@example.com"
 *               customerPhone:
 *                 type: string
 *                 example: "010-1234-5678"
 *               shippingAddress:
 *                 type: string
 *                 example: "서울시 강남구"
 *               paymentMethod:
 *                 type: string
 *                 example: "KAKAOPAY"
 *               notes:
 *                 type: string
 *                 example: "빠른 배송 부탁드립니다."
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: integer
 *                       example: 1
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *     responses:
 *       201:
 *         description: 주문 생성 성공
 *       400:
 *         description: 유효성 검사 실패 또는 재고 부족
 * 
 *   get:
 *     summary: 어드민용 주문 목록 조회
 *     description: 대시보드에서 주문 목록을 조회합니다.
 *     responses:
 *       200:
 *         description: 주문 목록
 */
router.get('/', orderController.getOrders);
router.post('/', orderController.createOrder);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: 특정 주문 상세 정보 조회
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 주문 상세 정보
 */
router.get('/:id', orderController.getOrderById);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   patch:
 *     summary: 주문 상태 변경
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: "SHIPPING"
 *     responses:
 *       200:
 *         description: 주문 상태 변경 성공
 */
router.patch('/:id/status', orderController.updateOrderStatus);
router.patch('/:id/items/:itemId/status', orderController.updateOrderItemStatus);

router.post('/seed', orderController.seedDummyOrders);

module.exports = router;
