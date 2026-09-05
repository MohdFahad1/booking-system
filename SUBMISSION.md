# Submission

## Links

- **GitHub repository:** https://github.com/MohdFahad1/booking-system
- **Live application:** https://booking-system-chi-coral.vercel.app/

## Notes for the reviewer

The application is deployed on Vercel and uses Neon PostgreSQL for the database.

Please use the demo credentials below to test the two available roles. The Staff account has access to the full management workflow, while the Instructor account is limited to assigned sessions and related booking/attendance actions.

The application has been seeded with demo data so the main workflows can be tested without creating everything from scratch.

## Demo credentials

| Role       | Email                      | Password               |
| ---------- | -------------------------- | ---------------------- |
| Staff      | staff@gmail.com            | Staff@_123456789       |
| Instructor | second_instructor@test.com | Second_Instructor@1234 |

## Stack

| Layer    | What you used                                | Why                                                                 |
| -------- | -------------------------------------------- | ------------------------------------------------------------------- |
| Frontend | Next.js, JavaScript, Tailwind CSS, shadcn/ui | Fast development with a clean component-based UI                    |
| Backend  | Next.js App Router API routes                | Keeps the frontend and server-side application in one project       |
| Database | Neon PostgreSQL with Prisma ORM              | Relational data model with strong constraints and reliable querying |
| Hosting  | Vercel                                       | Simple deployment and native support for Next.js                    |

## Goal checklist

| #   | Goal                                     | Status | Notes                                                                                                                                                                                                        |
| --- | ---------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Accounts and roles                       | Done   | Clerk authentication is used for sign-in. Staff and Instructor roles are stored in the application database, with server-side authorization on protected APIs.                                               |
| 2   | Classes                                  | Done   | Staff can create, edit, archive and restore classes. Archived classes are hidden from the default class view without deleting their sessions or bookings.                                                    |
| 3   | Sessions inside classes                  | Done   | Staff can create, edit and delete sessions with class, date/time, room, duration, capacity and primary instructor. Session duration and capacity can override class defaults.                                |
| 4   | Booking lifecycle with rules             | Done   | Bookings support Booked, Waitlisted, Cancelled, Attended and No Show states. Expired memberships are rejected, capacity is enforced, and cancellation automatically promotes the earliest waitlisted member. |
| 5   | Co-instructors                           | Done   | Staff can add and remove co-instructors. Instructors can see sessions where they are either the primary instructor or a co-instructor.                                                                       |
| 6   | Finding bookings                         | Done   | Staff and instructors can search and filter bookings on the server by member, class, session and status, with sorting and pagination.                                                                        |
| 7   | Recurring schedule and attendance export | Done   | Staff can generate recurring weekly sessions, with overlapping instructor/room sessions skipped. Session attendance can also be exported as CSV.                                                             |
| 8   | Dashboard                                | Done   | The dashboard provides headline booking/session/member metrics, booking status information and attendance information for the system.                                                                        |
| 9   | Booking history                          | Done   | Each booking keeps an immutable history of creation and status changes, including the actor and timestamp.                                                                                                   |
| 10  | Expiring membership alerts               | Done   | Members whose memberships are expired or expiring within seven days appear in the alerts area. Staff can dismiss alerts and renewed memberships can cause alerts to appear again later.                      |

## How much time did you actually spend?

Approximately 12 hours.

## What would you do next, with another 12 hours?

I would focus on improving the overall polish and maintainability of the application. In particular, I would add more automated tests around booking state transitions and recurring-session conflicts, improve error handling and loading states, and further refine the dashboard reporting and user experience.

I would also spend some time reviewing the API and database queries for performance as the amount of booking and session data grows.

## What are you least happy with in this codebase, and why?

The main area I would improve is the amount of client-side UI logic in some of the management pages. Some pages contain a lot of state and request-handling code in a single component. It works correctly, but I would split some of these responsibilities into smaller components and reusable utilities to make the code easier to maintain.

I would also add a more comprehensive automated test suite so that important booking and authorization rules are protected against regressions.
