export default {
  openapi: '3.0.0',
  info: {
    title: 'ABC Bond API',
    version: '1.0.0',
    description: '부동산 투자 플랫폼 ABC Bond의 백엔드 API - Cloudflare Workers + Hono + D1'
  },
  servers: [
    {
      url: 'https://abcbon-api.workers.dev',
      description: 'Production server'
    },
    {
      url: 'http://localhost:8787',
      description: 'Development server'
    }
  ],
  tags: [
    { name: 'System', description: '시스템 정보 및 헬스체크' },
    { name: 'Authentication', description: '인증 및 로그인' },
    { name: 'Users', description: '사용자 관리' },
    { name: 'Investments', description: '투자 상품 관리' },
    { name: 'User Investments', description: '사용자 투자 내역 관리' }
  ],
  paths: {
    '/': {
      get: {
        summary: 'API 정보',
        tags: ['System'],
        responses: {
          '200': {
            description: 'API 정보 및 엔드포인트 목록',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'ABC Bond API - 부동산 투자 플랫폼' },
                    version: { type: 'string', example: '1.0.0' },
                    environment: { type: 'string', example: 'development' },
                    timestamp: { type: 'string', format: 'date-time' },
                    endpoints: {
                      type: 'object',
                      properties: {
                        docs: { type: 'string', example: '/docs' },
                        health: { type: 'string', example: '/health' },
                        auth: { type: 'string', example: '/auth' },
                        users: { type: 'string', example: '/users' },
                        investments: { type: 'string', example: '/investments' },
                        userInvestments: { type: 'string', example: '/user-investments' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/health': {
      get: {
        summary: '헬스체크',
        tags: ['System'],
        responses: {
          '200': {
            description: '서비스 정상 작동',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'healthy' },
                    timestamp: { type: 'string', format: 'date-time' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/auth/login': {
      post: {
        summary: '로그인',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'password'],
                properties: {
                  username: { type: 'string', example: 'user1' },
                  password: { type: 'string', example: '1234' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: '로그인 성공',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    token: { type: 'string', description: 'JWT 토큰' },
                    user: {
                      type: 'object',
                      properties: {
                        id: { type: 'number', example: 1 },
                        username: { type: 'string', example: 'user1' },
                        name: { type: 'string', example: '김투자' },
                        email: { type: 'string', format: 'email', example: 'user1@example.com' }
                      }
                    }
                  }
                }
              }
            }
          },
          '401': {
            description: '인증 실패',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    message: { type: 'string', example: 'Invalid credentials' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/users': {
      get: {
        summary: '사용자 목록 조회 (관리자)',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: '사용자 목록',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'number' },
                          username: { type: 'string' },
                          name: { type: 'string' },
                          email: { type: 'string' }
                        }
                      }
                    },
                    count: { type: 'number', example: 3 }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/users/profile': {
      get: {
        summary: '내 프로필 조회',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: '프로필 정보',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        id: { type: 'number' },
                        username: { type: 'string' },
                        name: { type: 'string' },
                        email: { type: 'string' },
                        phone: { type: 'string' },
                        avatar: { type: 'string' },
                        address: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      put: {
        summary: '내 프로필 수정',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  phone: { type: 'string' },
                  address: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: '프로필 수정 성공',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string' },
                    data: { type: 'object' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/investments': {
      get: {
        summary: '투자 상품 목록 조회',
        tags: ['Investments'],
        parameters: [
          {
            in: 'query',
            name: 'status',
            schema: { type: 'string', enum: ['active', 'completed', 'cancelled'] },
            description: '상태 필터'
          },
          {
            in: 'query',
            name: 'type',
            schema: { type: 'string', enum: ['apartment', 'commercial', 'office'] },
            description: '유형 필터'
          }
        ],
        responses: {
          '200': {
            description: '투자 상품 목록',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'number', example: 1 },
                          name: { type: 'string', example: '강남 래미안 퍼스티지' },
                          location: { type: 'string', example: '서울 강남구 대치동' },
                          total_amount: { type: 'number', example: 15000000000 },
                          expected_return: { type: 'number', example: 8.5 },
                          start_date: { type: 'string', example: '2024-01-15' },
                          end_date: { type: 'string', example: '2026-01-15' },
                          status: { type: 'string', example: 'active' },
                          type: { type: 'string', example: 'apartment' }
                        }
                      }
                    },
                    count: { type: 'number', example: 6 }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        summary: '투자 상품 생성 (관리자)',
        tags: ['Investments'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'location', 'address', 'total_amount', 'expected_return', 'start_date', 'end_date'],
                properties: {
                  name: { type: 'string' },
                  location: { type: 'string' },
                  address: { type: 'string' },
                  total_amount: { type: 'number' },
                  expected_return: { type: 'number' },
                  start_date: { type: 'string', format: 'date' },
                  end_date: { type: 'string', format: 'date' },
                  description: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: '투자 상품 생성 성공',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string' },
                    data: { type: 'object' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/investments/{id}': {
      get: {
        summary: '투자 상품 상세 조회',
        tags: ['Investments'],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'integer' },
            description: '투자 상품 ID'
          }
        ],
        responses: {
          '200': {
            description: '투자 상품 상세 정보',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        id: { type: 'number' },
                        name: { type: 'string' },
                        location: { type: 'string' },
                        address: { type: 'string' },
                        description: { type: 'string' },
                        total_amount: { type: 'number' },
                        expected_return: { type: 'number' },
                        property_value: { type: 'number' },
                        kb_valuation: { type: 'number' },
                        monthlyInterest: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              month: { type: 'string', example: '2024-10' },
                              amount: { type: 'number', example: 350000 }
                            }
                          }
                        },
                        details: { type: 'object' },
                        images: { type: 'array', items: { type: 'string' } }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/user-investments/my': {
      get: {
        summary: '내 투자 내역 조회',
        tags: ['User Investments'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: '투자 내역 목록',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'number' },
                          investment_id: { type: 'number' },
                          invested_amount: { type: 'number' },
                          invested_date: { type: 'string' },
                          status: { type: 'string' },
                          name: { type: 'string' },
                          location: { type: 'string' },
                          expected_return: { type: 'number' }
                        }
                      }
                    },
                    count: { type: 'number' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/user-investments/my/stats': {
      get: {
        summary: '내 투자 통계 조회',
        tags: ['User Investments'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: '투자 통계',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        totalInvested: { type: 'number', example: 100000000, description: '총 투자금액' },
                        investmentCount: { type: 'number', example: 3, description: '투자 상품 개수' },
                        expectedReturn: { type: 'number', example: 8.2, description: '예상 수익률 (%)' },
                        monthlyIncome: { type: 'number', example: 683333, description: '월 예상 수익' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/user-investments': {
      post: {
        summary: '투자 생성',
        tags: ['User Investments'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['investment_id', 'invested_amount'],
                properties: {
                  investment_id: { type: 'number', example: 1 },
                  invested_amount: { type: 'number', example: 10000000 }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: '투자 생성 성공',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string' },
                    data: { type: 'object' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/user-investments/{investmentId}': {
      put: {
        summary: '투자 금액 수정',
        tags: ['User Investments'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'investmentId',
            required: true,
            schema: { type: 'integer' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['invested_amount'],
                properties: {
                  invested_amount: { type: 'number' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: '투자 금액 수정 성공'
          }
        }
      },
      delete: {
        summary: '투자 삭제',
        tags: ['User Investments'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'investmentId',
            required: true,
            schema: { type: 'integer' }
          }
        ],
        responses: {
          '200': {
            description: '투자 삭제 성공'
          }
        }
      }
    }
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: '로그인 후 받은 JWT 토큰을 입력하세요'
      }
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: { type: 'string' },
          message: { type: 'string' }
        }
      }
    }
  }
};
