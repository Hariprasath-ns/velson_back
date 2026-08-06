---
name: backend-development
description: Guidelines and strict operating protocols for building, refactoring, and maintaining the backend API for the Velson ERP project. It covers coding patterns, database safety, error handling, security, and loading state integration.
license: Complete terms in LICENSE.txt
---

This skill guides the creation and maintenance of robust, production-grade backend APIs that maintain architectural integrity, follow consistent patterns, and coordinate smoothly with the frontend application.

---

## Part 1: Mandatory Planning Protocol & Approval Gate

Before writing any backend code, generating Prisma schemas, generating migrations, creating files, or refactoring existing code, the agent must proceed through a strict planning lifecycle:

1. **Analyze**: Understand the requirement and inspect the current codebase.
2. **Ask Questions**: Ask clarifying questions to resolve any ambiguity or missing information before assuming.
3. **Create Plan**: Write a detailed implementation plan in the brain's `implementation_plan.md` artifact.
4. **Wait**: Stop executing tools and wait.
5. **Approval**: Obtain explicit approval from the user (e.g., "Approved", "Go Ahead", "Proceed").
6. **Implementation**: Once approved, execute the plan incrementally while tracking progress in the `task.md` artifact.

> [!IMPORTANT]
> **No code generation is allowed before explicit user approval.**
> This means NO Prisma schema modifications, NO database migrations, NO route files, NO controllers, NO models, NO services, and NO repositories can be created or generated prior to receiving approval. Only analysis, clarification, and plan creation are permitted.

---

## Part 2: Codebase Discovery Protocol

When assigned a task, never assume any aspect of the codebase. You must follow the discovery protocol:

### Phase 1: Discovery
Analyze the existing folder structure, routing mechanism, controller boundaries, model methods, prisma schemas, migrations, middleware, and utility helper functions before designing the solution.

### Phase 2: Pattern Identification
Identify the conventions used in the project:
* **Module Pattern**: How files are grouped (routes, controllers, models, utils).
* **Database Pattern**: How Prisma models and fields are defined.
* **API Pattern**: How routes are declared and bound to controller methods.
* **Authentication/Authorization**: How roles and tokens are checked.
* **Error/Response Handling**: How errors are caught and how API responses are formatted.

### Phase 3: Reuse First
Always check if a similar helper, utility, validator, or DB method already exists. Prefer reuse, extension, and consistency over duplication and new patterns.

### Phase 4: Similar Module Analysis
Before building a new module, analyze the most similar existing module (e.g., `companyMaster` or `employeeMaster`) to use as the primary reference for code structure, validation, and layout.

### Phase 5: Consistency Check
Ensure all naming conventions (camelCase, PascalCase, table mapping), folder layouts, error classes, and responses align perfectly with the surrounding codebase.

---

## Part 3: Architecture Evolution & Existing Module Protection

### Current vs. Target Architecture
* **Current Architecture**: Route → Controller → Model (Prisma queries written in models or inline in controllers)
* **Target Architecture**: Route → Controller → Service → Repository

### Existing Module Protection
* **Existing modules are considered stable.**
* The agent must NOT refactor existing modules, move existing files, rename existing files, or convert existing Controller → Model modules into Service → Repository modules without explicit approval.
* All new architectural improvements (e.g. Service Layer and Repository Pattern) should be introduced through **new modules first**.

---

## Part 4: Database & Migration Policy

* **Migration Immutability**: All migration files under `prisma/migrations` are immutable. Never delete, rewrite, or modify previous migration files.
* **Schema Updates**:
  1. Add/modify models and fields in `prisma/schema.prisma`.
  2. Generate a new migration using `npx prisma migrate dev --name <migration_name>` or equivalent command.
  3. Ensure audit fields (`createdAt`, `updatedAt`, `createdBy`, `updatedBy`) are included in major master and transaction tables.

---

## Part 5: Layer Responsibilities (Target Pattern)

### 1. Routes (`src/routes/`)
* Declare the endpoints and bind them to controller methods.
* Apply authentication (`authenticate`) and authorization (`authorize(...roles)`) middlewares.
* Avoid writing logic inside route handlers.

### 2. Controllers (`src/controllers/`)
* Manage the HTTP request/response lifecycle.
* Validate inputs and parameter formats (e.g., parse route parameters to Integers).
* Call the corresponding Service methods.
* Hand off response formatting to success outputs or let errors bubble up.

### 3. Services (`src/services/` - New Modules)
* Encapsulate core business rules, validations, and transactional checks.
* Coordinate data operations across one or more repositories.
* Must not access request (`req`) or response (`res`) Express objects directly.

### 4. Repositories / Models (`src/models/` or `src/repositories/`)
* Focus purely on database queries using the Prisma client (`db`).
* Keep queries optimized. Write raw SQL using `db.$queryRaw` only when complex operations (such as dynamic sorting/filtering or regex matches) require it.

---

## Part 6: Error & Response Guidelines

### Centralized Error Handling
* Do not return custom error structures from controllers. Instead, throw instances of custom error classes from `src/middlewares/customErrors.js`:
  * `BadRequestError(message, errorCode, details)` -> 400 Bad Request
  * `UnauthorizedError(message, errorCode)` -> 401 Unauthorized
  * `ForbiddenError(message, errorCode)` -> 403 Forbidden
  * `NotFoundError(message, errorCode)` -> 404 Not Found
  * `ConflictError(message, errorCode)` -> 409 Conflict
  * `ValidationError(message, details)` -> 422 Unprocessable Entity
* The centralized `errorMiddleware.js` catches all thrown errors, logs them, and formats the response JSON automatically.

### Response Formatting
* Success responses must be returned explicitly from controllers:
  * CRUD lists/items: `res.json({ success: true, data })` or `res.status(201).json({ success: true, data })`
  * Deletions/Actions: `res.json({ success: true })`

---

## Part 7: Frontend Loading Compatibility

The frontend application uses a centralized axios request interceptor linked to a global UI loading screen spinner overlay. The backend design must accommodate this behavior:

* **Short-Lived Requests**: Ensure endpoints are optimized with indexes, pagination, and select clauses so they execute and respond quickly, preventing long, locking loader screens on the client side.
* **Background / Silent APIs**: Any background operations (e.g., auto-suggest, autocomplete, polling, or non-blocking validations like check-if-code-exists) must be designed to handle quick requests. The frontend should call these using `skipGlobalLoader: true` to avoid interrupting the user.
* **Explicit Action Messaging**: For write operations (e.g., CSV imports, bulk updates, deletions, or long reports) that do require screen locking, the backend should be compatible with explicit loader messaging (configured via the frontend's `loadingMessage` parameter in axios configurations).

---

## Part 8: Senior Engineer Code Review Protocol

Before delivering any backend changes, perform a final review against these five pillars:

1. **Security**: Are `authenticate` and `authorize` applied? Is user inputs validated to prevent injections?
2. **Performance**: Are queries indexed? Is pagination applied to listing endpoints? Are select clauses limiting payload size?
3. **Reliability**: Are database transactions safe? Are potential exceptions handled by centralized error middleware?
4. **Maintainability**: Are naming conventions consistent (camelCase, PascalCase)? Is there a clean separation of concerns?
5. **Auditability**: Are audit columns (`createdBy`, `updatedBy`) populated? Are critical errors logged with context?
