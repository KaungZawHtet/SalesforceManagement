# Next.js Frontend

## Purpose

This skill defines the frontend architecture, coding conventions, and best practices for building the Salesforce Account Manager frontend.

The goal is to create a clean, maintainable, production-quality user interface using Next.js and TypeScript.

---

# General Principles

- Use TypeScript everywhere.
- Prefer simple and maintainable solutions.
- Build reusable components.
- Keep components focused on a single responsibility.
- Avoid unnecessary abstractions.
- Follow Next.js App Router conventions.
- Prioritize user experience and code quality.

---

# Tech Stack

Frontend:

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui

Backend:

- NestJS REST API

The frontend communicates only with the backend API.

The frontend must never call Salesforce directly.

---

# Application Structure

Recommended structure:

```
src/

app/
    page.tsx
    layout.tsx

components/
    ui/
    accounts/

lib/
    api/

types/

hooks/
```

Organize code by responsibility.

---

# Next.js App Router

Use the App Router.

Prefer:

- Server Components by default.
- Client Components only when interactivity is required.

Use `"use client"` only when needed.

Examples requiring Client Components:

- Forms
- Interactive tables
- Modals
- User interactions

---

# Component Design

Create small reusable components.

Examples:

```
components/

accounts/

    AccountTable.tsx
    AccountForm.tsx
    AccountRow.tsx

ui/

    Button.tsx
    Input.tsx
```

Avoid large components containing:

- API calls
- Business logic
- Complex UI
- Validation

---

# API Communication

All API communication should be isolated.

Example:

```
lib/

api/

    accounts.ts
```

Components should not directly call fetch.

Bad:

```typescript
await fetch("/api/accounts")
```

inside a component.

Prefer:

```typescript
accountsApi.getAccounts()
```

---

# Backend Integration

Expected API:

```
GET /accounts

POST /accounts
```

The frontend should:

- Request account data.
- Display account records.
- Submit new accounts.
- Handle API failures gracefully.

---

# State Management

Avoid unnecessary state libraries.

Prefer:

- React state
- React hooks
- Server Components

Only introduce external state management if complexity requires it.

---

# Forms

Forms should:

- Validate user input.
- Show validation errors.
- Prevent invalid submissions.
- Provide loading states.

Required field:

- Account Name

Optional:

- Phone
- Website
- Industry

---

# UI Requirements

The application should include:

## Account List

Display:

- Account Name
- Phone
- Website
- Industry

Include:

- Loading state
- Empty state
- Error state

---

## Create Account Form

Include:

- Input fields
- Submit button
- Success notification
- Error notification

After successful creation:

- Refresh the account list.

---

# Styling

Use Tailwind CSS.

Use shadcn/ui components where appropriate.

Maintain consistent spacing and typography.

Avoid custom CSS unless necessary.

---

# Error Handling

Handle:

- Backend unavailable
- Failed API requests
- Validation errors
- Network errors

Show user-friendly messages.

Do not expose technical details.

---

# TypeScript

Use strong typing.

Avoid:

```typescript
any
```

Define interfaces/types for:

- Account
- API responses
- Form data

Example:

```typescript
interface Account ***REMOVED***
  id: string;
  name: string;
  phone?: string;
  website?: string;
  industry?: string;
***REMOVED***
```

---

# Environment Variables

Never hardcode backend URLs.

Use:

```
NEXT_PUBLIC_API_URL
```

for API configuration.

Provide `.env.example`.

---

# Performance

Follow Next.js best practices:

- Avoid unnecessary client components.
- Avoid unnecessary re-renders.
- Optimize data fetching.
- Keep bundles small.

---

# Accessibility

Follow basic accessibility practices:

- Proper labels for inputs.
- Keyboard-friendly interactions.
- Semantic HTML.
- Meaningful error messages.

---

# AI Development Workflow

Before implementing frontend features:

1. Understand the UI requirement.
2. Explain the component design.
3. Reuse existing components.
4. Implement the smallest complete solution.
5. Review generated code.
6. Refactor when it improves maintainability.

Avoid generating large components.

---

# Scope

This is an interview assignment.

Prioritize a polished, simple, professional UI.

Do not introduce unnecessary libraries or complex frontend architecture.

Prefer clarity and maintainability over excessive flexibility.

---

# Definition of Done

The frontend is complete when:

- Users can view Salesforce Accounts.
- Users can create Salesforce Accounts.
- UI is responsive.
- Loading and error states are handled.
- Components are reusable.
- API communication is separated from UI components.
- Code is clean and ready for review.