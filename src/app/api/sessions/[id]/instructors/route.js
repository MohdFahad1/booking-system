import { requireStaff } from "../../../../../lib/auth";
import { db } from "../../../../../prisma/db";

export async function POST(request, { params }) {
  try {
    await requireStaff();

    const { id } = await params;
    const sessionId = Number(id);

    if (!Number.isInteger(sessionId)) {
      return Response.json(
        { success: false, error: "Invalid session ID." },
        { status: 400 }
      );
    }

    const session = await db.orm.public.Session
      .where({ id: sessionId })
      .first();

    if (!session) {
      return Response.json(
        { success: false, error: "Session not found." },
        { status: 404 }
      );
    }

    const body = await request.json();
    const instructorId = Number(body.instructorId);

    if (!Number.isInteger(instructorId)) {
      return Response.json(
        { success: false, error: "Valid instructor ID is required." },
        { status: 400 }
      );
    }

    const instructor = await db.orm.public.Instructor
      .where({ id: instructorId })
      .first();

    if (!instructor) {
      return Response.json(
        { success: false, error: "Instructor not found." },
        { status: 404 }
      );
    }

    if (instructorId === session.primaryInstructorId) {
      return Response.json(
        {
          success: false,
          error: "Primary instructor cannot also be a co-instructor.",
        },
        { status: 400 }
      );
    }

    const existing = await db.orm.public.SessionInstructor
      .where({
        sessionId,
        instructorId,
      })
      .first();

    if (existing) {
      return Response.json(
        {
          success: false,
          error: "Instructor is already a co-instructor for this session.",
        },
        { status: 409 }
      );
    }

    const coInstructor = await db.orm.public.SessionInstructor.create({
      sessionId,
      instructorId,
    });

    return Response.json(
      {
        success: true,
        coInstructor,
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
      { success: false, error: error.message },
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
        { success: false, error: "Invalid session ID." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const instructorId = Number(body.instructorId);

    if (!Number.isInteger(instructorId)) {
      return Response.json(
        { success: false, error: "Valid instructor ID is required." },
        { status: 400 }
      );
    }

    const existing = await db.orm.public.SessionInstructor
      .where({
        sessionId,
        instructorId,
      })
      .first();

    if (!existing) {
      return Response.json(
        {
          success: false,
          error: "Co-instructor assignment not found.",
        },
        { status: 404 }
      );
    }

    await db.orm.public.SessionInstructor
      .where({
        sessionId,
        instructorId,
      })
      .delete();

    return Response.json({
      success: true,
      message: "Co-instructor removed successfully.",
    });
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
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}