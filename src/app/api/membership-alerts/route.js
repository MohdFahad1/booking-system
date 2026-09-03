import { requireStaff } from "../../../lib/auth";
import { db } from "../../../prisma/db";

export async function GET(request) {
  try {
    await requireStaff();

    const { searchParams } = new URL(request.url);

    const days = Math.max(
      0,
      Number(searchParams.get("days")) || 7
    );

    const now = new Date();

    const expiryLimit = new Date(now);
    expiryLimit.setDate(expiryLimit.getDate() + days);

    const members = await db.orm.public.Member
      .where((member) =>
        member.membershipExpiryDate.lte(
          expiryLimit.toISOString()
        )
      )
      .orderBy((member) =>
        member.membershipExpiryDate.asc()
      )
      .all();

    const alerts = [];

    for (const member of members) {
      const expiryDate = new Date(
        member.membershipExpiryDate
      );

      const isExpired = expiryDate < now;

      const existingAlert =
        await db.orm.public.MembershipAlert
          .where({
            memberId: member.id,
            expiryDate: member.membershipExpiryDate,
          })
          .first();

      if (existingAlert?.dismissedAt) {
        continue;
      }

      if (!existingAlert) {
        const alert =
          await db.orm.public.MembershipAlert.create({
            memberId: member.id,
            expiryDate: member.membershipExpiryDate,
          });

        alerts.push({
          ...alert,
          member,
          type: isExpired ? "EXPIRED" : "EXPIRING_SOON",
        });
      } else {
        alerts.push({
          ...existingAlert,
          member,
          type: isExpired ? "EXPIRED" : "EXPIRING_SOON",
        });
      }
    }

    return Response.json({
      success: true,
      alerts,
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