import { auth } from "@clerk/nextjs/server";
import { SignInButton, UserButton } from "@clerk/nextjs";

export default async function Home() {
  const { userId } = await auth();

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        {!userId ? (
          <>
            <h1 className="text-3xl font-bold mb-6">
              Booking System
            </h1>

            <SignInButton mode="modal">
              <button className="rounded-md bg-black px-6 py-3 text-white">
                Sign In
              </button>
            </SignInButton>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-6">
              Welcome to Booking System
            </h1>

            <UserButton />
          </>
        )}
      </div>
    </main>
  );
}