import { Hono } from 'hono';
import { AuthService } from '../services/authService.js';

const auth = new Hono();

/**
 * POST /auth/login
 * Login with username and password, returns JWT token
 */
auth.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    const { username, password } = body;

    console.log('Login request received:', { username, hasPassword: !!password });

    // Validate input
    if (!username || !password) {
      console.log('Validation failed: missing username or password');
      return c.json({
        error: 'Validation Error',
        message: 'Username and password are required'
      }, 400);
    }

    // Create service instance
    const authService = new AuthService(c.env);

    // Authenticate user
    const user = await authService.authenticateUser(username, password);

    if (!user) {
      console.log('Authentication failed for user:', username);
      return c.json({
        error: 'Authentication Failed',
        message: 'Invalid username or password'
      }, 401);
    }

    // Generate JWT token
    const token = await authService.generateToken(user);

    console.log('Login successful for user:', username);
    return c.json({
      message: 'Login successful',
      token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name
      },
      expiresIn: '24h'
    });

  } catch (error) {
    console.error('Login error:', error);
    return c.json({
      error: 'Server Error',
      message: error.message || 'An error occurred during login'
    }, 500);
  }
});

export default auth;
