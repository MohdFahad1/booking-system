"use client";

import axios from "axios";
import { useState } from "react";

export default function TestBookingPage() {
    const [result, setResult] = useState(null);

    async function createSession() {
        try {
            const response = await axios.post("/api/sessions", {
                classId: 1,
                primaryInstructorId: 1,
                roomId: 1,
                startTime: "2026-09-01T10:00:00Z",
                endTime: "2026-09-01T11:15:00Z",
                capacity: 1,
            });

            setResult(response.data);
        } catch (error) {
            setResult(
                error.response?.data || {
                    success: false,
                    error: "Something went wrong.",
                }
            );
        }
    }

    async function createBooking() {
        try {
            const response = await axios.post("/api/bookings", {
                memberId: 1,
                sessionId: 5,
            });

            setResult(response.data);
        } catch (error) {
            setResult(
                error.response?.data || {
                    success: false,
                    error: "Something went wrong.",
                }
            );
        }
    }

    async function createExpiredMember() {
        try {
            const response = await axios.post("/api/members", {
                name: "Expired Member",
                email: "expired@test.com",
                membershipExpiryDate: "2026-01-01T00:00:00Z",
            });

            setResult(response.data);
        } catch (error) {
            setResult(
                error.response?.data || {
                    success: false,
                    error: "Something went wrong.",
                }
            );
        }
    }

    async function createSecondMember() {
        try {
            const response = await axios.post("/api/members", {
                name: "Second Member",
                email: "second@test.com",
                membershipExpiryDate: "2026-12-31T23:59:59Z",
            });

            setResult(response.data);
        } catch (error) {
            setResult(
                error.response?.data || {
                    success: false,
                    error: "Something went wrong.",
                }
            );
        }
    }

    async function cancelBooking() {
        try {
            const response = await axios.patch("/api/bookings/2", {
                status: "CANCELLED",
                note: "Member cancelled the booking.",
            });

            setResult(response.data);
        } catch (error) {
            setResult(
                error.response?.data || {
                    success: false,
                    error: "Something went wrong.",
                }
            );
        }
    }


    async function markAttendance() {
        try {
            const response = await axios.patch(
                "/api/bookings/5/attendance",
                {
                    status: "NO_SHOW",
                note: "Member did not attend the session.",
                }
            );

            setResult(response.data);
        } catch (error) {
            setResult(
                error.response?.data || {
                    success: false,
                    error: "Something went wrong.",
                }
            );
        }
    }

    return (
        <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-6">
            <div className="flex gap-4">
                <button
                    onClick={createSession}
                    className="rounded-md bg-black px-6 py-3 text-white"
                >
                    Create Session
                </button>

                <button
                    onClick={createBooking}
                    className="rounded-md bg-gray-700 px-6 py-3 text-white"
                >
                    Create Booking
                </button>


                <button
                    onClick={createExpiredMember}
                    className="rounded-md bg-red-700 px-6 py-3 text-white"
                >
                    Create Expired Member
                </button>



                <button
                    onClick={createSecondMember}
                    className="rounded-md bg-blue-700 px-6 py-3 text-white"
                >
                    Create Second Member
                </button>


                <button
                    onClick={cancelBooking}
                    className="rounded-md bg-red-700 px-6 py-3 text-white"
                >
                    Cancel Booking 2
                </button>


                <button
                    onClick={markAttendance}
                    className="rounded-md bg-green-700 px-6 py-3 text-white"
                >
                    Mark Attended
                </button>
            </div>

            {result && (
                <pre className="w-full max-w-2xl overflow-auto rounded-md bg-gray-100 p-4 text-sm">
                    {JSON.stringify(result, null, 2)}
                </pre>
            )}
        </main>
    );
}