# NestJS Backend

## Purpose

This skill defines the backend architecture, coding conventions, and best practices for this project.

It ensures all generated backend code is clean, modular, maintainable, and follows NestJS best practices.

---

# General Principles

- Use TypeScript only.
- Follow NestJS conventions.
- Keep code simple and readable.
- Favor maintainability over clever implementations.
- Implement only what is required.
- Avoid unnecessary abstractions and dependencies.

---

# Architecture

Organize code by feature.

Example:

src/

    accounts/

    salesforce/

    auth/

Each feature should contain its own:

- module
- controller
- service
- dto
- types/interfaces (if needed)

Avoid organizing by file type across the entire project.

---

# Responsibilities

## Controller

Controllers should:

- Handle HTTP requests
- Validate request data
- Delegate work to services
- Return HTTP responses

Controllers should NOT:

- Contain business logic
- Call external APIs directly
- Access configuration directly

Keep controllers thin.

---

## Service

Services should:

- Contain business logic
- Coordinate multiple components
- Call external services
- Handle application workflows

Services should remain focused on a single responsibility.

---

## External Integrations

External APIs (such as Salesforce) should be isolated in dedicated services.

Application services should never construct HTTP requests directly.

---

# Dependency Injection

Use NestJS dependency injection.

Inject services through constructors.

Avoid creating service instances manually.

---

# DTOs

Use DTOs for all request bodies.

Validate incoming requests using:

- class-validator
- class-transformer

Example validations:

- Required fields
- String length
- URL validation
- Email validation
- Enum validation

Never trust incoming request data.

---

# Validation

Enable global validation.

Reject invalid requests before reaching business logic.

Whitelist accepted properties.

Forbid unknown properties when appropriate.

---

# Error Handling

Use NestJS exceptions.

Examples:

- BadRequestException
- UnauthorizedException
- ForbiddenException
- NotFoundException
- ConflictException
- InternalServerErrorException

Return meaningful error messages.

Do not expose stack traces or internal implementation details.

---

# Configuration

Store configuration in environment variables.

Use ConfigModule.

Never hardcode:

- Secrets
- URLs
- Credentials
- API keys

Provide a `.env.example`.

---

# Logging

Use NestJS Logger.

Log:

- Application startup
- Important business events
- External API failures

Never log:

- Passwords
- Access tokens
- Secrets
- Sensitive personal data

---

# API Design

Follow REST conventions.

Examples:

GET /accounts

POST /accounts

Use appropriate HTTP status codes.

Return consistent JSON responses.

Avoid exposing internal implementation details.

---

# Code Organization

Keep files small.

Prefer one responsibility per class.

Avoid utility classes unless genuinely reusable.

Extract shared logic only when duplication becomes meaningful.

---

# Naming

Use descriptive names.

Examples:

SalesforceService

AccountsService

CreateAccountDto

Avoid generic names like:

Helper

Manager

Utils

Service2

---

# Async Code

Use async/await.

Avoid nested Promise chains.

Handle all asynchronous errors.

Do not ignore rejected promises.

---

# Security

Validate all input.

Sanitize external data where appropriate.

Never expose secrets.

Protect sensitive endpoints if authentication is introduced.

---

# Testing

Write code that is easy to test.

Prefer dependency injection over static methods.

Mock external integrations.

Avoid hidden dependencies.

---

# AI Development Guidelines

Before generating backend code:

1. Understand the requirement.
2. Reuse existing modules whenever possible.
3. Explain the implementation plan.
4. Generate the smallest complete solution.
5. Refactor only when it improves readability.
6. Follow the existing project structure.

Avoid creating unnecessary files, services, or abstractions.

Favor production-quality code over rapid code generation.

If multiple solutions are possible, choose the one that is easiest to understand, maintain, and explain during a code review.