# AGENTS.md

# Salesforce Account Manager

## Objective

Build a production-quality web application that integrates with Salesforce via the Salesforce REST API.

The application must allow users to:

- View existing Salesforce Account records.
- Create new Salesforce Account records.

The goal is to demonstrate clean architecture, maintainable code, and sound engineering practices rather than implementing unnecessary features.

---

# Tech Stack

## Frontend

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui

## Backend

- NestJS
- TypeScript

## Infrastructure

- Docker
- Docker Compose

---

# Architecture

```
Browser
    │
    ▼
Next.js Frontend
    │
REST API
    │
    ▼
NestJS Backend
    │
Salesforce Service
    │
    ▼
Salesforce REST API
```

The frontend must never communicate directly with Salesforce.

All Salesforce communication must go through the backend.

---

# Backend Design

Organize code by feature.

Suggested modules:

- auth
- salesforce
- accounts

Guidelines:

- Controllers should remain thin.
- Business logic belongs in services.
- Salesforce API communication must be isolated inside the Salesforce module.
- Keep responsibilities clearly separated.
- Avoid duplicated logic.

---

# API Design

Use RESTful endpoints.

Example:

- GET /accounts
- POST /accounts

Use proper HTTP status codes.

Return consistent JSON responses.

Validate all incoming requests.

---

# Frontend Design

Build reusable UI components.

Separate:

- Presentation
- API calls
- Business logic

The UI should include:

- Account table
- Create Account form
- Loading state
- Empty state
- Error state
- Success notification

The interface should be clean, responsive, and easy to understand.

---

# Environment Variables

Never hardcode secrets.

Use environment variables for all Salesforce credentials and configuration.

Provide a `.env.example`.

---

# Error Handling

Handle:

- Authentication failures
- Expired access tokens
- Salesforce API errors
- Validation failures
- Network failures

Display user-friendly error messages.

Never expose secrets or internal implementation details.

---

# Security

- Never expose Salesforce credentials to the frontend.
- Validate all request payloads.
- Never commit secrets.
- Follow secure defaults.

---

# Coding Standards

- TypeScript only.
- Keep functions focused and readable.
- Prefer composition over inheritance.
- Follow SOLID principles where appropriate.
- Minimize dependencies.
- Remove dead code.
- Keep naming consistent.
- Write code that is easy to review.

---

# Development Workflow

Before implementing a feature:

1. Understand the requirement.
2. Explain the implementation plan.
3. Implement the smallest complete solution.
4. Review generated code.
5. Refactor only when it improves readability or maintainability.
6. Verify the solution before moving to the next task.

Implement features incrementally.

Do not generate large amounts of code without considering the existing project structure.

---

# Decision Making

Before implementing significant changes:

- Explain the proposed approach.
- Mention important trade-offs when relevant.
- Reuse existing code whenever possible.
- Prefer modifying existing components over rewriting them.
- Ask for confirmation before making major architectural changes.

---

# Scope

This is an interview assignment.

Prioritize delivering a clean, production-quality solution over building a feature-rich application.

Choose the simplest architecture that satisfies the requirements.

Do not introduce unnecessary frameworks, design patterns, abstractions, or dependencies.

Only implement features that directly support the assignment unless explicitly requested.

When multiple solutions are possible, prefer the one that is easier to understand, maintain, and explain during a code review.

---

# AI Collaboration Guidelines

Act as a senior software engineer collaborating on this project.

Provide recommendations when appropriate, but avoid making unnecessary architectural changes.

If a requirement is unclear, ask for clarification instead of making assumptions.

Favor maintainability, readability, and correctness over clever implementations.

---

# Definition of Done

The project is complete when:

- Users can view Salesforce Account records.
- Users can create Salesforce Account records.
- The frontend communicates only with the backend.
- The backend communicates with Salesforce.
- Secrets are managed through environment variables.
- The project runs using Docker.
- A README explains setup and usage.
- The codebase is clean, modular, maintainable, and ready for code review.