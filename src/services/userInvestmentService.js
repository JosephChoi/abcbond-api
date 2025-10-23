/**
 * User Investment Service
 * 사용자 투자 내역 관련 비즈니스 로직을 처리하는 서비스
 */
export class UserInvestmentService {
  constructor(env) {
    this.env = env;
  }

  /**
   * 특정 사용자의 모든 투자 내역 조회
   * @param {number} userId - 사용자 ID
   * @returns {Promise<Array>} 사용자의 투자 내역 목록
   */
  async getUserInvestments(userId) {
    const { results } = await this.env.DB
      .prepare(`
        SELECT 
          ui.*,
          i.name,
          i.location,
          i.address,
          i.total_amount,
          i.expected_return,
          i.start_date,
          i.end_date,
          i.image,
          i.status,
          i.type
        FROM user_investments ui
        JOIN investments i ON ui.investment_id = i.id
        WHERE ui.user_id = ?
        ORDER BY ui.invested_date DESC
      `)
      .bind(userId)
      .all();

    return results;
  }

  /**
   * 특정 투자 상품에 투자한 사용자 목록 조회
   * @param {number} investmentId - 투자 상품 ID
   * @returns {Promise<Array>} 투자자 목록
   */
  async getInvestmentInvestors(investmentId) {
    const { results } = await this.env.DB
      .prepare(`
        SELECT 
          ui.user_id,
          ui.invested_amount,
          ui.invested_date,
          u.name,
          u.email
        FROM user_investments ui
        JOIN users u ON ui.user_id = u.id
        WHERE ui.investment_id = ?
        ORDER BY ui.invested_date DESC
      `)
      .bind(investmentId)
      .all();

    return results;
  }

  /**
   * 사용자의 투자 통계 조회
   * @param {number} userId - 사용자 ID
   * @returns {Promise<Object>} 투자 통계
   */
  async getUserInvestmentStats(userId) {
    // 총 투자 금액
    const totalInvestedResult = await this.env.DB
      .prepare(`
        SELECT COALESCE(SUM(invested_amount), 0) as total_invested
        FROM user_investments
        WHERE user_id = ? AND status = 'active'
      `)
      .bind(userId)
      .first();

    // 투자 상품 개수
    const countResult = await this.env.DB
      .prepare(`
        SELECT COUNT(*) as investment_count
        FROM user_investments
        WHERE user_id = ? AND status = 'active'
      `)
      .bind(userId)
      .first();

    // 예상 총 수익률 (가중 평균)
    const expectedReturnResult = await this.env.DB
      .prepare(`
        SELECT 
          SUM(ui.invested_amount * i.expected_return) / SUM(ui.invested_amount) as weighted_return
        FROM user_investments ui
        JOIN investments i ON ui.investment_id = i.id
        WHERE ui.user_id = ? AND ui.status = 'active'
      `)
      .bind(userId)
      .first();

    // 월별 예상 수익
    const monthlyIncomeResult = await this.env.DB
      .prepare(`
        SELECT 
          SUM(ui.invested_amount * i.expected_return / 100 / 12) as monthly_income
        FROM user_investments ui
        JOIN investments i ON ui.investment_id = i.id
        WHERE ui.user_id = ? AND ui.status = 'active'
      `)
      .bind(userId)
      .first();

    return {
      totalInvested: totalInvestedResult.total_invested || 0,
      investmentCount: countResult.investment_count || 0,
      expectedReturn: expectedReturnResult.weighted_return || 0,
      monthlyIncome: Math.round(monthlyIncomeResult.monthly_income || 0)
    };
  }

  /**
   * 새로운 투자 생성
   * @param {number} userId - 사용자 ID
   * @param {number} investmentId - 투자 상품 ID
   * @param {number} investedAmount - 투자 금액
   * @returns {Promise<Object>} 생성된 투자 내역
   */
  async createUserInvestment(userId, investmentId, investedAmount) {
    // 투자 금액 검증
    if (!investedAmount || investedAmount <= 0) {
      const error = new Error('Invalid investment amount');
      error.name = 'ValidationError';
      throw error;
    }

    // 투자 상품 존재 여부 확인
    const investment = await this.env.DB
      .prepare('SELECT id, status FROM investments WHERE id = ?')
      .bind(investmentId)
      .first();

    if (!investment) {
      const error = new Error('Investment not found');
      error.name = 'NotFoundError';
      throw error;
    }

    if (investment.status !== 'active') {
      const error = new Error('Investment is not active');
      error.name = 'ValidationError';
      throw error;
    }

    // 이미 투자했는지 확인
    const existing = await this.env.DB
      .prepare('SELECT id FROM user_investments WHERE user_id = ? AND investment_id = ?')
      .bind(userId, investmentId)
      .first();

    if (existing) {
      const error = new Error('Already invested in this investment');
      error.name = 'ValidationError';
      throw error;
    }

    const result = await this.env.DB
      .prepare(`
        INSERT INTO user_investments (user_id, investment_id, invested_amount)
        VALUES (?, ?, ?)
      `)
      .bind(userId, investmentId, investedAmount)
      .run();

    return {
      id: result.meta.last_row_id,
      user_id: userId,
      investment_id: investmentId,
      invested_amount: investedAmount,
      status: 'active'
    };
  }

  /**
   * 투자 금액 수정
   * @param {number} userId - 사용자 ID
   * @param {number} investmentId - 투자 상품 ID
   * @param {number} investedAmount - 새로운 투자 금액
   * @returns {Promise<Object>} 수정된 투자 내역
   */
  async updateUserInvestment(userId, investmentId, investedAmount) {
    // 투자 금액 검증
    if (!investedAmount || investedAmount <= 0) {
      const error = new Error('Invalid investment amount');
      error.name = 'ValidationError';
      throw error;
    }

    // 투자 내역 존재 여부 확인
    const existing = await this.env.DB
      .prepare('SELECT id FROM user_investments WHERE user_id = ? AND investment_id = ?')
      .bind(userId, investmentId)
      .first();

    if (!existing) {
      const error = new Error('User investment not found');
      error.name = 'NotFoundError';
      throw error;
    }

    await this.env.DB
      .prepare(`
        UPDATE user_investments 
        SET invested_amount = ?, updated_at = datetime('now')
        WHERE user_id = ? AND investment_id = ?
      `)
      .bind(investedAmount, userId, investmentId)
      .run();

    return {
      user_id: userId,
      investment_id: investmentId,
      invested_amount: investedAmount,
      message: 'Investment amount updated successfully'
    };
  }

  /**
   * 투자 취소 (상태 변경)
   * @param {number} userId - 사용자 ID
   * @param {number} investmentId - 투자 상품 ID
   * @returns {Promise<Object>} 취소 결과
   */
  async cancelUserInvestment(userId, investmentId) {
    // 투자 내역 존재 여부 확인
    const existing = await this.env.DB
      .prepare('SELECT id, status FROM user_investments WHERE user_id = ? AND investment_id = ?')
      .bind(userId, investmentId)
      .first();

    if (!existing) {
      const error = new Error('User investment not found');
      error.name = 'NotFoundError';
      throw error;
    }

    if (existing.status === 'cancelled') {
      const error = new Error('Investment already cancelled');
      error.name = 'ValidationError';
      throw error;
    }

    await this.env.DB
      .prepare(`
        UPDATE user_investments 
        SET status = 'cancelled', updated_at = datetime('now')
        WHERE user_id = ? AND investment_id = ?
      `)
      .bind(userId, investmentId)
      .run();

    return {
      message: 'Investment cancelled successfully'
    };
  }

  /**
   * 투자 삭제
   * @param {number} userId - 사용자 ID
   * @param {number} investmentId - 투자 상품 ID
   * @returns {Promise<Object>} 삭제 결과
   */
  async deleteUserInvestment(userId, investmentId) {
    // 투자 내역 존재 여부 확인
    const existing = await this.env.DB
      .prepare('SELECT id FROM user_investments WHERE user_id = ? AND investment_id = ?')
      .bind(userId, investmentId)
      .first();

    if (!existing) {
      const error = new Error('User investment not found');
      error.name = 'NotFoundError';
      throw error;
    }

    await this.env.DB
      .prepare('DELETE FROM user_investments WHERE user_id = ? AND investment_id = ?')
      .bind(userId, investmentId)
      .run();

    return {
      message: 'User investment deleted successfully'
    };
  }
}

