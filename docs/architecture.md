# Architecture

## Overview

The application is built as a Next.js application using the App Router. The frontend UI, server-side API routes, authentication, and database access are kept within the same application.

The main flow is:

User → Next.js UI → API Routes → Authentication/Authorization → Prisma ORM → Neon PostgreSQL

Clerk is used for authentication, while application-specific user roles and instructor/member data are stored in PostgreSQL.

## Main Components

### Frontend

The frontend is implemented using:

- Next.js App Router
- JavaScript
- React
- Tailwind CSS
- shadcn/ui
- Axios for client-side API requests

The application provides separate workflows for Staff and Instructor users.

Staff can manage classes, sessions, rooms, members, users, instructors, bookings and membership alerts.

Instructors can view their assigned sessions and bookings and can perform attendance actions for sessions assigned to them.

### Authentication and Authorization

Clerk handles user authentication.

After authentication, the application finds or creates the corresponding user record in the PostgreSQL database using the Clerk user ID.

Application roles are stored in the `User` table:

- `STAFF`
- `INSTRUCTOR`

Server-side authorization helpers are used by protected API routes to ensure that users can only perform actions allowed for their role.

Instructor-specific session and attendance operations additionally verify the instructor's relationship with the session.

### Backend

Backend functionality is implemented through Next.js App Router API routes.

Important API areas include:

- `/api/classes`
- `/api/sessions`
- `/api/rooms`
- `/api/members`
- `/api/users`
- `/api/instructors`
- `/api/bookings`
- `/api/membership-alerts`

The booking APIs contain the main business rules, including membership validation, duplicate booking prevention, capacity handling, waitlisting, cancellation and waitlist promotion.

### Database

Neon PostgreSQL is used as the application's relational database.

Prisma ORM is used for database access. The project uses the Prisma 8 contract-based workflow.

The main entities are:

- User
- Member
- Instructor
- Room
- Class
- Session
- SessionInstructor
- Booking
- BookingHistory
- MembershipAlert

Relationships and database constraints are used to maintain data integrity, including unique member/session bookings.

### Deployment

The application is deployed on Vercel.

The production application connects to the production Neon PostgreSQL database and uses Clerk for authentication.

## Request Flow

A typical authenticated request follows this flow:

1. The user signs in through Clerk.
2. Clerk provides the authenticated user identity.
3. The application resolves the corresponding database `User`.
4. The API route checks the user's role and permissions.
5. The API performs the required database operations through Prisma ORM.
6. The API returns the result to the Next.js frontend.
7. The frontend updates the UI based on the response.

## Booking Flow

For a new booking:

1. Staff selects a member and session.
2. The booking API verifies that both records exist.
3. The member's membership expiry is checked.
4. Existing bookings for the same member and session are checked.
5. Session capacity is checked.
6. The booking is created as `BOOKED` if capacity is available.
7. If the session is full, the booking is created as `WAITLISTED`.
8. A `BookingHistory` record is created for the action.

When a booked member cancels:

1. The booking is changed to `CANCELLED`.
2. The cancellation is recorded in `BookingHistory`.
3. The earliest waitlisted booking is promoted to `BOOKED`.
4. The promotion is also recorded in `BookingHistory`.

## Attendance Flow

Attendance is available after the session has ended.

Staff can mark attendance for bookings.

An Instructor can mark attendance only when they are either:

- the primary instructor of the session, or
- assigned as a co-instructor through `SessionInstructor`.

Attendance actions are recorded in `BookingHistory`.

## Recurring Sessions

Staff can create recurring sessions using the recurring sessions API.

The current implementation supports:

- Daily recurrence
- Weekly recurrence
- Configurable number of occurrences

The recurring-session workflow also checks for scheduling conflicts involving instructors and rooms.

## Security Boundaries

The main security boundary is the server-side API.

Authentication is checked before protected operations are performed, and role-based authorization is applied to Staff and Instructor operations.

Instructor booking and attendance access is additionally scoped to sessions assigned to that instructor.
