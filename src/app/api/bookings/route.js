import { requireStaff } from "../../../lib/auth";
import { db } from "../../../prisma/db";

export async function POST(request) {
  try {
    const actor = await requireStaff();

    const body = await request.json();

    const { memberId, sessionId } = body;

    if (!memberId || !sessionId) {
      return Response.json(
        {
          success: false,
          error: "Member ID and session ID are required.",
        },
        { status: 400 }
      );
    }

    const member = await db.orm.public.Member
      .where({ id: Number(memberId) })
      .first();

    if (!member) {
      return Response.json(
        {
          success: false,
          error: "Member not found.",
        },
        { status: 404 }
      );
    }

    const session = await db.orm.public.Session
      .where({ id: Number(sessionId) })
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

    const expiryDate = new Date(member.membershipExpiryDate);
    const now = new Date();

    if (expiryDate <= now) {
      return Response.json(
        {
          success: false,
          error: "Membership has expired. Member cannot book this session.",
        },
        { status: 400 }
      );
    }

    const existingBooking = await db.orm.public.Booking
      .where({
        memberId: Number(memberId),
        sessionId: Number(sessionId),
      })
      .first();

    if (existingBooking) {
      return Response.json(
        {
          success: false,
          error: "Member already has a booking for this session.",
        },
        { status: 409 }
      );
    }

    const sessionBookings = await db.orm.public.Booking
      .where({
        sessionId: Number(sessionId),
        status: "BOOKED",
      })
      .all();

    const status =
      sessionBookings.length < session.capacity
        ? "BOOKED"
        : "WAITLISTED";

    const booking = await db.orm.public.Booking.create({
      memberId: Number(memberId),
      sessionId: Number(sessionId),
      status,
    });

    await db.orm.public.BookingHistory.create({
      bookingId: booking.id,
      actorUserId: actor.id,
      action: "CREATED",
      oldStatus: null,
      newStatus: status,
      note: null,
    });

    return Response.json(
      {
        success: true,
        booking,
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