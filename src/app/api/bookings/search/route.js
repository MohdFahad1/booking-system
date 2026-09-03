import { requireUser } from "../../../../lib/auth";
import { db } from "../../../../prisma/db";

export async function GET(request) {
  try {
    const user = await requireUser();

    if (user.role !== "STAFF" && user.role !== "INSTRUCTOR") {
      return Response.json(
        {
          success: false,
          error: "Access denied.",
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim().toLowerCase() || "";
    const classId = searchParams.get("classId");
    const sessionId = searchParams.get("sessionId");
    const status = searchParams.get("status");

    const page = Math.max(
      1,
      Number(searchParams.get("page")) || 1
    );

    const pageSize = Math.min(
      100,
      Math.max(
        1,
        Number(searchParams.get("pageSize")) || 10
      )
    );

    const sortBy = searchParams.get("sortBy") || "createdAt";

    const sortOrder =
      searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    const validSortFields = [
      "createdAt",
      "status",
      "sessionId",
    ];

    if (!validSortFields.includes(sortBy)) {
      return Response.json(
        {
          success: false,
          error: "Invalid sort field.",
        },
        { status: 400 }
      );
    }

    /*
     * Resolve member IDs from name/email search.
     * Only matching members are loaded.
     */
    let matchingMemberIds = null;

    if (search) {
      const matchingMembers = await db.orm.public.Member
        .where((member) =>
          member.name.ilike(`%${search}%`)
        )
        .all();

      const matchingEmailMembers = await db.orm.public.Member
        .where((member) =>
          member.email.ilike(`%${search}%`)
        )
        .all();

      const memberIds = new Set();

      for (const member of matchingMembers) {
        memberIds.add(member.id);
      }

      for (const member of matchingEmailMembers) {
        memberIds.add(member.id);
      }

      matchingMemberIds = Array.from(memberIds);

      if (matchingMemberIds.length === 0) {
        return Response.json({
          success: true,
          bookings: [],
          pagination: {
            page,
            pageSize,
            total: 0,
            totalPages: 0,
          },
        });
      }
    }

    /*
     * Resolve sessions matching class/session filters.
     */
    let matchingSessionIds = null;

    if (classId || sessionId) {
      let sessionsQuery = db.orm.public.Session;

      if (sessionId) {
        sessionsQuery = sessionsQuery.where({
          id: Number(sessionId),
        });
      }

      if (classId) {
        sessionsQuery = sessionsQuery.where({
          classId: Number(classId),
        });
      }

      const sessions = await sessionsQuery.all();

      matchingSessionIds = sessions.map(
        (session) => session.id
      );

      if (matchingSessionIds.length === 0) {
        return Response.json({
          success: true,
          bookings: [],
          pagination: {
            page,
            pageSize,
            total: 0,
            totalPages: 0,
          },
        });
      }
    }

    /*
     * Instructor can only see bookings belonging to
     * sessions where they are primary or co-instructor.
     */
    let instructorSessionIds = null;

    if (user.role === "INSTRUCTOR") {
      const instructor = await db.orm.public.Instructor
        .where({
          userId: user.id,
        })
        .first();

      if (!instructor) {
        return Response.json(
          {
            success: false,
            error: "Instructor profile not found.",
          },
          { status: 404 }
        );
      }

      const primarySessions = await db.orm.public.Session
        .where({
          primaryInstructorId: instructor.id,
        })
        .all();

      const coAssignments =
        await db.orm.public.SessionInstructor
          .where({
            instructorId: instructor.id,
          })
          .all();

      const sessionIds = new Set();

      for (const session of primarySessions) {
        sessionIds.add(session.id);
      }

      for (const assignment of coAssignments) {
        sessionIds.add(assignment.sessionId);
      }

      instructorSessionIds = Array.from(sessionIds);

      if (instructorSessionIds.length === 0) {
        return Response.json({
          success: true,
          bookings: [],
          pagination: {
            page,
            pageSize,
            total: 0,
            totalPages: 0,
          },
        });
      }
    }

    /*
     * Build booking query using only supported Prisma 8
     * contract-runtime methods.
     */
    let bookingQuery = db.orm.public.Booking;

    if (matchingMemberIds) {
      bookingQuery = bookingQuery.where(
        (booking) =>
          booking.memberId.in(matchingMemberIds)
      );
    }

    if (matchingSessionIds) {
      bookingQuery = bookingQuery.where(
        (booking) =>
          booking.sessionId.in(matchingSessionIds)
      );
    }

    if (instructorSessionIds) {
      bookingQuery = bookingQuery.where(
        (booking) =>
          booking.sessionId.in(instructorSessionIds)
      );
    }

    if (status) {
      bookingQuery = bookingQuery.where({
        status,
      });
    }

    /*
     * Get filtered bookings count.
     */
    // const filteredBookings = await bookingQuery.all();

    // const total = filteredBookings.length;

    // /*
    //  * Sort.
    //  */
    // filteredBookings.sort((a, b) => {
    //   let aValue;
    //   let bValue;

    //   if (sortBy === "status") {
    //     aValue = a.status;
    //     bValue = b.status;
    //   } else if (sortBy === "sessionId") {
    //     aValue = a.sessionId;
    //     bValue = b.sessionId;
    //   } else {
    //     aValue = new Date(a.createdAt).getTime();
    //     bValue = new Date(b.createdAt).getTime();
    //   }

    //   if (aValue < bValue) {
    //     return sortOrder === "asc" ? -1 : 1;
    //   }

    //   if (aValue > bValue) {
    //     return sortOrder === "asc" ? 1 : -1;
    //   }

    //   return 0;
    // });

    // /*
    //  * Pagination happens after filtering/sorting.
    //  * Only the requested page is returned to the browser.
    //  */
    // const startIndex = (page - 1) * pageSize;

    // const paginatedBookings = filteredBookings
    //   .slice(startIndex, startIndex + pageSize);


    /*
 * Get filtered bookings count directly from the database.
 */
const countResult = await bookingQuery.aggregate((a) => ({
  total: a.count(),
}));

const total = Number(countResult.total);

/*
 * Sort and paginate directly in the database.
 */
let paginatedQuery = bookingQuery;

if (sortBy === "status") {
  paginatedQuery = paginatedQuery.orderBy((booking) =>
    sortOrder === "asc"
      ? booking.status.asc()
      : booking.status.desc()
  );
} else if (sortBy === "sessionId") {
  paginatedQuery = paginatedQuery.orderBy((booking) =>
    sortOrder === "asc"
      ? booking.sessionId.asc()
      : booking.sessionId.desc()
  );
} else {
  paginatedQuery = paginatedQuery.orderBy((booking) =>
    sortOrder === "asc"
      ? booking.createdAt.asc()
      : booking.createdAt.desc()
  );
}

const paginatedBookings = await paginatedQuery
  .offset((page - 1) * pageSize)
  .limit(pageSize)
  .all();
    /*
     * Load related data only for the current page.
     */
    const result = [];

    for (const booking of paginatedBookings) {
      const member = await db.orm.public.Member
        .where({
          id: booking.memberId,
        })
        .first();

      const session = await db.orm.public.Session
        .where({
          id: booking.sessionId,
        })
        .first();

      if (!member || !session) {
        continue;
      }

      const classItem = await db.orm.public.Class
        .where({
          id: session.classId,
        })
        .first();

      result.push({
        ...booking,
        member,
        session,
        class: classItem,
      });
    }

    return Response.json({
      success: true,
      bookings: result,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
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

    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}