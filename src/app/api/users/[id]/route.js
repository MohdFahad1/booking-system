import { requireStaff } from "../../../../lib/auth";
import { db } from "../../../../prisma/db";

export async function PATCH(request, { params }) {
  try {
    await requireStaff();

    const { id } = await params;
    const userId = Number(id);

    if (!Number.isInteger(userId)) {
      return Response.json(
        {
          success: false,
          error: "Invalid user ID.",
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { role } = body;

    if (!["STAFF", "INSTRUCTOR"].includes(role)) {
      return Response.json(
        {
          success: false,
          error: "Role must be STAFF or INSTRUCTOR.",
        },
        { status: 400 }
      );
    }

    const existingUser = await db.orm.public.User
      .where({ id: userId })
      .first();

    if (!existingUser) {
      return Response.json(
        {
          success: false,
          error: "User not found.",
        },
        { status: 404 }
      );
    }

    const updatedUser = await db.orm.public.User
      .where({ id: userId })
      .update({
        role,
      });

    return Response.json({
      success: true,
      user: updatedUser,
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