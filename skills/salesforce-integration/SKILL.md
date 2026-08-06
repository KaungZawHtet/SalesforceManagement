# Salesforce API Integration

## Purpose

This skill provides guidance for integrating with the Salesforce REST API.

It covers:

- OAuth authentication
- Access token management
- REST API usage
- SOQL queries
- Account CRUD operations
- Error handling
- Security best practices

This skill should only be responsible for Salesforce integration.

---

# General Principles

- Never expose Salesforce credentials to the frontend.
- Never call Salesforce directly from browser code.
- All Salesforce communication must go through the backend.
- Keep Salesforce-specific logic isolated from business logic.
- Use environment variables for all credentials.
- Prefer official Salesforce REST APIs over custom workarounds.
- Write integration code that is easy to replace or extend.

---

# Authentication

Use OAuth 2.0.

Store credentials in environment variables.

Never hardcode:

- Client ID
- Client Secret
- Username
- Password
- Security Token
- Instance URL

The backend is responsible for obtaining and managing access tokens.

Reuse valid access tokens whenever possible.

If authentication fails, return a meaningful error instead of retrying indefinitely.

---

# Service Design

Create a dedicated Salesforce service.

Responsibilities:

- Authenticate
- Send API requests
- Handle errors
- Parse responses

Business logic should never communicate with Salesforce directly.

---

# API Design

Expose application REST endpoints.

Example:

GET /accounts

POST /accounts

Do not expose Salesforce endpoints directly.

Translate between application models and Salesforce models when necessary.

---

# Querying Data

Use SOQL for reads.

Keep queries simple and readable.

Only request fields that are actually needed.

Avoid SELECT * style thinking.

Example fields:

- Id
- Name
- Phone
- Website
- Industry

Support pagination when appropriate.

---

# Creating Accounts

Validate incoming data before calling Salesforce.

Required:

- Name

Optional:

- Phone
- Website
- Industry

Do not send empty values unless required.

Return the created record or its identifier.

---

# Error Handling

Handle:

- Authentication failures
- Invalid credentials
- Expired tokens
- Validation failures
- Network errors
- Salesforce API errors

Convert Salesforce errors into user-friendly application errors.

Do not expose raw Salesforce responses.

---

# Security

Never log:

- Access tokens
- Passwords
- Security tokens
- Client secrets

Sanitize logs.

Never commit credentials.

Use environment variables exclusively.

---

# Performance

Reuse authenticated sessions whenever possible.

Avoid authenticating before every request.

Keep API calls to the minimum required.

Avoid duplicate requests.

---

# Code Quality

Keep methods focused.

Prefer descriptive method names.

Separate:

- authentication
- request execution
- response mapping

Avoid duplicated API code.

Create reusable helper methods where appropriate.

---

# Testing

Mock Salesforce API interactions during unit testing.

Do not depend on a live Salesforce org for unit tests.

Use integration tests when testing real API communication.

---

# AI Guidelines

Before implementing Salesforce functionality:

1. Explain the implementation plan.
2. Check whether similar functionality already exists.
3. Reuse existing service methods.
4. Avoid duplicate API wrappers.
5. Keep implementations simple and maintainable.

Prefer production-quality code over quick solutions.

If requirements are unclear, ask for clarification instead of guessing.