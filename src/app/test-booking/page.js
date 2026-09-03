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

    async function getBookingHistory() {
        try {
            const response = await axios.get("/api/bookings/5/history");

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

    // async function createSecondInstructor() {
    //     try {
    //         const response = await axios.post("/api/users/2", {
    //             role: "INSTRUCTOR",
    //         });

    //         setResult(response.data);
    //     } catch (error) {
    //         setResult(
    //             error.response?.data || {
    //                 success: false,
    //                 error: "Something went wrong.",
    //             }
    //         );
    //     }
    // }


    // async function createSecondInstructorUser() {
    //     try {
    //         const response = await axios.post("/api/users", {
    //             email: "instructor2@test.com",
    //             name: "Second Instructor",
    //             role: "INSTRUCTOR",
    //         });

    //         setResult(response.data);
    //     } catch (error) {
    //         setResult(
    //             error.response?.data || {
    //                 success: false,
    //                 error: "Something went wrong.",
    //             }
    //         );
    //     }
    // }

    async function createSecondInstructor() {
        try {
            const response = await axios.post("/api/test-instructor");

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


    async function addCoInstructor() {
        try {
            const response = await axios.post("/api/sessions/2/instructors", {
                instructorId: 2,
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

    async function removeCoInstructor() {
        try {
            const response = await axios.delete("/api/sessions/2/instructors", {
                data: {
                    instructorId: 2,
                },
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

    async function testPrimaryAsCoInstructor() {
        try {
            const response = await axios.post("/api/sessions/2/instructors", {
                instructorId: 1,
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

    async function getSessions() {
        try {
            const response = await axios.get("/api/sessions");

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

    async function testInstructorEditSession() {
        try {
            const response = await axios.patch("/api/sessions/2", {
                capacity: 10,
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

    async function testInstructorDeleteSession() {
        try {
            const response = await axios.delete("/api/sessions/2");

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

    async function searchBookings() {
        try {
            const response = await axios.get("/api/bookings/search");

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

    async function createRecurringSessions() {
        try {
            const response = await axios.post("/api/sessions/recurring", {
                classId: 1,
                primaryInstructorId: 1,
                roomId: 1,
                startTime: "2026-09-14T10:00:00.000Z",
                endTime: "2026-09-14T11:15:00.000Z",
                frequency: "WEEKLY",
                occurrences: 3,
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


    async function createDailyRecurringSessions() {
        try {
            const response = await axios.post("/api/sessions/recurring", {
                classId: 1,
                primaryInstructorId: 1,
                roomId: 1,
                startTime: "2026-10-05T10:00:00.000Z",
                endTime: "2026-10-05T11:15:00.000Z",
                frequency: "DAILY",
                occurrences: 3,
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

    async function exportBookingsCsv() {
        try {
            const response = await axios.get("/api/bookings/export", {
                responseType: "blob",
            });

            const blob = new Blob([response.data], {
                type: "text/csv;charset=utf-8;",
            });

            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = "bookings.csv";

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);

            setResult({
                success: true,
                message: "Bookings CSV exported successfully.",
            });
        } catch (error) {
            setResult({
                success: false,
                error: "CSV export failed.",
            });
        }
    }

    async function dismissMembershipAlert() {
        try {
            const response = await axios.patch(
                "/api/membership-alerts/1"
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
            <div className="flex gap-4 flex-wrap">
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

                <button
                    onClick={getBookingHistory}
                    className="rounded-md bg-purple-700 px-6 py-3 text-white"
                >
                    Get Booking History
                </button>


                <button
                    onClick={createSecondInstructor}
                    className="rounded-md bg-blue-700 px-6 py-3 text-white"
                >
                    Create Second Instructor
                </button>


                <button
                    onClick={addCoInstructor}
                    className="rounded-md bg-green-700 px-6 py-3 text-white"
                >
                    Add Co-Instructor
                </button>

                <button
                    onClick={removeCoInstructor}
                    className="rounded-md bg-red-700 px-6 py-3 text-white"
                >
                    Remove Co-Instructor
                </button>

                <button
                    onClick={testPrimaryAsCoInstructor}
                    className="rounded-md bg-yellow-600 px-6 py-3 text-white"
                >
                    Test Primary as Co-Instructor
                </button>


                <button
                    onClick={getSessions}
                    className="rounded-md bg-indigo-700 px-6 py-3 text-white"
                >
                    Get Sessions
                </button>


                <button
                    onClick={testInstructorEditSession}
                    className="rounded-md bg-orange-600 px-6 py-3 text-white"
                >
                    Test Instructor Edit Session
                </button>

                <button
                    onClick={testInstructorDeleteSession}
                    className="rounded-md bg-red-600 px-6 py-3 text-white"
                >
                    Test Instructor Delete Session
                </button>

                <button
                    onClick={searchBookings}
                    className="rounded-md bg-indigo-700 px-6 py-3 text-white"
                >
                    Search Bookings
                </button>

                <button className="rounded-md bg-orange-600 px-6 py-3 text-white cursor-pointer" onClick={createRecurringSessions}>
                    Create Recurring Sessions
                </button>

                <button onClick={createDailyRecurringSessions} className="rounded-md bg-indigo-700 px-6 py-3 text-white cursor-pointer">
                    Create Daily Recurring Sessions
                </button>

                <button onClick={exportBookingsCsv} className="rounded-md bg-red-600 px-6 py-3 text-white cursor-pointer">
                    Export Bookings CSV
                </button>


                <button onClick={dismissMembershipAlert} className="rounded-md bg-yellow-600 px-6 py-3 text-white">
                    Dismiss Membership Alert
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