"use client";

import axios from "axios";

export default function TestUserPage() {
  async function makeInstructor() {
    try {
      const response = await axios.patch("/api/users/2", {
        role: "INSTRUCTOR",
      });

      console.log(response.data);
      alert("User updated successfully!");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || "Something went wrong.");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <button
        onClick={makeInstructor}
        className="rounded-md bg-black px-6 py-3 text-white"
      >
        Make User 2 Instructor
      </button>
    </main>
  );
}