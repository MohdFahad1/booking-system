import { requireStaff } from "../../../../lib/auth";
import { db } from "../../../../prisma/db";

export async function PATCH(request, { params }) {
  try {
    await requireStaff();

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

    if (error.message === "Staff access required.") {
      return Response.json(
        {
          success: false,
          error: error.message,
        },
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

export async function DELETE(request, { params }) {
  try {
    await requireStaff();

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

    if (error.message === "Staff access required.") {
      return Response.json(
        {
          success: false,
          error: error.message,
        },
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