import { requireStaff } from "../../../../../lib/auth";
import { db } from "../../../../../prisma/db";

export async function PATCH(request, { params }) {
  try {
    const actor = await requireStaff();

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

    if (booking.status !== "BOOKED") {
      return Response.json(
        {
          success: false,
          error: `Cannot mark attendance for a booking with status ${booking.status}.`,
        },
        { status: 400 }
      );
    }

    const session = await db.orm.public.Session
      .where({ id: booking.sessionId })
      .first();

    if (!session) {
      return Response.json(
        {
          success: false,
          error: "Session not found.",
        },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { status, note } = body;

    if (!["ATTENDED", "NO_SHOW"].includes(status)) {
      return Response.json(
        {
          success: false,
          error: "Attendance status must be ATTENDED or NO_SHOW.",
        },
        { status: 400 }
      );
    }

    const sessionEndTime = new Date(session.endTime);
    const now = new Date();

    if (now < sessionEndTime) {
      return Response.json(
        {
          success: false,
          error: "Attendance can only be marked after the session has ended.",
        },
        { status: 400 }
      );
    }

    const updatedBooking = await db.orm.public.Booking
      .where({ id: bookingId })
      .update({
        status,
      });

    await db.orm.public.BookingHistory.create({
      bookingId: booking.id,
      actorUserId: actor.id,
      action: "STATUS_CHANGED",
      oldStatus: "BOOKED",
      newStatus: status,
      note: note || null,
    });

    return Response.json({
      success: true,
      booking: updatedBooking,
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