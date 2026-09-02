"use client";

import axios from "axios";
import { useState } from "react";

export default function TestClassPage() {
  const [message, setMessage] = useState("");

  async function archiveClass() {
    try {
      const { data } = await axios.patch("/api/classes/1", {
        archived: true,
      });

      setMessage(JSON.stringify(data, null, 2));
    } catch (error) {
      setMessage(
        JSON.stringify(
          error.response?.data || {
            success: false,
            error: error.message,
          },
          null,
          2
        )
      );
    }
  }


  async function restoreClass() {
  try {
    const { data } = await axios.patch("/api/classes/1", {
      archived: false,
    });

    setMessage(JSON.stringify(data, null, 2));
  } catch (error) {
    setMessage(
      JSON.stringify(
        error.response?.data || {
          success: false,
          error: error.message,
        },
        null,
        2
      )
    );
  }
}

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div>
        <button
          onClick={restoreClass}
          className="rounded-md bg-black px-6 py-3 text-white"
        >
          Restore Test Class
        </button>

        {message && (
          <pre className="mt-6 whitespace-pre-wrap">
            {message}
          </pre>
        )}
      </div>
    </main>
  );
}