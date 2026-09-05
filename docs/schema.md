# Database Schema

## Overview

The application uses Neon PostgreSQL as the relational database.

The database is designed around the main booking-system entities: users, members, instructors, rooms, classes, sessions, bookings, booking history and membership alerts.

## Entities

### User

Stores application users linked to their Clerk identity.

Main fields:

- `id`
- `clerkId`
- `email`
- `name`
- `role`

Roles:

- `STAFF`
- `INSTRUCTOR`

`clerkId` is used to associate the application user with the corresponding Clerk account.

### Member

Stores gym/class members who can make bookings.

Main fields include:

- `id`
- `name`
- `email`
- `membershipExpiresAt`

A member's membership expiry is checked before creating a booking.

### Instructor

Stores instructor profiles associated with application users.

Main fields include:

- `id`
- `userId`
- `name`

An instructor can be assigned as the primary instructor of a session or as a co-instructor.

### Room

Stores rooms in which sessions take place.

Main fields include:

- `id`
- `name`

Room assignments are also considered when checking scheduling conflicts for recurring sessions.

### Class

Represents the type of class being offered.

Main fields include:

- `id`
- `name`
- `description`
- `durationMinutes`
- `capacity`
- `archived`

Classes can be archived without deleting their existing sessions or booking history.

### Session

Represents a scheduled occurrence of a class.

Main fields include:

- `id`
- `classId`
- `roomId`
- `primaryInstructorId`
- `startTime`
- `endTime`
- `capacity`

A session belongs to a class and can have one primary instructor.

### SessionInstructor

Join table used for co-instructor assignments.

Main fields include:

- `id`
- `sessionId`
- `instructorId`

This creates a many-to-many relationship between sessions and instructors while keeping the primary instructor separately identified on the `Session` record.

### Booking

Represents a member's booking for a session.

Main fields include:

- `id`
- `memberId`
- `sessionId`
- `status`

Booking statuses include:

- `BOOKED`
- `WAITLISTED`
- `CANCELLED`
- `ATTENDED`
- `NO_SHOW`

A unique constraint on the member/session combination prevents duplicate bookings for the same session.

### BookingHistory

Stores the history of booking-related actions.

It records information such as:

- booking
- action/status
- actor user
- timestamp

This provides an audit trail for booking creation, cancellation, waitlist promotion and attendance changes.

### MembershipAlert

Stores alerts related to member membership expiry.

Main fields include:

- `id`
- `memberId`
- `dismissed`
- alert-related timestamps/data

Alerts allow Staff users to identify members whose memberships are expired or approaching expiry.

## Relationships

The main relationships are:

```text
User
 ├── Instructor
 │
 └── BookingHistory (actor)

Member
 ├── Booking
 └── MembershipAlert

Class
 └── Session

Room
 └── Session

Instructor
 ├── Session (primary instructor)
 └── SessionInstructor (co-instructor)

Session
 ├── Booking
 └── SessionInstructor

Booking
 └── BookingHistory
```
