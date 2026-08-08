# AGENTS.md

# Salesforce Account Manager

## Objective

Build a production-quality web application that integrates with Salesforce via the Salesforce REST API.

The application must allow users to:

- View existing Salesforce Account records.
- Create new Salesforce Account records.

The goal is to demonstrate clean architecture, maintainable code, correctness, and sound engineering practices rather than implementing unnecessary features.

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

```text
Browser
    │
    ▼
Next.js Frontend
    │
    │ REST API
    ▼
NestJS Backend
    │
    ▼
Salesforce Service
    │
    ▼
Salesforce REST API
```

The frontend must never communicate directly with Salesforce.

All Salesforce communication must go through the backend.

Salesforce credentials, access tokens, and other secrets must remain server-side.

---

# Available Skills and Agents

Before working on a task, inspect the available files under:

- `skills/`
- `.agent/`

Identify and read only the files relevant to the current task.

Do not blindly read every file in these directories, as unnecessary context increases token usage.

Use relevant skills and specialized agent definitions when they provide meaningful task-specific guidance.

---

# Task Analysis

Before making changes:

1. Understand the user's request.
2. Inspect the existing project structure and relevant files.
3. Inspect relevant files under `skills/` and `.agent/`.
4. Identify requirements, constraints, dependencies, and affected areas.
5. Determine whether the task should be handled directly or delegated.
6. If delegation would provide meaningful value, follow the delegation process below.
7. For non-trivial changes, briefly explain the implementation plan.
8. Implement the smallest complete solution.
9. Run appropriate validation and tests.
10. Review the resulting changes for correctness, maintainability, and unnecessary complexity.

For trivial changes, do not waste time explaining an unnecessary implementation plan.

---

# Backend Design

Organize backend code primarily by feature.

Suggested modules:

- `salesforce`
- `accounts`

Add an `auth` module only if application-level authentication is explicitly required.

Guidelines:

- Controllers should remain thin.
- Business logic belongs in services.
- Salesforce API communication must be isolated inside the Salesforce module.
- Keep responsibilities clearly separated.
- Avoid duplicated logic.
- Reuse existing code where appropriate.
- Keep abstractions proportional to the complexity of the application.

The application should not expose Salesforce-specific implementation details unnecessarily to the frontend.

---

# Salesforce Integration

The backend owns all Salesforce communication.

Requirements:

- Keep Salesforce credentials and access tokens on the server.
- Never expose Salesforce access tokens to the browser.
- Never hardcode Salesforce credentials, tokens, or instance URLs.
- Isolate Salesforce-specific API communication inside the Salesforce module.
- Handle Salesforce authentication and token-related failures appropriately.
- Handle Salesforce API errors explicitly.
- Map external Salesforce errors to appropriate application-level errors.
- Do not leak Salesforce credentials, tokens, stack traces, or internal implementation details in API responses.

---

# API Design

Use RESTful endpoints.

Required endpoints:

```text
GET  /accounts
POST /accounts
```

Use appropriate HTTP status codes.

Validate all incoming request payloads.

Return consistent JSON responses.

API errors should be predictable and useful to the frontend without exposing internal implementation details.

Do not introduce additional endpoints unless they are required by the assignment or explicitly requested.

---

# Frontend Design

Build reusable UI components where reuse provides meaningful value.

Separate:

- Presentation
- API communication
- Business logic

The UI should include:

- Account table
- Create Account form
- Loading state
- Empty state
- Error state
- Success notification

The interface should be:

- Clean
- Responsive
- Accessible
- Easy to understand
- Appropriate for an interview assignment

Avoid introducing global state management or other frontend abstractions unless they are genuinely necessary.

---

# Environment Variables

Never hardcode secrets.

Use environment variables for all Salesforce credentials and configuration.

Provide a `.env.example` containing the required variable names without real secrets.

Do not commit:

- Access tokens
- Client secrets
- Passwords
- Private keys
- `.env` files containing real credentials
- Other sensitive configuration

---

# Error Handling

Handle at minimum:

- Authentication failures
- Expired access tokens
- Salesforce API errors
- Validation failures
- Network failures
- Unexpected backend errors

Backend errors should be logged appropriately without exposing secrets.

Frontend error messages should be user-friendly.

Never expose:

- Secrets
- Access tokens
- Stack traces
- Internal file paths
- Sensitive Salesforce responses

---

# Security

Follow secure defaults.

- Never expose Salesforce credentials to the frontend.
- Validate all request payloads.
- Sanitize or safely handle user-controlled input where appropriate.
- Never commit secrets.
- Do not trust client-side validation alone.
- Keep sensitive operations on the backend.
- Avoid exposing unnecessary backend or Salesforce implementation details.

---

# Coding Standards

- TypeScript only.
- Keep functions focused and readable.
- Prefer composition over inheritance.
- Follow SOLID principles where appropriate.
- Minimize dependencies.
- Remove dead code.
- Keep naming consistent.
- Prefer simple and explicit code over clever abstractions.
- Reuse existing code where appropriate.
- Keep modules focused on clear responsibilities.
- Avoid premature abstraction.
- Write code that is easy to review and explain.

---

# Avoid Over-Engineering

Choose the simplest architecture that satisfies the current requirements.

Do not introduce unnecessary:

- Frameworks
- Libraries
- Design patterns
- Abstraction layers
- Generic repositories
- CQRS
- Event sourcing
- Microservices
- Message queues
- Background workers
- Caching layers
- State management libraries

unless they are justified by the current requirements.

When a new requirement is introduced, reconsider the architecture based on the new requirement rather than forcing it into the existing design.

Prefer incremental evolution over premature architecture.

When two solutions are reasonable, prefer the one that is:

1. Easier to understand.
2. Easier to maintain.
3. Easier to test.
4. Easier to explain during a code review.

---

# Change Discipline

Before modifying code:

- Inspect the existing implementation.
- Understand how the affected code fits into the project.
- Reuse existing components and utilities when appropriate.

When making changes:

- Keep changes focused.
- Avoid unrelated refactoring.
- Avoid unnecessary formatting changes.
- Avoid rewriting working code without a clear reason.
- Preserve existing behavior unless the requirement explicitly changes it.
- Do not modify unrelated configuration or infrastructure.

---

# Development Workflow

For each task:

1. Understand the requirement.
2. Inspect the relevant project files.
3. Inspect relevant skills and agent definitions.
4. Analyze the existing implementation.
5. Determine whether delegation would provide meaningful value.
6. If delegation is appropriate, request user approval before invoking sub-agents.
7. Explain the implementation approach for non-trivial changes.
8. Implement incrementally.
9. Run relevant tests and validation.
10. Review the changes.
11. Fix issues discovered during validation.
12. Summarize what was changed and how it was verified.

Do not generate large amounts of code without first considering the existing project structure.

---

# Decision Making

Before implementing significant changes:

- Understand the current architecture.
- Explain the proposed approach.
- Mention important trade-offs when relevant.
- Reuse existing code whenever possible.
- Prefer modifying existing components over rewriting them.
- Consider the simplest solution first.

Major changes include, but are not limited to:

- Changing the application architecture.
- Introducing a new major framework.
- Replacing an existing technology.
- Changing the API contract.
- Changing the authentication strategy.
- Changing the Salesforce integration approach.
- Introducing significant infrastructure changes.
- Deleting or substantially rewriting existing functionality.

Ask for confirmation before making major architectural changes.

Routine implementation decisions do not require user confirmation when they are already covered by the project requirements, conventions, or this document.

---

# Clarification

Ask the user when a requirement is genuinely ambiguous or when proceeding would require a consequential assumption.

Do not ask for confirmation for routine implementation details when a reasonable choice is already established by:

- The assignment requirements.
- Existing project conventions.
- This `AGENTS.md`.
- Relevant skill or agent instructions.

---

# Testing and Verification

After implementation:

- Run relevant unit tests.
- Run integration tests when applicable.
- Run linting when configured.
- Run TypeScript type checking when configured.
- Verify API behavior for affected endpoints.
- Verify frontend behavior for affected flows.
- Verify Docker/Compose startup when infrastructure changes are involved.
- Verify environment configuration where relevant.

Do not claim that a feature is working without performing reasonable verification.

If tests or validation cannot be executed, clearly state what could not be verified and why.

---

# Intelligent Delegation

Use sub-agents when delegation provides meaningful value.

The main agent should first analyze the task and determine whether delegation would be useful.

Delegation is appropriate when it provides one or more of the following:

- Specialized expertise.
- Independent investigation.
- Parallel work on isolated tasks.
- Focused code review.
- Complex debugging.
- Architecture analysis.

Do not delegate trivial tasks merely to increase agent usage.

---

# Delegation Approval

Before invoking any sub-agent, ask the user for approval.

The approval request should briefly explain:

- Why delegation would be useful.
- Which agent or role should be used.
- What scope will be delegated.
- Whether the work can be performed in parallel with other tasks.

Do not invoke a sub-agent until the user approves the delegation.

Delegation approval does not mean implementation approval.

The user is approving the use of a sub-agent, not automatically approving the sub-agent's implementation.

The main agent remains responsible for reviewing, validating, and integrating delegated work.

---

# Delegation Guidelines

Before delegating:

1. Identify the task's domain and complexity.
2. Determine whether a specialized agent is appropriate.
3. Read the relevant agent definition under `.agent/`.
4. Explain the proposed delegation to the user.
5. Wait for user approval.
6. Give the sub-agent clear context, scope, constraints, and expected output.
7. Review and validate the sub-agent's result.
8. Integrate the result only after validation.

Prefer specialized agents for substantial or isolated work such as:

- Architecture and planning
- Backend implementation
- Frontend implementation
- Salesforce integration
- Testing
- Code review
- Focused debugging

Do not delegate the same work to multiple agents unless independent perspectives or parallel investigation provide clear value.

The main agent should intelligently decide whether to:

- Work directly.
- Delegate to one specialized agent.
- Delegate multiple independent tasks in parallel.
- Ask a reviewer agent to validate completed work.

The main agent remains responsible for:

- Coordination
- Architectural consistency
- Integration
- Testing
- Final validation
- Final implementation quality

Sub-agents must not expand the scope of their assigned task without approval.

---

# Scope

This is an interview assignment.

Prioritize delivering a clean, production-quality solution over building unnecessary functionality.

Initially, implement only the features required by the current requirements.

The project may evolve during development or an interview. When the user explicitly requests a new feature or change:

- Treat the new requirement as part of the project scope.
- Re-evaluate the existing architecture before implementing it.
- Reuse and extend existing components where appropriate.
- Make the smallest architectural change necessary to support the new requirement.
- Explain important trade-offs when the change is significant.
- Do not reject a new requirement simply because it was not part of the original scope.

Do not implement speculative features before they are requested.

Do not introduce architecture solely to support hypothetical future requirements.

The architecture should remain reasonably extensible without being over-engineered.

Do not optimize prematurely.

Do not introduce infrastructure or architecture solely for demonstration purposes.

When multiple solutions are possible, prefer the one that is easier to understand, maintain, test, and explain during a code review.

---

# AI Collaboration Guidelines

Act as a senior software engineer collaborating on this project.

Provide recommendations when appropriate, but avoid making unnecessary architectural changes.

Use the existing codebase as the source of truth for implementation details when possible.

If a requirement is unclear, ask for clarification rather than making a consequential assumption.

Favor:

- Maintainability
- Readability
- Correctness
- Security
- Testability
- Simplicity

over clever implementations or unnecessary abstractions.

The main agent owns the final result even when work is delegated to sub-agents.

---

# Definition of Done

The project is complete when:

- Users can view Salesforce Account records.
- Users can create Salesforce Account records.
- The frontend communicates only with the backend.
- The backend communicates with Salesforce.
- Salesforce credentials remain server-side.
- Secrets are managed through environment variables.
- `.env.example` is provided.
- Appropriate validation and error handling are implemented.
- The project runs using Docker/Docker Compose.
- A README explains setup and usage.
- Relevant tests and validation pass.
- The codebase is clean, modular, maintainable, and ready for code review.
- No speculative features or unnecessary complexity have been introduced.