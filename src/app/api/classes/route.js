import { requireStaff } from "../../../lib/auth";
import { db } from "../../../prisma/db";

export async function POST(request) {
  try {
    await requireStaff();

    const body = await request.json();

    const {
      title,
      description,
      discipline,
      duration,
      capacity,
    } = body;

    if (!title || !discipline || !duration || !capacity) {
      return Response.json(
        {
          success: false,
          error: "Title, discipline, duration and capacity are required.",
        },
        { status: 400 }
      );
    }

    const newClass = await db.orm.public.Class.create({
      title,
      description: description || null,
      discipline,
      duration: Number(duration),
      capacity: Number(capacity),
      archived: false,
    });

    return Response.json(
      {
        success: true,
        class: newClass,
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

    const classes = await db.orm.public.Class
      .where({ archived: false })
      .all();

    return Response.json({
      success: true,
      classes,
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
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}