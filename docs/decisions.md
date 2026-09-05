# Technical Decisions

## Next.js App Router

### Decision

Use Next.js with the App Router for the application.

### Why

The App Router provides a single framework for the frontend and server-side API routes. It also makes it straightforward to keep protected server-side logic close to the application.

### Alternative considered

A separate frontend and backend could have been used, but that would add unnecessary project and deployment complexity for this assignment.

---

## JavaScript Instead of TypeScript

### Decision

Use JavaScript for the application code.

### Why

JavaScript keeps the implementation lightweight and was sufficient for the scope of the assignment. Prisma's generated contract types are still used where provided by the database tooling.

### Alternative considered

TypeScript could provide additional compile-time type checking, but JavaScript was chosen to keep the implementation consistent and focused on delivering the required functionality.

---

## Clerk for Authentication

### Decision

Use Clerk for authentication.

### Why

Clerk provides the authentication flow and user identity management without requiring a custom authentication system.

The application stores the Clerk user ID in its own `User` table so that authentication identity and application-specific data remain connected.

### Alternative considered

A custom authentication system could have been implemented, but it would introduce additional security and session-management responsibilities that are outside the main focus of this assignment.

---

## Application Roles in PostgreSQL

### Decision

Store `STAFF` and `INSTRUCTOR` roles in the application's `User` table rather than relying only on Clerk metadata.

### Why

The role is part of the application's business model and is therefore kept with the application's database records.

This also allows server-side authorization to be performed directly against the application's user record.

---

## Neon PostgreSQL

### Decision

Use Neon PostgreSQL as the production relational database.

### Why

The booking system contains strongly related entities such as members, sessions, instructors, bookings and booking history. PostgreSQL is well suited to these relationships and constraints.

Neon also provides a managed PostgreSQL environment that works well with a Vercel deployment.

### Alternative considered

A document database could have been used, but the relational structure and booking constraints made PostgreSQL a better fit.

---

## Prisma ORM

### Decision

Use Prisma ORM with the Prisma 8 contract-based workflow.

### Why

Prisma provides structured database access while keeping the application's database model explicit.

The contract-based workflow also keeps the database schema and generated database client artifacts aligned.

### Alternative considered

Raw SQL could provide more direct control, but Prisma was preferred for consistency and maintainability.

---

## shadcn/ui

### Decision

Use shadcn/ui together with Tailwind CSS for the UI.

### Why

It provides reusable accessible UI components while still allowing the application to control the styling and layout.

This was useful for forms, dialogs, tables, selects, alerts and other management interfaces.

---

## Axios for Client-Side API Requests

### Decision

Use Axios for client-side API requests in the application areas that make browser-side API calls.

### Why

Axios provides a straightforward request API and makes handling HTTP errors and response data convenient for the client-side management pages.

---

## Server-Side Authorization

### Decision

Protect business APIs using server-side authentication and role checks.

### Why

Authorization should not depend only on hiding navigation items in the frontend.

The API verifies the authenticated user and their application role before allowing Staff or Instructor operations.

Instructor-specific operations also verify whether the instructor is actually assigned to the relevant session.

---

## Booking History

### Decision

Keep a separate `BookingHistory` table rather than relying only on the current booking status.

### Why

The current status tells us what happened most recently, while the history provides an audit trail of important changes.

This makes it possible to see actions such as booking creation, cancellation, waitlist promotion and attendance updates.

---

## Waitlist Promotion

### Decision

Automatically promote the earliest waitlisted booking when a booked member cancels.

### Why

This matches the expected booking lifecycle and avoids requiring Staff to manually manage every available seat.

The promotion is also recorded in booking history.

---

## Recurring Sessions

### Decision

Implement recurring session creation through a dedicated API supporting daily and weekly recurrence.

### Why

Generating individual session records makes each occurrence independently manageable after creation.

The implementation also checks instructor and room conflicts while generating recurring sessions.

### Alternative considered

Storing recurrence rules without generating individual sessions would reduce the number of records, but it would make individual booking and scheduling operations more complex.

---

## Vercel for Hosting

### Decision

Deploy the application to Vercel.

### Why

The application uses Next.js, so Vercel provides a straightforward deployment environment with minimal additional infrastructure.

The production deployment connects to the Neon database and Clerk authentication configuration.
