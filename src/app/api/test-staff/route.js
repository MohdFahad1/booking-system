import { requireStaff } from "../../../lib/auth";

export async function GET() {
  try {
    const user = await requireStaff();

    return Response.json({
      success: true,
      message: "Staff access granted.",
      user: {
        id: user.id,
        clerkId: user.clerkId,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 403 }
    );
  }
}