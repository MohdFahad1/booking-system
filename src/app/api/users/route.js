import { requireStaff } from "../../../lib/auth";
import { db } from "../../../prisma/db";

export async function GET() {
  try {
    await requireStaff();

    const users = await db.orm.public.User.all();

    return Response.json({
      success: true,
      users,
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