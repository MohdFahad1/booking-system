// import { requireStaff } from "../../../lib/auth";
import { requireUser, requireStaff } from "../../../lib/auth";
import { db } from "../../../prisma/db";

export async function POST(request) {
  try {
    await requireStaff();

    const body = await request.json();

    const {
      classId,
      primaryInstructorId,
      roomId,
      startTime,
      endTime,
      duration,
      capacity,
    } = body;

    if (
      !classId ||
      !primaryInstructorId ||
      !roomId ||
      !startTime ||
      !endTime
    ) {
      return Response.json(
        {
          success: false,
          error:
            "Class, primary instructor, room, start time and end time are required.",
        },
        { status: 400 }
      );
    }

    const selectedClass = await db.orm.public.Class
      .where({ id: Number(classId) })
      .first();

    if (!selectedClass) {
      return Response.json(
        {
          success: false,
          error: "Class not found.",
        },
        { status: 404 }
      );
    }

    const instructor = await db.orm.public.Instructor
      .where({ id: Number(primaryInstructorId) })
      .first();

    if (!instructor) {
      return Response.json(
        {
          success: false,
          error: "Primary instructor not found.",
        },
        { status: 404 }
      );
    }

    const room = await db.orm.public.Room
      .where({ id: Number(roomId) })
      .first();

    if (!room) {
      return Response.json(
        {
          success: false,
          error: "Room not found.",
        },
        { status: 404 }
      );
    }

    const newSession = await db.orm.public.Session.create({
      classId: Number(classId),
      primaryInstructorId: Number(primaryInstructorId),
      roomId: Number(roomId),
      startTime,
      endTime,
      duration:
        duration !== undefined
          ? Number(duration)
          : selectedClass.duration,
      capacity:
        capacity !== undefined
          ? Number(capacity)
          : selectedClass.capacity,
    });

    return Response.json(
      {
        success: true,
        session: newSession,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    if (error.message === "Authentication required.") {
      return Response.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    if (error.message === "Staff access required.") {
      return Response.json(
        { success: false, error: error.message },
        { status: 403 }
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

export async function GET() {
  try {
    const user = await requireUser();

    if (user.role === "STAFF") {
      const sessions = await db.orm.public.Session.all();

      return Response.json({
        success: true,
        sessions,
      });
    }

    if (user.role === "INSTRUCTOR") {
      const instructor = await db.orm.public.Instructor
        .where({ userId: user.id })
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

      const coInstructorAssignments =
        await db.orm.public.SessionInstructor
          .where({
            instructorId: instructor.id,
          })
          .all();

      const coSessionIds = coInstructorAssignments.map(
        (assignment) => assignment.sessionId
      );

      const coSessions = [];

      for (const sessionId of coSessionIds) {
        const session = await db.orm.public.Session
          .where({ id: sessionId })
          .first();

        if (session) {
          coSessions.push(session);
        }
      }

      const sessionsMap = new Map();

      for (const session of primarySessions) {
        sessionsMap.set(session.id, session);
      }

      for (const session of coSessions) {
        sessionsMap.set(session.id, session);
      }

      const sessions = Array.from(sessionsMap.values());

      return Response.json({
        success: true,
        sessions,
      });
    }

    return Response.json(
      {
        success: false,
        error: "Access denied.",
      },
      { status: 403 }
    );
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