import { requireUser } from "../../../../lib/auth";
import { db } from "../../../../prisma/db";

function escapeCsvValue(value) {
  const stringValue = String(value ?? "");

  return `"${stringValue.replace(/"/g, '""')}"`;
}

export async function GET(request) {
  try {
    const user = await requireUser();

    if (user.role !== "STAFF" && user.role !== "INSTRUCTOR") {
      return Response.json(
        {
          success: false,
          error: "Access denied.",
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim().toLowerCase() || "";
    const classId = searchParams.get("classId");
    const sessionId = searchParams.get("sessionId");
    const status = searchParams.get("status");

    const sortBy = searchParams.get("sortBy") || "createdAt";

    const sortOrder =
      searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    const validSortFields = [
      "createdAt",
      "status",
      "sessionId",
    ];

    if (!validSortFields.includes(sortBy)) {
      return Response.json(
        {
          success: false,
          error: "Invalid sort field.",
        },
        { status: 400 }
      );
    }

    /*
     * Resolve member IDs from name/email search.
     */
    let matchingMemberIds = null;

    if (search) {
      const matchingMembers = await db.orm.public.Member
        .where((member) =>
          member.name.ilike(`%${search}%`)
        )
        .all();

      const matchingEmailMembers = await db.orm.public.Member
        .where((member) =>
          member.email.ilike(`%${search}%`)
        )
        .all();

      const memberIds = new Set();

      for (const member of matchingMembers) {
        memberIds.add(member.id);
      }

      for (const member of matchingEmailMembers) {
        memberIds.add(member.id);
      }

      matchingMemberIds = Array.from(memberIds);

      if (matchingMemberIds.length === 0) {
        return new Response("", {
          status: 200,
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition":
              'attachment; filename="bookings.csv"',
          },
        });
      }
    }

    /*
     * Resolve sessions matching class/session filters.
     */
    let matchingSessionIds = null;

    if (classId || sessionId) {
      let sessionsQuery = db.orm.public.Session;

      if (sessionId) {
        sessionsQuery = sessionsQuery.where({
          id: Number(sessionId),
        });
      }

      if (classId) {
        sessionsQuery = sessionsQuery.where({
          classId: Number(classId),
        });
      }

      const sessions = await sessionsQuery.all();

      matchingSessionIds = sessions.map(
        (session) => session.id
      );

      if (matchingSessionIds.length === 0) {
        return new Response("", {
          status: 200,
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition":
              'attachment; filename="bookings.csv"',
          },
        });
      }
    }

    /*
     * Instructor can only export bookings from sessions
     * where they are primary or co-instructor.
     */
    let instructorSessionIds = null;

    if (user.role === "INSTRUCTOR") {
      const instructor = await db.orm.public.Instructor
        .where({
          userId: user.id,
        })
        .first();

      if (!instructor) {
        return Response.json(
          {
            success: false,
            error: "Instructor profile not found.",
          },
          { status: 404 }
        );
      }

      const primarySessions = await db.orm.public.Session
        .where({
          primaryInstructorId: instructor.id,
        })
        .all();

      const coAssignments =
        await db.orm.public.SessionInstructor
          .where({
            instructorId: instructor.id,
          })
          .all();

      const sessionIds = new Set();

      for (const session of primarySessions) {
        sessionIds.add(session.id);
      }

      for (const assignment of coAssignments) {
        sessionIds.add(assignment.sessionId);
      }

      instructorSessionIds = Array.from(sessionIds);

      if (instructorSessionIds.length === 0) {
        return new Response(
          [
            [
              "Booking ID",
              "Member Name",
              "Member Email",
              "Class",
              "Session ID",
              "Start Time",
              "End Time",
              "Status",
              "Created At",
            ]
              .map(escapeCsvValue)
              .join(","),
          ].join("\n"),
          {
            status: 200,
            headers: {
              "Content-Type": "text/csv; charset=utf-8",
              "Content-Disposition":
                'attachment; filename="bookings.csv"',
            },
          }
        );
      }
    }

    /*
     * Build filtered booking query.
     */
    let bookingQuery = db.orm.public.Booking;

    if (matchingMemberIds) {
      bookingQuery = bookingQuery.where(
        (booking) =>
          booking.memberId.in(matchingMemberIds)
      );
    }

    if (matchingSessionIds) {
      bookingQuery = bookingQuery.where(
        (booking) =>
          booking.sessionId.in(matchingSessionIds)
      );
    }

    if (instructorSessionIds) {
      bookingQuery = bookingQuery.where(
        (booking) =>
          booking.sessionId.in(instructorSessionIds)
      );
    }

    if (status) {
      bookingQuery = bookingQuery.where({
        status,
      });
    }

    /*
     * Sort all matching bookings.
     * CSV export intentionally does not paginate.
     */
    if (sortBy === "status") {
      bookingQuery = bookingQuery.orderBy((booking) =>
        sortOrder === "asc"
          ? booking.status.asc()
          : booking.status.desc()
      );
    } else if (sortBy === "sessionId") {
      bookingQuery = bookingQuery.orderBy((booking) =>
        sortOrder === "asc"
          ? booking.sessionId.asc()
          : booking.sessionId.desc()
      );
    } else {
      bookingQuery = bookingQuery.orderBy((booking) =>
        sortOrder === "asc"
          ? booking.createdAt.asc()
          : booking.createdAt.desc()
      );
    }

    const bookings = await bookingQuery.all();

    const rows = [
      [
        "Booking ID",
        "Member Name",
        "Member Email",
        "Class",
        "Session ID",
        "Start Time",
        "End Time",
        "Status",
        "Created At",
      ],
    ];

    for (const booking of bookings) {
      const member = await db.orm.public.Member
        .where({
          id: booking.memberId,
        })
        .first();

      const session = await db.orm.public.Session
        .where({
          id: booking.sessionId,
        })
        .first();

      if (!member || !session) {
        continue;
      }

      const classItem = await db.orm.public.Class
        .where({
          id: session.classId,
        })
        .first();

      rows.push([
        booking.id,
        member.name,
        member.email,
        classItem?.title || "",
        session.id,
        session.startTime,
        session.endTime,
        booking.status,
        booking.createdAt,
      ]);
    }

    const csv = rows
      .map((row) => row.map(escapeCsvValue).join(","))
      .join("\n");

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition":
          'attachment; filename="bookings.csv"',
      },
    });
  } catch (error) {
    console.error(error);

    if (error.message === "Authentication required.") {
      return Response.json(
        {
          success: false,
          error: error.message,
        },
        { status: 401 }
      );
    }

    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}