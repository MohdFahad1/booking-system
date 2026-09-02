import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "../prisma/db";

export async function getCurrentUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  const email = clerkUser.emailAddresses?.[0]?.emailAddress;

  if (!email) {
    throw new Error("Authenticated Clerk user has no email address.");
  }

  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
    null;

  const existingUser = await db.orm.public.User
    .where({ clerkId: userId })
    .first();

  if (existingUser) {
    return existingUser;
  }

  const user = await db.orm.public.User.create({
    clerkId: userId,
    email,
    name,
    role: "STAFF",
  });

  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Authentication required.");
  }

  return user;
}

export async function requireStaff() {
  const user = await requireUser();

  if (user.role !== "STAFF") {
    throw new Error("Staff access required.");
  }

  return user;
}

export async function requireInstructor() {
  const user = await requireUser();

  if (user.role !== "INSTRUCTOR") {
    throw new Error("Instructor access required.");
  }

  return user;
}