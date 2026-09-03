import { requireUser } from "../../../lib/auth";
import { db } from "../../../prisma/db";

export async function GET() {
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

    let sessionIds = null;

    // Instructors can only see their assigned sessions.
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

      const ids = new Set();

      for (const session of primarySessions) {
        ids.add(session.id);
      }

      for (const assignment of coAssignments) {
        ids.add(assignment.sessionId);
      }

      sessionIds = Array.from(ids);
    }

    const totalMembersResult =
      await db.orm.public.Member.aggregate((a) => ({
        total: a.count(),
      }));

    const activeClassesResult =
      await db.orm.public.Class
        .where({
          archived: false,
        })
        .aggregate((a) => ({
          total: a.count(),
        }));

    const now = new Date();

    const upcomingSessionsQuery =
      db.orm.public.Session.where(
        (session) =>
          session.startTime.gte(now.toISOString())
      );

    const upcomingSessionsResult =
      sessionIds
        ? sessionIds.length > 0
          ? await upcomingSessionsQuery
              .where((session) =>
                session.id.in(sessionIds)
              )
              .aggregate((a) => ({
                total: a.count(),
              }))
          : { total: 0 }
        : await upcomingSessionsQuery.aggregate((a) => ({
            total: a.count(),
          }));

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    const todaySessionsQuery =
      db.orm.public.Session.where(
        (session) =>
          session.startTime.gte(
            todayStart.toISOString()
          )
      ).where(
        (session) =>
          session.startTime.lt(
            tomorrowStart.toISOString()
          )
      );

    let todayBookingsQuery = db.orm.public.Booking;

    if (sessionIds) {
      if (sessionIds.length === 0) {
        todayBookingsQuery = null;
      } else {
        todayBookingsQuery = todayBookingsQuery.where(
          (booking) =>
            booking.sessionId.in(sessionIds)
        );
      }
    }

    let todayBookingsResult = { total: 0 };

    if (todayBookingsQuery) {
      const todaySessions = await todaySessionsQuery.all();

      const todaySessionIds = todaySessions.map(
        (session) => session.id
      );

      if (todaySessionIds.length > 0) {
        todayBookingsResult =
          await todayBookingsQuery
            .where((booking) =>
              booking.sessionId.in(todaySessionIds)
            )
            .aggregate((a) => ({
              total: a.count(),
            }));
      }
    }

    let waitlistedQuery = db.orm.public.Booking.where({
      status: "WAITLISTED",
    });

    let attendedQuery = db.orm.public.Booking.where({
      status: "ATTENDED",
    });

    let noShowQuery = db.orm.public.Booking.where({
      status: "NO_SHOW",
    });

    if (sessionIds) {
      if (sessionIds.length > 0) {
        waitlistedQuery = waitlistedQuery.where(
          (booking) =>
            booking.sessionId.in(sessionIds)
        );

        attendedQuery = attendedQuery.where(
          (booking) =>
            booking.sessionId.in(sessionIds)
        );

        noShowQuery = noShowQuery.where(
          (booking) =>
            booking.sessionId.in(sessionIds)
        );
      }
    }

    const waitlistedResult =
      sessionIds?.length === 0
        ? { total: 0 }
        : await waitlistedQuery.aggregate((a) => ({
            total: a.count(),
          }));

    const attendedResult =
      sessionIds?.length === 0
        ? { total: 0 }
        : await attendedQuery.aggregate((a) => ({
            total: a.count(),
          }));

    const noShowResult =
      sessionIds?.length === 0
        ? { total: 0 }
        : await noShowQuery.aggregate((a) => ({
            total: a.count(),
          }));

    return Response.json({
      success: true,
      dashboard: {
        role: user.role,
        totalMembers: Number(totalMembersResult.total),
        activeClasses: Number(activeClassesResult.total),
        upcomingSessions: Number(
          upcomingSessionsResult.total
        ),
        todayBookings: Number(todayBookingsResult.total),
        waitlistedBookings: Number(waitlistedResult.total),
        attendance: {
          attended: Number(attendedResult.total),
          noShow: Number(noShowResult.total),
        },
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