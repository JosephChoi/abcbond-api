import { Hono } from 'hono';
import { UserService } from '../services/userService.js';

const users = new Hono();

/**
 * GET /users
 * 모든 사용자 목록 조회 (관리자 전용)
 * 인증 필요
 */
users.get('/', async (c) => {
  const userService = new UserService(c.env);
  const userList = await userService.getUsers();
  
  return c.json({
    success: true,
    data: userList,
    count: userList.length
  });
});

/**
 * GET /users/profile
 * 현재 로그인한 사용자의 프로필 조회
 * 인증 필요
 */
users.get('/profile', async (c) => {
  const userId = c.get('userId');
  const userService = new UserService(c.env);
  const user = await userService.getUserById(userId);

  return c.json({
    success: true,
    data: user
  });
});

/**
 * PUT /users/profile
 * 현재 로그인한 사용자의 프로필 수정
 * 인증 필요
 */
users.put('/profile', async (c) => {
  const userId = c.get('userId');
  const userService = new UserService(c.env);
  const body = await c.req.json();

  const updatedUser = await userService.updateUser(userId, body);

  return c.json({
    success: true,
    message: 'Profile updated successfully',
    data: updatedUser
  });
});

/**
 * GET /users/:id
 * 특정 사용자 조회 (관리자 전용)
 * 인증 필요
 */
users.get('/:id', async (c) => {
  const targetUserId = c.req.param('id');
  const userService = new UserService(c.env);
  const user = await userService.getUserById(targetUserId);

  return c.json({
    success: true,
    data: user
  });
});

export default users;
