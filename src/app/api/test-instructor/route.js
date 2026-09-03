import { db } from "../../../prisma/db";

export async function POST() {
  try {
    const user = await db.orm.public.User.create({
      clerkId: "user_3InojYHwyDwaFH4wNVhQgunsakU",
      email: "instructor2@test.com",
      name: "Second Instructor",
      role: "INSTRUCTOR",
    });

    const instructor = await db.orm.public.Instructor.create({
      userId: user.id,
      name: "Second Instructor",
      email: "instructor2@test.com",
    });

    return Response.json(
      {
        success: true,
        user,
        instructor,
      },
      { status: 201 }
    );
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