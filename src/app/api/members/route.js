import { requireStaff } from "../../../lib/auth";
import { db } from "../../../prisma/db";

export async function POST(request) {
  try {
    await requireStaff();

    const body = await request.json();

    const {
      name,
      email,
      membershipExpiryDate,
    } = body;

    if (!name || !email || !membershipExpiryDate) {
      return Response.json(
        {
          success: false,
          error:
            "Name, email and membership expiry date are required.",
        },
        { status: 400 }
      );
    }

    const existingMember = await db.orm.public.Member
      .where({ email })
      .first();

    if (existingMember) {
      return Response.json(
        {
          success: false,
          error: "Member with this email already exists.",
        },
        { status: 409 }
      );
    }

    const member = await db.orm.public.Member.create({
      name,
      email,
      membershipExpiryDate,
    });

    return Response.json(
      {
        success: true,
        member,
      },
      { status: 201 }
    );
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

export async function GET() {
  try {
    await requireStaff();

    const members = await db.orm.public.Member.all();

    return Response.json({
      success: true,
      members,
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