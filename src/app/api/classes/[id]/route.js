import { requireStaff } from "../../../../lib/auth";
import { db } from "../../../../prisma/db";

export async function PATCH(request, { params }) {
    try {
        await requireStaff();

        const { id } = await params;
        const classId = Number(id);

        if (!Number.isInteger(classId)) {
            return Response.json(
                {
                    success: false,
                    error: "Invalid class ID.",
                },
                { status: 400 }
            );
        }

        const body = await request.json();

        const {
            title,
            description,
            discipline,
            duration,
            capacity,
            archived,
        } = body;

        const existingClass = await db.orm.public.Class
            .where({ id: classId })
            .first();

        if (!existingClass) {
            return Response.json(
                {
                    success: false,
                    error: "Class not found.",
                },
                { status: 404 }
            );
        }

        const updatedClass = await db.orm.public.Class
            .where({ id: classId })
            .update({
                title: title ?? existingClass.title,
                description:
                    description !== undefined
                        ? description
                        : existingClass.description,
                discipline: discipline ?? existingClass.discipline,
                duration: duration ?? existingClass.duration,
                capacity: capacity ?? existingClass.capacity,
                archived: archived ?? existingClass.archived,
            });

        return Response.json({
            success: true,
            class: updatedClass,
        });
    } catch (error) {
        console.error(error);

        if (error.message === "Authentication required.") {
            return Response.json(
                { success: false, error: error.message },
                { status: 401 }
            );
        }

        if (error.message === "Staff access required.") {
            return Response.json(
                { success: false, error: error.message },
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