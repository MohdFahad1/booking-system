import { db } from "../../../prisma/db";

export async function GET() {
  try {
    const users = await db.orm.public.User.all();

    return Response.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}