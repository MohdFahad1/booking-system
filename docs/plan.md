# Work Plan

## Objective

Build a class booking system that supports staff management workflows, instructor workflows, session scheduling, booking rules, waitlists, attendance tracking, membership alerts and booking history.

## Implementation Sequence

### 1. Project Setup

- Set up the Next.js application using the App Router.
- Use the `src` directory for application code.
- Configure Tailwind CSS and shadcn/ui.
- Configure Clerk authentication.
- Configure Neon PostgreSQL and Prisma ORM.

### 2. Authentication and Roles

- Integrate Clerk sign-in.
- Create the application `User` record for authenticated users.
- Add Staff and Instructor roles.
- Add server-side authorization helpers for protected operations.

### 3. Core Management

Implement Staff management for:

- Classes
- Rooms
- Members
- Users
- Instructor profiles

Class management includes archiving and restoring classes without removing historical data.

### 4. Session Management

Implement session creation and management with:

- Class
- Date and time
- Room
- Duration
- Capacity
- Primary instructor

Then add:

- Recurring sessions
- Daily and weekly recurrence
- Co-instructor assignments
- Instructor/session conflict handling

### 5. Booking Workflow

Implement the booking lifecycle:

1. Select member and session.
2. Validate that the member exists.
3. Validate membership expiry.
4. Prevent duplicate bookings.
5. Check session capacity.
6. Create a `BOOKED` booking when capacity is available.
7. Create a `WAITLISTED` booking when the session is full.
8. Record the action in booking history.

### 6. Cancellation and Waitlist

Add booking cancellation.

When a booked member cancels:

1. Mark the booking as cancelled.
2. Find the earliest waitlisted booking.
3. Promote that booking to `BOOKED`.
4. Record both actions in booking history.

### 7. Instructor Workflow

Provide instructors with access to:

- Their assigned sessions
- Sessions where they are primary or co-instructor
- Their relevant bookings
- Attendance actions

Attendance authorization checks the instructor's relationship with the session.

### 8. Booking Finder and Export

Add booking search and filtering for Staff and authorized Instructors.

Support filtering by:

- Member
- Class
- Session
- Booking status

Add pagination and sorting.

Add CSV export using the same filtering/scoping rules.

### 9. Attendance and History

Implement attendance states:

- `ATTENDED`
- `NO_SHOW`

Attendance can only be marked after a session has ended.

Record attendance changes in booking history together with the acting user and timestamp.

### 10. Membership Alerts

Implement membership expiry alerts.

The alert workflow identifies:

- Expired memberships
- Memberships approaching expiry

Staff can dismiss alerts from the alerts interface.

### 11. Dashboard

Add dashboard reporting for key operational information, including member, class, session, booking and attendance-related metrics.

### 12. Testing and Deployment

Test the important business workflows manually, including:

- Authentication
- Role-based access
- Class management
- Session management
- Recurring sessions
- Co-instructors
- Booking capacity
- Waitlisting
- Cancellation and promotion
- Membership expiry
- Attendance
- Booking history
- Membership alerts
- CSV export

Finally:

- Build the application successfully.
- Push the completed project to GitHub.
- Configure production environment variables.
- Deploy the application to Vercel.
- Verify Staff and Instructor workflows in production.

## Development Approach

The project was implemented incrementally. Core data and authentication functionality was established first, followed by management workflows, session scheduling, booking rules, instructor functionality, reporting and deployment.

Each meaningful feature was tested before moving to the next stage, and completed stages were committed to Git.
