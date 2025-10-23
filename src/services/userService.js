/**
 * User Service
 * 사용자 관련 비즈니스 로직을 처리하는 서비스
 */
export class UserService {
  constructor(env) {
    this.env = env;
  }

  /**
   * 모든 사용자 목록 조회 (관리자 전용)
   * @returns {Promise<Array>} 사용자 목록
   */
  async getUsers() {
    const { results } = await this.env.DB
      .prepare('SELECT id, username, name, email, phone, avatar, address, member_since, created_at FROM users')
      .all();

    return results;
  }

  /**
   * 특정 사용자 조회
   * @param {number} userId - 사용자 ID
   * @returns {Promise<Object>} 사용자 정보
   */
  async getUserById(userId) {
    const user = await this.env.DB
      .prepare('SELECT id, username, name, email, phone, avatar, address, member_since, newsletter, notifications, theme, created_at FROM users WHERE id = ?')
      .bind(userId)
      .first();

    if (!user) {
      const error = new Error('User not found');
      error.name = 'NotFoundError';
      throw error;
    }

    return user;
  }

  /**
   * 사용자 정보 업데이트
   * @param {number} userId - 사용자 ID
   * @param {Object} updateData - 업데이트할 데이터
   * @returns {Promise<Object>} 업데이트된 사용자 정보
   */
  async updateUser(userId, updateData) {
    const allowedFields = ['name', 'email', 'phone', 'avatar', 'address', 'newsletter', 'notifications', 'theme'];
    const updates = [];
    const params = [];

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updates.push(`${field} = ?`);
        params.push(updateData[field]);
      }
    }

    if (updates.length === 0) {
      const error = new Error('No fields to update');
      error.name = 'ValidationError';
      throw error;
    }

    updates.push('updated_at = datetime("now")');
    params.push(userId);

    await this.env.DB
      .prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`)
      .bind(...params)
      .run();

    return this.getUserById(userId);
  }

  /**
   * username으로 사용자 조회 (로그인용)
   * @param {string} username - 사용자명
   * @returns {Promise<Object|null>} 사용자 정보 (비밀번호 포함)
   */
  async getUserByUsername(username) {
    const user = await this.env.DB
      .prepare('SELECT * FROM users WHERE username = ?')
      .bind(username)
      .first();

    return user;
  }

  /**
   * 사용자 생성
   * @param {Object} userData - 사용자 데이터
   * @returns {Promise<Object>} 생성된 사용자
   */
  async createUser(userData) {
    const { username, password, name, email } = userData;

    if (!username || !password || !name || !email) {
      const error = new Error('Required fields are missing');
      error.name = 'ValidationError';
      throw error;
    }

    // 중복 체크
    const existingUser = await this.env.DB
      .prepare('SELECT id FROM users WHERE username = ? OR email = ?')
      .bind(username, email)
      .first();

    if (existingUser) {
      const error = new Error('Username or email already exists');
      error.name = 'ValidationError';
      throw error;
    }

    const result = await this.env.DB
      .prepare(`
        INSERT INTO users (username, password, name, email)
        VALUES (?, ?, ?, ?)
      `)
      .bind(username, password, name, email)
      .run();

    return this.getUserById(result.meta.last_row_id);
  }
}
