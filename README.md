# Booking System

A class booking management system built with Next.js. It allows staff to manage classes, sessions, members, instructors, rooms and bookings, while instructors can view their sessions and manage attendance.

## Tech Stack

- Next.js (App Router)
- JavaScript
- Tailwind CSS
- shadcn/ui
- Clerk - authentication
- Neon PostgreSQL - database
- Prisma ORM

## Features

### Staff

- Create and manage classes
- Archive and restore classes
- Create and manage rooms
- Create and manage members
- Manage staff and instructor roles
- Create instructor profiles
- Create one-time sessions
- Create recurring sessions (daily or weekly)
- Add co-instructors to sessions
- Create bookings
- Automatically waitlist members when a session is full
- Cancel bookings and promote the next person from the waitlist
- Search and filter bookings
- Export bookings as CSV
- View booking history
- Manage membership expiry alerts

### Instructor

- View assigned sessions
- View sessions where they are a co-instructor
- View bookings for their sessions
- Mark members as attended or no-show
- Attendance is only allowed after the session has ended

## Authentication & Roles

Authentication is handled using Clerk.

Users are also stored in the application database. Each authenticated Clerk user is linked to a database user record using their Clerk ID.

The application currently supports:

- STAFF
- INSTRUCTOR

Staff users have access to the management sections, while instructors only see the sections related to their sessions and bookings.

## Database

The application uses Neon PostgreSQL with Prisma ORM.

Main entities include:

- User
- Member
- Instructor
- Class
- Session
- Room
- Booking
- BookingHistory
- SessionInstructor
- MembershipAlert

## Booking Rules

Some of the main booking rules implemented in the application:

- A member with an expired membership cannot make a booking.
- A member cannot be booked twice for the same session.
- If a session is full, new bookings are added to the waitlist.
- When a booked member cancels, the earliest waitlisted member is promoted.
- Booking status changes are recorded in booking history.
- Attendance can only be marked after the session has ended.
- Only the primary instructor or an assigned co-instructor can manage attendance for a session.

## Getting Started

### 1. Install dependencies

```bash
npm install
```
