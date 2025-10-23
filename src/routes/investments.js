import { Hono } from 'hono';
import { InvestmentService } from '../services/investmentService.js';

const investments = new Hono();

/**
 * GET /investments
 * 투자 상품 목록 조회
 * Query Parameters:
 *  - status: active | completed | cancelled
 *  - type: apartment | commercial | office
 */
investments.get('/', async (c) => {
  const investmentService = new InvestmentService(c.env);
  
  const filters = {};
  const status = c.req.query('status');
  const type = c.req.query('type');
  
  if (status) filters.status = status;
  if (type) filters.type = type;

  const investmentList = await investmentService.getAllInvestments(filters);

  return c.json({
    success: true,
    data: investmentList,
    count: investmentList.length
  });
});

/**
 * GET /investments/:id
 * 특정 투자 상품 상세 조회
 */
investments.get('/:id', async (c) => {
  const investmentId = c.req.param('id');
  const investmentService = new InvestmentService(c.env);

  const investment = await investmentService.getInvestmentById(investmentId);

  return c.json({
    success: true,
    data: investment
  });
});

/**
 * POST /investments
 * 새로운 투자 상품 생성 (관리자 전용)
 * 인증 필요
 */
investments.post('/', async (c) => {
  const investmentService = new InvestmentService(c.env);
  const body = await c.req.json();

  const newInvestment = await investmentService.createInvestment(body);

  return c.json({
    success: true,
    message: 'Investment created successfully',
    data: newInvestment
  }, 201);
});

/**
 * PUT /investments/:id
 * 투자 상품 정보 수정 (관리자 전용)
 * 인증 필요
 */
investments.put('/:id', async (c) => {
  const investmentId = c.req.param('id');
  const investmentService = new InvestmentService(c.env);
  const body = await c.req.json();

  const updatedInvestment = await investmentService.updateInvestment(investmentId, body);

  return c.json({
    success: true,
    message: 'Investment updated successfully',
    data: updatedInvestment
  });
});

/**
 * DELETE /investments/:id
 * 투자 상품 삭제 (관리자 전용)
 * 인증 필요
 */
investments.delete('/:id', async (c) => {
  const investmentId = c.req.param('id');
  const investmentService = new InvestmentService(c.env);

  const result = await investmentService.deleteInvestment(investmentId);

  return c.json({
    success: true,
    ...result
  });
});

/**
 * POST /investments/:id/monthly-interests
 * 투자 상품의 월별 이자 추가 (관리자 전용)
 * 인증 필요
 * Body: { month: "YYYY-MM", amount: number }
 */
investments.post('/:id/monthly-interests', async (c) => {
  const investmentId = c.req.param('id');
  const investmentService = new InvestmentService(c.env);
  const { month, amount } = await c.req.json();

  if (!month || !amount) {
    return c.json({
      success: false,
      message: 'Month and amount are required'
    }, 400);
  }

  const monthlyInterest = await investmentService.addMonthlyInterest(investmentId, month, amount);

  return c.json({
    success: true,
    message: 'Monthly interest added successfully',
    data: monthlyInterest
  }, 201);
});

export default investments;

