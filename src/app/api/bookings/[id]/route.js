import { requireStaff } from "../../../../lib/auth";
import { db } from "../../../../prisma/db";

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

    const body = await request.json();
    const { status, note } = body;

    if (status !== "CANCELLED") {
      return Response.json(
        {
          success: false,
          error: "Only cancellation is supported by this endpoint.",
        },
        { status: 400 }
      );
    }

    if (!["BOOKED", "WAITLISTED"].includes(booking.status)) {
      return Response.json(
        {
          success: false,
          error: `Cannot cancel a booking with status ${booking.status}.`,
        },
        { status: 400 }
      );
    }

    const updatedBooking = await db.orm.public.Booking
      .where({ id: bookingId })
      .update({
        status: "CANCELLED",
      });

    await db.orm.public.BookingHistory.create({
      bookingId: booking.id,
      actorUserId: actor.id,
      action: "STATUS_CHANGED",
      oldStatus: booking.status,
      newStatus: "CANCELLED",
      note: note || null,
    });

    let promotedBooking = null;

    if (booking.status === "BOOKED") {
      const waitlistedBookings = await db.orm.public.Booking
        .where({
          sessionId: booking.sessionId,
          status: "WAITLISTED",
        })
        .all();

      if (waitlistedBookings.length > 0) {
        waitlistedBookings.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() -
            new Date(b.createdAt).getTime()
        );

        const earliestWaitlisted = waitlistedBookings[0];

        promotedBooking = await db.orm.public.Booking
          .where({ id: earliestWaitlisted.id })
          .update({
            status: "BOOKED",
          });

        await db.orm.public.BookingHistory.create({
          bookingId: earliestWaitlisted.id,
          actorUserId: actor.id,
          action: "STATUS_CHANGED",
          oldStatus: "WAITLISTED",
          newStatus: "BOOKED",
          note: "Automatically promoted from waitlist after a booked slot was cancelled.",
        });
      }
    }

    return Response.json({
      success: true,
      booking: updatedBooking,
      promotedBooking,
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