import { requireStaff } from "../../../../lib/auth";
import { db } from "../../../../prisma/db";

export async function POST(request) {
  try {
    await requireStaff();

    const body = await request.json();

    const {
      classId,
      primaryInstructorId,
      roomId,
      startTime,
      endTime,
      duration,
      capacity,
      frequency,
      occurrences,
    } = body;

    if (
      !classId ||
      !primaryInstructorId ||
      !roomId ||
      !startTime ||
      !endTime ||
      !frequency ||
      !occurrences
    ) {
      return Response.json(
        {
          success: false,
          error:
            "Class, primary instructor, room, start time, end time, frequency and occurrences are required.",
        },
        { status: 400 }
      );
    }

    const numberOfOccurrences = Number(occurrences);

    if (
      !Number.isInteger(numberOfOccurrences) ||
      numberOfOccurrences < 1 ||
      numberOfOccurrences > 100
    ) {
      return Response.json(
        {
          success: false,
          error: "Occurrences must be an integer between 1 and 100.",
        },
        { status: 400 }
      );
    }

    const allowedFrequencies = ["DAILY", "WEEKLY"];

    if (!allowedFrequencies.includes(frequency)) {
      return Response.json(
        {
          success: false,
          error: "Frequency must be DAILY or WEEKLY.",
        },
        { status: 400 }
      );
    }

    const selectedClass = await db.orm.public.Class
      .where({ id: Number(classId) })
      .first();

    if (!selectedClass) {
      return Response.json(
        {
          success: false,
          error: "Class not found.",
        },
        { status: 404 }
      );
    }

    const instructor = await db.orm.public.Instructor
      .where({ id: Number(primaryInstructorId) })
      .first();

    if (!instructor) {
      return Response.json(
        {
          success: false,
          error: "Primary instructor not found.",
        },
        { status: 404 }
      );
    }

    const room = await db.orm.public.Room
      .where({ id: Number(roomId) })
      .first();

    if (!room) {
      return Response.json(
        {
          success: false,
          error: "Room not found.",
        },
        { status: 404 }
      );
    }

    const originalStart = new Date(startTime);
    const originalEnd = new Date(endTime);

    if (
      Number.isNaN(originalStart.getTime()) ||
      Number.isNaN(originalEnd.getTime())
    ) {
      return Response.json(
        {
          success: false,
          error: "Invalid start time or end time.",
        },
        { status: 400 }
      );
    }

    if (originalEnd <= originalStart) {
      return Response.json(
        {
          success: false,
          error: "End time must be after start time.",
        },
        { status: 400 }
      );
    }

    const sessionDuration =
      duration !== undefined
        ? Number(duration)
        : selectedClass.duration;

    const sessionCapacity =
      capacity !== undefined
        ? Number(capacity)
        : selectedClass.capacity;

    if (
      !Number.isInteger(sessionDuration) ||
      sessionDuration <= 0
    ) {
      return Response.json(
        {
          success: false,
          error: "Duration must be a positive integer.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(sessionCapacity) ||
      sessionCapacity <= 0
    ) {
      return Response.json(
        {
          success: false,
          error: "Capacity must be a positive integer.",
        },
        { status: 400 }
      );
    }

    const createdSessions = [];

    for (let index = 0; index < numberOfOccurrences; index++) {
      const sessionStart = new Date(originalStart);
      const sessionEnd = new Date(originalEnd);

      if (frequency === "DAILY") {
        sessionStart.setUTCDate(
          sessionStart.getUTCDate() + index
        );

        sessionEnd.setUTCDate(
          sessionEnd.getUTCDate() + index
        );
      }

      if (frequency === "WEEKLY") {
        sessionStart.setUTCDate(
          sessionStart.getUTCDate() + index * 7
        );

        sessionEnd.setUTCDate(
          sessionEnd.getUTCDate() + index * 7
        );
      }

      const session = await db.orm.public.Session.create({
        classId: Number(classId),
        primaryInstructorId: Number(primaryInstructorId),
        roomId: Number(roomId),
        startTime: sessionStart.toISOString(),
        endTime: sessionEnd.toISOString(),
        duration: sessionDuration,
        capacity: sessionCapacity,
      });

      createdSessions.push(session);
    }

    return Response.json(
      {
        success: true,
        message: `${createdSessions.length} recurring sessions created successfully.`,
        sessions: createdSessions,
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