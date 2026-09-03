import { requireStaff } from "../../../lib/auth";
import { db } from "../../../prisma/db";

export async function POST(request) {
  try {
    await requireStaff();

    const body = await request.json();

    const {
      userId,
      name,
      email,
    } = body;

    if (!userId || !name || !email) {
      return Response.json(
        {
          success: false,
          error: "User ID, name and email are required.",
        },
        { status: 400 }
      );
    }

    const user = await db.orm.public.User
      .where({ id: Number(userId) })
      .first();

    if (!user) {
      return Response.json(
        {
          success: false,
          error: "User not found.",
        },
        { status: 404 }
      );
    }

    if (user.role !== "INSTRUCTOR") {
      return Response.json(
        {
          success: false,
          error: "User must have INSTRUCTOR role.",
        },
        { status: 400 }
      );
    }

    const existingInstructor = await db.orm.public.Instructor
      .where({ userId: Number(userId) })
      .first();

    if (existingInstructor) {
      return Response.json(
        {
          success: false,
          error: "Instructor profile already exists for this user.",
        },
        { status: 409 }
      );
    }

    const existingEmail = await db.orm.public.Instructor
      .where({ email })
      .first();

    if (existingEmail) {
      return Response.json(
        {
          success: false,
          error: "Instructor with this email already exists.",
        },
        { status: 409 }
      );
    }

    const instructor = await db.orm.public.Instructor.create({
      userId: Number(userId),
      name,
      email,
    });

    return Response.json(
      {
        success: true,
        instructor,
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
    await requireStaff();

    const instructors = await db.orm.public.Instructor
      .orderBy((instructor) => instructor.name.asc())
      .all();

    return Response.json({
      success: true,
      instructors,
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