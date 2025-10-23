import { SignJWT } from 'jose';
import { UserService } from './userService.js';

/**
 * Authentication Service
 * 로그인 및 토큰 생성을 처리하는 서비스
 */
export class AuthService {
  constructor(env) {
    this.env = env;
  }

  /**
   * 사용자 인증 (username과 password로 로그인)
   * @param {string} username - 사용자명
   * @param {string} password - 비밀번호
   * @returns {Promise<Object|null>} 인증된 사용자 정보 또는 null
   */
  async authenticateUser(username, password) {
    const userService = new UserService(this.env);
    const user = await userService.getUserByUsername(username);

    if (!user || user.password !== password) {
      return null;
    }

    // 비밀번호를 제외한 사용자 정보 반환
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * JWT 토큰 생성
   * 토큰은 24시간 후 만료됨
   * @param {Object} user - 사용자 정보
   * @returns {Promise<string>} JWT 토큰
   */
  async generateToken(user) {
    const encoder = new TextEncoder();
    const secret = this.env.JWT_SECRET;

    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }

    const token = await new SignJWT({
      userId: user.id.toString(),
      username: user.username,
      email: user.email,
      name: user.name
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(user.id.toString())
      .setIssuedAt()
      .setExpirationTime('24h') // 24시간 만료
      .sign(encoder.encode(secret));

    return token;
  }
}
