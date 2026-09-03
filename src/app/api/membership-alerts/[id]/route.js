import { requireStaff } from "../../../../lib/auth";
import { db } from "../../../../prisma/db";

export async function PATCH(request, { params }) {
  const { id } = await params;
  
  try {
    await requireStaff();

    const alertId = Number(id);

    if (!Number.isInteger(alertId) || alertId <= 0) {
      return Response.json(
        {
          success: false,
          error: "Invalid alert ID.",
        },
        { status: 400 }
      );
    }

    const alert = await db.orm.public.MembershipAlert
      .where({
        id: alertId,
      })
      .first();

    if (!alert) {
      return Response.json(
        {
          success: false,
          error: "Membership alert not found.",
        },
        { status: 404 }
      );
    }

    if (alert.dismissedAt) {
      return Response.json(
        {
          success: false,
          error: "Membership alert is already dismissed.",
        },
        { status: 409 }
      );
    }

    const dismissedAt = new Date().toISOString();

    const updatedAlert =
      await db.orm.public.MembershipAlert
        .where({
          id: alertId,
        })
        .update({
          dismissedAt,
        });

    return Response.json({
      success: true,
      message: "Membership alert dismissed successfully.",
      alert: updatedAlert,
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