# Project Instructions

When starting work on this project, you MUST follow these steps:

## 1. Read Development Guide FIRST
Before writing any code, read [CONTRIBUTING.md](../CONTRIBUTING.md) in full.

This document contains:
- Coding conventions (file naming, class naming)
- Architecture patterns (service layer, route patterns)
- Cloudflare bindings usage (D1, KV, R2)
- 7 core rules for AI development

## 2. Follow the Standards
All code you write must follow the conventions defined in CONTRIBUTING.md:
- File names: camelCase (e.g., `authService.js`)
- Class names: PascalCase (e.g., `class AuthService`)
- Services: Class-based with `env` injection in constructor
- Routes: Use Hono router patterns
- No unnecessary abstractions

## 3. Check Examples
When adding new features, refer to existing code:
- Routes: `src/routes/auth.js`, `src/routes/users.js`
- Services: `src/services/authService.js`, `src/services/userService.js`
- Middleware: `src/middleware/auth.js`

## 4. Never Skip the Guide
Even if the user doesn't mention CONTRIBUTING.md, you must reference it when writing code.
Consistency with existing patterns is critical for this template.
