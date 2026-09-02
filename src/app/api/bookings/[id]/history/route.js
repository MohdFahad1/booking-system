import { requireStaff } from "../../../../../lib/auth";
import { db } from "../../../../../prisma/db";

export async function GET(request, { params }) {
  try {
    await requireStaff();

    const { id } = await params;
    const bookingId = Number(id);

    if (!Number.isInteger(bookingId)) {
      return Response.json(
        {
          success: false,
          error: "Invalid booking ID.",
        },
        { status: 400 }
      );
    }

    const booking = await db.orm.public.Booking
      .where({ id: bookingId })
      .first();

    if (!booking) {
      return Response.json(
        {
          success: false,
          error: "Booking not found.",
        },
        { status: 404 }
      );
    }

    const history = await db.orm.public.BookingHistory
      .where({ bookingId })
      .all();

    history.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime()
    );

    return Response.json({
      success: true,
      history,
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