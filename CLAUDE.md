# Project Overview

- Stack: Node.js, Express.js, TypeScript, MongoDB (Mongoose inferred), Redis, Docker.
- Architecture: Domain-Driven/Modular structure. Features are grouped into isolated domains inside `/src/modules/`.

# Directory Map (DO NOT EXPLORE via shell commands)

- **Modules (`/src/modules/<domain>/`)**: Each domain contains its own:
  - `*.controller.ts` (Req/Res handling)
  - `*.service.ts` (Core business logic & DB operations)
  - `*.model.ts` (Database schemas/interfaces)
  - `*.route.ts` (Express router for the domain)
  - `*.validation.ts` (Request payload validation schemas)
  - `*.interface.ts` (TypeScript types/interfaces)
- **Central Router (`/src/routes.ts`)**: All domain routes (`*.route.ts`) MUST be registered here.
- **Middlewares (`/src/middlewares/`)**: Contains `auth`, `validate`, `upload`, `rateLimit`, and `error`.
- **Utils (`/src/utils/`)**: Shared helpers. Includes `catchAsync.ts`, `logger.ts`, `jwt.ts`.
- **Errors (`/src/errors/`)**: Custom error classes (`AppError`, `BadRequestError`, etc.).
- **Jobs (`/src/jobs/`)**: Background workers and queues (e.g., `email.queue.ts`).
- **Config (`/src/config/`)**: 3rd party connections (`db`, `redis`, `cloudinary`, `socket`).

# Strict Execution Rules (CRITICAL FOR RATE LIMITS)

1. **Zero Exploration:** DO NOT run `ls`, `grep`, `find`, or `cat` to understand the structure. Rely completely on the Directory Map above.
2. **Single-Shot Edits:** Write complete, fully implemented files in one response. Do not leave `// TODO` comments or ask if you should continue.
3. **No Auto-Testing:** DO NOT run `npm test`, `npm run dev`, or `docker-compose up` after modifying code. I will test manually.

# Coding Standards

1. **Async Controllers:** Every single controller method MUST be wrapped in `catchAsync()` from `src/utils/catchAsync.ts`. No manual try/catch blocks in controllers.
2. **Error Handling:** Do not throw generic JS errors. Import and throw specific errors from `src/errors/` (e.g., `throw new AppError(404, 'User not found')`).
3. **Service Layer:** Controllers must contain NO business logic. All database calls and heavy lifting must be done inside the `*.service.ts` files.
4. **Validation:** All incoming request bodies/params must be validated using the schemas defined in `*.validation.ts` injected via the `validate.middleware.ts` before reaching the controller.
