import { requireStaff } from "../../../lib/auth";
import { db } from "../../../prisma/db";

export async function POST(request) {
  try {
    await requireStaff();

    const body = await request.json();
    const { name } = body;

    if (!name) {
      return Response.json(
        {
          success: false,
          error: "Room name is required.",
        },
        { status: 400 }
      );
    }

    const existingRoom = await db.orm.public.Room
      .where({ name })
      .first();

    if (existingRoom) {
      return Response.json(
        {
          success: false,
          error: "Room with this name already exists.",
        },
        { status: 409 }
      );
    }

    const room = await db.orm.public.Room.create({
      name,
    });

    return Response.json(
      {
        success: true,
        room,
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

    const rooms = await db.orm.public.Room
      .orderBy((room) => room.name.asc())
      .all();

    return Response.json({
      success: true,
      rooms,
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