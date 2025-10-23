/**
 * Investment Service
 * 투자 상품 관련 비즈니스 로직을 처리하는 서비스
 */
export class InvestmentService {
  constructor(env) {
    this.env = env;
  }

  /**
   * 모든 투자 상품 목록 조회
   * @param {Object} filters - 필터 옵션 {status, type}
   * @returns {Promise<Array>} 투자 상품 목록
   */
  async getAllInvestments(filters = {}) {
    let query = 'SELECT * FROM investments';
    const conditions = [];
    const params = [];

    if (filters.status) {
      conditions.push('status = ?');
      params.push(filters.status);
    }

    if (filters.type) {
      conditions.push('type = ?');
      params.push(filters.type);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const { results } = await this.env.DB
      .prepare(query)
      .bind(...params)
      .all();

    // JSON 필드 파싱
    return results.map(investment => this._parseInvestmentJSON(investment));
  }

  /**
   * 특정 투자 상품 상세 조회
   * @param {number} investmentId - 투자 상품 ID
   * @returns {Promise<Object>} 투자 상품 상세 정보
   */
  async getInvestmentById(investmentId) {
    const investment = await this.env.DB
      .prepare('SELECT * FROM investments WHERE id = ?')
      .bind(investmentId)
      .first();

    if (!investment) {
      const error = new Error('Investment not found');
      error.name = 'NotFoundError';
      throw error;
    }

    // 월별 이자 수익 조회
    const { results: monthlyInterests } = await this.env.DB
      .prepare('SELECT month, amount FROM monthly_interests WHERE investment_id = ? ORDER BY month ASC')
      .bind(investmentId)
      .all();

    const parsedInvestment = this._parseInvestmentJSON(investment);
    parsedInvestment.monthlyInterest = monthlyInterests;

    return parsedInvestment;
  }

  /**
   * 새로운 투자 상품 생성 (관리자 전용)
   * @param {Object} investmentData - 투자 상품 데이터
   * @returns {Promise<Object>} 생성된 투자 상품
   */
  async createInvestment(investmentData) {
    const {
      name, location, address, total_amount, expected_return,
      start_date, end_date, image, status = 'active', type = 'apartment',
      description, property_value, kb_valuation, senior_loan, ltv,
      details, images, registration_document
    } = investmentData;

    // 필수 필드 검증
    if (!name || !location || !address || !total_amount || !expected_return || !start_date || !end_date) {
      const error = new Error('Required fields are missing');
      error.name = 'ValidationError';
      throw error;
    }

    const result = await this.env.DB
      .prepare(`
        INSERT INTO investments (
          name, location, address, total_amount, expected_return,
          start_date, end_date, image, status, type, description,
          property_value, kb_valuation, senior_loan, ltv,
          details, images, registration_document
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        name, location, address, total_amount, expected_return,
        start_date, end_date, image, status, type, description,
        property_value, kb_valuation, senior_loan, ltv,
        details ? JSON.stringify(details) : null,
        images ? JSON.stringify(images) : null,
        registration_document ? JSON.stringify(registration_document) : null
      )
      .run();

    return this.getInvestmentById(result.meta.last_row_id);
  }

  /**
   * 투자 상품 정보 수정 (관리자 전용)
   * @param {number} investmentId - 투자 상품 ID
   * @param {Object} updateData - 수정할 데이터
   * @returns {Promise<Object>} 수정된 투자 상품
   */
  async updateInvestment(investmentId, updateData) {
    // 투자 상품 존재 여부 확인
    await this.getInvestmentById(investmentId);

    const allowedFields = [
      'name', 'location', 'address', 'total_amount', 'expected_return',
      'start_date', 'end_date', 'image', 'status', 'type', 'description',
      'property_value', 'kb_valuation', 'senior_loan', 'ltv',
      'details', 'images', 'registration_document'
    ];

    const updates = [];
    const params = [];

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updates.push(`${field} = ?`);
        
        // JSON 필드는 문자열로 변환
        if (['details', 'images', 'registration_document'].includes(field) && updateData[field]) {
          params.push(JSON.stringify(updateData[field]));
        } else {
          params.push(updateData[field]);
        }
      }
    }

    if (updates.length === 0) {
      const error = new Error('No fields to update');
      error.name = 'ValidationError';
      throw error;
    }

    updates.push('updated_at = datetime("now")');
    params.push(investmentId);

    await this.env.DB
      .prepare(`UPDATE investments SET ${updates.join(', ')} WHERE id = ?`)
      .bind(...params)
      .run();

    return this.getInvestmentById(investmentId);
  }

  /**
   * 투자 상품 삭제 (관리자 전용)
   * @param {number} investmentId - 투자 상품 ID
   * @returns {Promise<Object>} 삭제 결과
   */
  async deleteInvestment(investmentId) {
    // 투자 상품 존재 여부 확인
    await this.getInvestmentById(investmentId);

    await this.env.DB
      .prepare('DELETE FROM investments WHERE id = ?')
      .bind(investmentId)
      .run();

    return { message: 'Investment deleted successfully' };
  }

  /**
   * 투자 상품의 월별 이자 수익 추가
   * @param {number} investmentId - 투자 상품 ID
   * @param {string} month - 월 (YYYY-MM)
   * @param {number} amount - 이자 금액
   * @returns {Promise<Object>} 추가된 월별 이자
   */
  async addMonthlyInterest(investmentId, month, amount) {
    // 투자 상품 존재 여부 확인
    await this.getInvestmentById(investmentId);

    // 월 형식 검증
    if (!/^\d{4}-\d{2}$/.test(month)) {
      const error = new Error('Invalid month format. Use YYYY-MM');
      error.name = 'ValidationError';
      throw error;
    }

    try {
      const result = await this.env.DB
        .prepare('INSERT INTO monthly_interests (investment_id, month, amount) VALUES (?, ?, ?)')
        .bind(investmentId, month, amount)
        .run();

      return {
        id: result.meta.last_row_id,
        investment_id: investmentId,
        month,
        amount
      };
    } catch (error) {
      if (error.message.includes('UNIQUE')) {
        const err = new Error('Monthly interest for this month already exists');
        err.name = 'ValidationError';
        throw err;
      }
      throw error;
    }
  }

  /**
   * JSON 필드 파싱 헬퍼 메서드
   * @private
   */
  _parseInvestmentJSON(investment) {
    const parsed = { ...investment };

    try {
      if (investment.details) {
        parsed.details = JSON.parse(investment.details);
      }
      if (investment.images) {
        parsed.images = JSON.parse(investment.images);
      }
      if (investment.registration_document) {
        parsed.registrationDocument = JSON.parse(investment.registration_document);
        delete parsed.registration_document;
      }
    } catch (error) {
      console.error('Error parsing JSON fields:', error);
    }

    return parsed;
  }
}

