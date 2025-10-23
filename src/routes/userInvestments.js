import { Hono } from 'hono';
import { UserInvestmentService } from '../services/userInvestmentService.js';

const userInvestments = new Hono();

/**
 * GET /user-investments/my
 * 현재 로그인한 사용자의 투자 내역 조회
 * 인증 필요
 */
userInvestments.get('/my', async (c) => {
  const userId = c.get('userId');
  const userInvestmentService = new UserInvestmentService(c.env);

  const investments = await userInvestmentService.getUserInvestments(userId);

  return c.json({
    success: true,
    data: investments,
    count: investments.length
  });
});

/**
 * GET /user-investments/my/stats
 * 현재 로그인한 사용자의 투자 통계 조회
 * 인증 필요
 */
userInvestments.get('/my/stats', async (c) => {
  const userId = c.get('userId');
  const userInvestmentService = new UserInvestmentService(c.env);

  const stats = await userInvestmentService.getUserInvestmentStats(userId);

  return c.json({
    success: true,
    data: stats
  });
});

/**
 * GET /user-investments/:investmentId/investors
 * 특정 투자 상품에 투자한 사용자 목록 조회 (관리자 전용)
 * 인증 필요
 */
userInvestments.get('/:investmentId/investors', async (c) => {
  const investmentId = c.req.param('investmentId');
  const userInvestmentService = new UserInvestmentService(c.env);

  const investors = await userInvestmentService.getInvestmentInvestors(investmentId);

  return c.json({
    success: true,
    data: investors,
    count: investors.length
  });
});

/**
 * POST /user-investments
 * 새로운 투자 생성
 * 인증 필요
 * Body: { investment_id: number, invested_amount: number }
 */
userInvestments.post('/', async (c) => {
  const userId = c.get('userId');
  const userInvestmentService = new UserInvestmentService(c.env);
  const { investment_id, invested_amount } = await c.req.json();

  if (!investment_id || !invested_amount) {
    return c.json({
      success: false,
      message: 'investment_id and invested_amount are required'
    }, 400);
  }

  const result = await userInvestmentService.createUserInvestment(userId, investment_id, invested_amount);

  return c.json({
    success: true,
    message: 'Investment created successfully',
    data: result
  }, 201);
});

/**
 * PUT /user-investments/:investmentId
 * 투자 금액 수정
 * 인증 필요
 * Body: { invested_amount: number }
 */
userInvestments.put('/:investmentId', async (c) => {
  const userId = c.get('userId');
  const investmentId = c.req.param('investmentId');
  const userInvestmentService = new UserInvestmentService(c.env);
  const { invested_amount } = await c.req.json();

  if (!invested_amount) {
    return c.json({
      success: false,
      message: 'invested_amount is required'
    }, 400);
  }

  const result = await userInvestmentService.updateUserInvestment(userId, investmentId, invested_amount);

  return c.json({
    success: true,
    data: result
  });
});

/**
 * POST /user-investments/:investmentId/cancel
 * 투자 취소 (상태 변경)
 * 인증 필요
 */
userInvestments.post('/:investmentId/cancel', async (c) => {
  const userId = c.get('userId');
  const investmentId = c.req.param('investmentId');
  const userInvestmentService = new UserInvestmentService(c.env);

  const result = await userInvestmentService.cancelUserInvestment(userId, investmentId);

  return c.json({
    success: true,
    ...result
  });
});

/**
 * DELETE /user-investments/:investmentId
 * 투자 삭제
 * 인증 필요
 */
userInvestments.delete('/:investmentId', async (c) => {
  const userId = c.get('userId');
  const investmentId = c.req.param('investmentId');
  const userInvestmentService = new UserInvestmentService(c.env);

  const result = await userInvestmentService.deleteUserInvestment(userId, investmentId);

  return c.json({
    success: true,
    ...result
  });
});

export default userInvestments;

