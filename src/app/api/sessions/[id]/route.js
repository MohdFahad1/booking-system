import { requireUser } from "../../../../lib/auth";
import { db } from "../../../../prisma/db";

async function canInstructorAccessSession(instructorId, sessionId) {
  const session = await db.orm.public.Session
    .where({ id: sessionId })
    .first();

  if (!session) {
    return null;
  }

  if (session.primaryInstructorId === instructorId) {
    return session;
  }

  const coInstructor = await db.orm.public.SessionInstructor
    .where({
      sessionId,
      instructorId,
    })
    .first();

  if (coInstructor) {
    return session;
  }

  return false;
}

export async function PATCH(request, { params }) {
  try {
    const user = await requireUser();

    const { id } = await params;
    const sessionId = Number(id);

    if (!Number.isInteger(sessionId)) {
      return Response.json(
        {
          success: false,
          error: "Invalid session ID.",
        },
        { status: 400 }
      );
    }

    const existingSession = await db.orm.public.Session
      .where({ id: sessionId })
      .first();

    if (!existingSession) {
      return Response.json(
        {
          success: false,
          error: "Session not found.",
        },
        { status: 404 }
      );
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

      const access = await canInstructorAccessSession(
        instructor.id,
        sessionId
      );

      if (!access) {
        return Response.json(
          {
            success: false,
            error: "You do not have access to this session.",
          },
          { status: 403 }
        );
      }

      return Response.json(
        {
          success: false,
          error: "Instructors cannot edit sessions.",
        },
        { status: 403 }
      );
    }

    if (user.role !== "STAFF") {
      return Response.json(
        {
          success: false,
          error: "Access denied.",
        },
        { status: 403 }
      );
    }

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

    if (classId !== undefined) {
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
    }

    if (primaryInstructorId !== undefined) {
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
    }

    if (roomId !== undefined) {
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
    }

    const updatedSession = await db.orm.public.Session
      .where({ id: sessionId })
      .update({
        classId:
          classId !== undefined
            ? Number(classId)
            : existingSession.classId,

        primaryInstructorId:
          primaryInstructorId !== undefined
            ? Number(primaryInstructorId)
            : existingSession.primaryInstructorId,

        roomId:
          roomId !== undefined
            ? Number(roomId)
            : existingSession.roomId,

        startTime:
          startTime !== undefined
            ? startTime
            : existingSession.startTime,

        endTime:
          endTime !== undefined
            ? endTime
            : existingSession.endTime,

        duration:
          duration !== undefined
            ? Number(duration)
            : existingSession.duration,

        capacity:
          capacity !== undefined
            ? Number(capacity)
            : existingSession.capacity,
      });

    return Response.json({
      success: true,
      session: updatedSession,
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

export async function DELETE(request, { params }) {
  try {
    const user = await requireUser();

    if (user.role !== "STAFF") {
      return Response.json(
        {
          success: false,
          error: "Staff access required.",
        },
        { status: 403 }
      );
    }

    const { id } = await params;
    const sessionId = Number(id);

    if (!Number.isInteger(sessionId)) {
      return Response.json(
        {
          success: false,
          error: "Invalid session ID.",
        },
        { status: 400 }
      );
    }

    const existingSession = await db.orm.public.Session
      .where({ id: sessionId })
      .first();

    if (!existingSession) {
      return Response.json(
        {
          success: false,
          error: "Session not found.",
        },
        { status: 404 }
      );
    }

    await db.orm.public.Session
      .where({ id: sessionId })
      .delete();

    return Response.json({
      success: true,
      message: "Session deleted successfully.",
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