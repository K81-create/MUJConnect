import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Briefcase, Calendar, Check, X, ShieldAlert, Activity } from "lucide-react";
import { fetchBookings } from "@/api/client";
import { socket } from "@/lib/socket";
import { format } from "date-fns";
import { AdminRequestsTable } from "@/components/dashboard/AdminRequestsTable";
import { ApprovedProvidersList } from "@/components/dashboard/ApprovedProvidersList";

export function AdminDashboard() {
    const { logout } = useAuth();
    const [bookings, setBookings] = useState<any[]>([]);

    // Provider Management State
    const [providerRequests, setProviderRequests] = useState<any[]>([]);
    const [activeProviders, setActiveProviders] = useState<any[]>([]);

    useEffect(() => {
        // Load initial data
        fetchBookings().then(setBookings).catch(console.error);
        fetchRequests();
        fetchProviders();

        // Join Admin Room
        socket.emit("join_admin");

        // Listen for new bookings
        socket.on("new_booking", (booking) => {
            setBookings(prev => [booking, ...prev]);
        });

        // Listen for updates (assignments, status changes)
        socket.on("job_updated", (updatedBooking) => {
            setBookings(prev => prev.map(b => b._id === updatedBooking._id ? updatedBooking : b));
        });

        // Listen for new provider requests
        socket.on("new_provider_request", (profile) => {
            if (profile.status === 'pending') {
                setProviderRequests(prev => {
                    // Update existing if present (re-application) or add new
                    const exists = prev.find(p => p._id === profile._id);
                    if (exists) return prev.map(p => p._id === profile._id ? profile : p);
                    return [profile, ...prev];
                });
            }
        });

        return () => {
            socket.off("new_booking");
            socket.off("job_updated");
            socket.off("new_provider_request");
        };
    }, []);

    const fetchRequests = () => {
        fetch('https://mujconnect-3lj9.onrender.com/api/admin/requests')
            .then(res => res.json())
            .then(setProviderRequests)
            .catch(console.error);
    };

    const fetchProviders = () => {
        fetch('https://mujconnect-3lj9.onrender.com/api/admin/providers')
            .then(res => res.json())
            .then(setActiveProviders)
            .catch(console.error);
    };

    const handleAssign = async (bookingId: string) => {
        const providerName = prompt("Enter Provider Name (Simulated Selection):", "John Service");
        if (providerName) {
            try {
                const res = await fetch(`https://mujconnect-3lj9.onrender.com/api/bookings/${bookingId}/assign`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ providerName })
                });

                if (res.ok) {
                    const updatedBooking = await res.json();
                    setBookings(prev => prev.map(b => b._id === bookingId ? updatedBooking : b));
                    // Socket broadcast from server will handle other clients, we update local state immediately
                } else {
                    const errData = await res.json();
                    alert(errData.message || "Failed to assign provider");
                }
            } catch (e) {
                console.error(e);
                alert("Network error assigning provider");
            }
        }
    };

    const handleStatusUpdate = (bookingId: string, status: string) => {
        socket.emit("update_status", { bookingId, status });
    };

    // Provider Actions
    const handleApproveProvider = async (id: string) => {
        try {
            const res = await fetch(`https://mujconnect-3lj9.onrender.com/api/admin/request/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'approved' })
            });
            if (res.ok) {
                const updated = await res.json();
                // Remove from pending
                setProviderRequests(prev => prev.filter(p => p._id !== id));
                // Add to active
                setActiveProviders(prev => [...prev, updated]);
                // Notify via socket is handled by server, but we update UI locally
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleRejectProvider = async (id: string, reason: string) => {
        try {
            const res = await fetch(`https://mujconnect-3lj9.onrender.com/api/admin/request/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'rejected', rejectionReason: reason })
            });
            if (res.ok) {
                // Remove from pending
                setProviderRequests(prev => prev.filter(p => p._id !== id));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleToggleProviderStatus = async (id: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`https://mujconnect-3lj9.onrender.com/api/provider/availability/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isAvailable: !currentStatus })
            });
            if (res.ok) {
                const updated = await res.json();
                setActiveProviders(prev => prev.map(p => p._id === id ? updated : p));
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Admin Portal</h1>
                    <p className="text-gray-500">Live Operation Center</p>
                </div>
                <Button variant="outline" onClick={logout}>Sign Out</Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-blue-600" /> Total Operations
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-sm text-gray-500">Live Bookings</p>
                                <p className="text-3xl font-bold text-blue-600">{bookings.length}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Providers Online</p>
                                <p className="text-xl font-bold text-gray-700 text-right">{activeProviders.filter(p => p.isAvailable).length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-orange-600" /> Pending Approvals
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold text-orange-600">
                            {providerRequests.length}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-green-600" /> Total Providers
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold text-green-600">
                            {activeProviders.length}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="operations">
                <TabsList>
                    <TabsTrigger value="operations">Live Operations</TabsTrigger>
                    <TabsTrigger value="requests">
                        Provider Requests
                        {providerRequests.length > 0 && (
                            <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{providerRequests.length}</span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="providers">Active Providers</TabsTrigger>
                </TabsList>

                <TabsContent value="operations">
                    <Card>
                        <CardHeader>
                            <CardTitle>Live Booking Feed</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="p-4 font-medium">Service</th>
                                            <th className="p-4 font-medium">Customer</th>
                                            <th className="p-4 font-medium">Date/Time</th>
                                            <th className="p-4 font-medium">Status</th>
                                            <th className="p-4 font-medium">Provider</th>
                                            <th className="p-4 font-medium">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bookings.map(booking => (
                                            <tr key={booking._id || booking.id} className="border-t hover:bg-gray-50 transition-colors">
                                                <td className="p-4">
                                                    {booking.items?.[0]?.serviceName || "Service"}
                                                    {booking.items?.length > 1 && ` +${booking.items.length - 1} more`}
                                                </td>
                                                <td className="p-4">Guest User</td> {/* Auth not fully linked to ID yet */}
                                                <td className="p-4">
                                                    {booking.date ? format(new Date(booking.date), "MMM d") : "N/A"} at {booking.time}
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                                        ${booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            booking.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                                                                booking.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                                                        {booking.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-sm text-gray-600">
                                                    {booking.assignedProvider || "-"}
                                                </td>
                                                <td className="p-4">
                                                    {booking.status === 'pending' || booking.status === 'confirmed' ? (
                                                        <Button size="sm" onClick={() => handleAssign(booking._id || booking.id)}>
                                                            Assign Provider
                                                        </Button>
                                                    ) : booking.status === 'assigned' ? (
                                                        <Button
                                                            size="sm"
                                                            variant="secondary"
                                                            className="bg-purple-100 text-purple-700 hover:bg-purple-200"
                                                            onClick={() => handleStatusUpdate(booking._id || booking.id, 'in-progress')}
                                                        >
                                                            Start Job
                                                        </Button>
                                                    ) : booking.status === 'in-progress' ? (
                                                        <Button
                                                            size="sm"
                                                            className="bg-green-600 hover:bg-green-700"
                                                            onClick={() => handleStatusUpdate(booking._id || booking.id, 'completed')}
                                                        >
                                                            Complete Job
                                                        </Button>
                                                    ) : (
                                                        <span className="text-gray-400 text-sm">Completed</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="requests">
                    <Card>
                        <CardHeader>
                            <CardTitle>Stakeholder Applications</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <AdminRequestsTable
                                requests={providerRequests}
                                onApprove={handleApproveProvider}
                                onReject={handleRejectProvider}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="providers">
                    <Card>
                        <CardHeader>
                            <CardTitle>Managed Service Providers</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ApprovedProvidersList
                                providers={activeProviders}
                                onToggleStatus={handleToggleProviderStatus}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
