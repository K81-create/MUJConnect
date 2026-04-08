import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useBooking, ConfirmedBooking } from "@/context/booking-context";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Plus, DollarSign, Calendar, Clock, AlertTriangle, CheckCircle, XCircle, MapPin } from "lucide-react";
import { format } from "date-fns";
import { ServiceRegistrationForm } from "@/components/dashboard/ServiceRegistrationForm";
import { EditProfileDialog } from "@/components/dashboard/EditProfileDialog";
import ProviderLocationControl from "@/components/provider/ProviderLocationControl";
import ProviderChat from "@/components/provider/ProviderChat";
import { PauseServiceDialog } from "@/components/dashboard/PauseServiceDialog";

import { socket } from "@/lib/socket";

/* =========================
   INR Formatter
========================= */
const formatINR = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount);

interface ServiceItem {
    name: string;
    price: number;
    _id?: string;
}

interface ProviderProfile {
    _id: string;
    status: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;
    isAvailable: boolean;
    personalDetails: { name: string; phone: string };
    email?: string;
    serviceCategory: string;
    services: ServiceItem[];
    experience: number;
    serviceArea: string;
    pauseStartDate?: string | null;
    pauseEndDate?: string | null;
}

export function StakeholderDashboard() {
    const { user, logout } = useAuth();
    const { confirmedBookings: contextBookings, updateBookingStatus: contextUpdateStatus, addConfirmedBooking } = useBooking();
    const [localBookings, setLocalBookings] = useState<ConfirmedBooking[]>([]);

    // Registration / Profile State
    const [profile, setProfile] = useState<ProviderProfile | null>(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [showPauseDialog, setShowPauseDialog] = useState(false);

    const [services, setServices] = useState<ServiceItem[]>([]);

    // Fetch Profile
    useEffect(() => {
        if (user?.email) {
            setIsLoadingProfile(true);
            fetch(`https://mujconnect-3lj9.onrender.com/api/provider/status/${user.email}`)
                .then(res => {
                    if (res.ok) return res.json();
                    return null;
                })
                .then(data => {
                    if (data) {
                        setProfile(data);
                        // Initialize services from profile safely
                        // Handle potential old data format (string array) vs new (object array)
                        const fetchedServices = data.services?.map((s: any) =>
                            typeof s === 'string' ? { name: s, price: 0 } : s
                        ) || [];
                        setServices(fetchedServices);

                        // Fetch Bookings Specific to this Provider
                        if (data.status === 'approved') {
                            fetchBookingsForProvider(data.personalDetails.name);
                        }
                    }
                    setIsLoadingProfile(false);
                })
                .catch(err => {
                    console.error("Error fetching profile", err);
                    setIsLoadingProfile(false);
                });
        }
    }, [user?.email]);

    const fetchBookingsForProvider = (providerName: string) => {
        fetch(`https://mujconnect-3lj9.onrender.com/api/bookings/provider/${encodeURIComponent(providerName)}`)
            .then(res => res.json())
            .then(data => {
                setLocalBookings(data);
                // Also update context if needed (optional)
                // data.forEach((b: ConfirmedBooking) => addConfirmedBooking(b));
            })
            .catch(err => console.error("Failed to fetch provider bookings", err));
    };

    // Socket Listeners for Status Updates
    useEffect(() => {
        console.log("Setting up socket listeners. Profile:", profile?.personalDetails?.name);

        const registerProvider = () => {
             console.log("Socket connected/registering:", socket.id, profile?.personalDetails?.name);
             if (profile?.personalDetails?.name) {
                 socket.emit("register_provider", profile.personalDetails.name);
             }
        };

        socket.on('connect', registerProvider);
        if (socket.connected) {
            registerProvider();
        }

        socket.on('provider_status_update', (updatedProfile: ProviderProfile) => {
            console.log("Received provider_status_update:", updatedProfile);
            if (profile && profile._id === updatedProfile._id) {
                setProfile(updatedProfile);
                const fetchedServices = updatedProfile.services?.map((s: any) =>
                    typeof s === 'string' ? { name: s, price: 0 } : s
                ) || [];
                setServices(fetchedServices);
            }
        });

        // Listen for booking updates relevant to me
        socket.on('job_updated', (updatedBooking: any) => {
            console.log("Received job_updated:", updatedBooking);
            console.log("Profile Name:", profile?.personalDetails?.name);
            console.log("Booking Assigned Provider:", updatedBooking.assignedProvider);

            if (profile && updatedBooking.assignedProvider === profile.personalDetails.name) {
                console.log("Updating local bookings...");
                setLocalBookings(prev => {
                    const existingIndex = prev.findIndex(b =>
                        (b._id && updatedBooking._id && b._id === updatedBooking._id) ||
                        (b.id && updatedBooking.id && b.id === updatedBooking.id)
                    );

                    if (existingIndex >= 0) {
                        const newBookings = [...prev];
                        newBookings[existingIndex] = updatedBooking;
                        return newBookings;
                    } else {
                        return [updatedBooking, ...prev];
                    }
                });
            } else {
                console.log("Booking update ignored (name mismatch or profile missing)");
            }
        });

        return () => {
            socket.off('connect');
            socket.off('provider_status_update');
            socket.off('job_updated');
        };
    }, [profile]);

    // NEW: Fetch Pending Bookings (Open Marketplace)
    const [pendingBookings, setPendingBookings] = useState<any[]>([]);

    useEffect(() => {
        if (profile?.status === 'approved') {
            fetch('https://mujconnect-3lj9.onrender.com/api/bookings/pending')
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setPendingBookings(data);
                    } else {
                        console.error("Expected array for pending bookings, got:", data);
                        setPendingBookings([]);
                    }
                })
                .catch(err => console.error("Failed to fetch pending bookings", err));
        }
    }, [profile?.status]);

    useEffect(() => {
        if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
            Notification.requestPermission();
        }

        socket.on('new_booking', (booking: any) => {
            if (!profile?.isAvailable) return;
            
            console.log("New booking received:", booking);
            // Optionally filter by service category
            setPendingBookings(prev => [booking, ...prev]);

            if ("Notification" in window && Notification.permission === "granted") {
                const title = "New Job Available!";
                const text = `A new ${booking.service?.name || booking.serviceName || "service"} request was just posted.`;
                new Notification(title, {
                    body: text,
                    icon: "/vite.svg" 
                });
            }
        });

        socket.on('job_updated', (updatedBooking: any) => {
            // If a job is assigned to someone else, remove it from pending logic
            if (updatedBooking.status !== 'pending') {
                setPendingBookings(prev => prev.filter(b => (b.id !== updatedBooking.id && b._id !== updatedBooking._id)));
            }
        });

        return () => {
            socket.off('new_booking');
        };
    }, []);

    const handleRegistrationSubmit = async (data: any) => {
        // Convert initial services list to object array if needed, 
        // though form currently sends string list. Let's fix form later or adapt here.
        // For now, adapter:
        const payload = {
            ...data,
            services: data.services.map((s: string) => ({ name: s, price: 100 })) // Default price
        };

        try {
            const res = await fetch('https://mujconnect-3lj9.onrender.com/api/provider/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                const newProfile = await res.json();
                setProfile(newProfile);
                setServices(newProfile.services);
            } else {
                const errData = await res.json();
                alert(`Registration failed: ${errData.message}`);
            }
        } catch (error) {
            console.error("Registration error", error);
        }
    };

    // Use local bookings for display if we have them (active provider), else empty
    const bookingsToDisplay = localBookings;

    // Calculate stats
    const pendingRequests = bookingsToDisplay.filter(
        (b) => b.status === "assigned" // For provider, 'assigned' is the new 'pending' to act on
    );

    const earnings = bookingsToDisplay
        .filter((b) => b.status === "completed")
        .reduce((sum, b) => sum + b.totalAmount, 0);

    /* =========================
       SERVICE ACTIONS
    ========================= */
    const saveServicesToBackend = async (newServices: ServiceItem[]) => {
        if (!profile) return;
        try {
            const res = await fetch(`https://mujconnect-3lj9.onrender.com/api/provider/${profile._id}/services`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ services: newServices })
            });
            if (!res.ok) {
                console.error("Failed to save services");
            }
        } catch (e) {
            console.error(e);
        }
    };

    const addService = () => {
        const name = prompt("Enter service name");
        const price = prompt("Enter service price (₹)");
        if (!name || !price) return;

        const newService = { name, price: Number(price) };
        const updatedServices = [...services, newService];
        setServices(updatedServices);
        saveServicesToBackend(updatedServices);
    };

    const editService = (index: number) => {
        const service = services[index];
        if (!service) return;
        const name = prompt("Update service name", service.name);
        const price = prompt("Update service price (₹)", service.price.toString());
        if (!name || !price) return;

        const updatedServices = services.map((s, i) => i === index ? { ...s, name, price: Number(price) } : s);
        setServices(updatedServices);
        saveServicesToBackend(updatedServices);
    };

    const deleteService = (index: number) => {
        if (!confirm("Are you sure you want to remove this service?")) return;
        const updatedServices = services.filter((_, i) => i !== index);
        setServices(updatedServices);
        saveServicesToBackend(updatedServices);
    };

    const handleAction = async (id: string, status: ConfirmedBooking["status"]) => {
        console.log(`handleAction called. ID: ${id}, Status: ${status}`);

        // Optimistic update
        if (status === "assigned") {
            if (profile) {
                try {
                    const res = await fetch(`https://mujconnect-3lj9.onrender.com/api/bookings/${id}/assign`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ providerName: profile.personalDetails.name })
                    });

                    if (res.ok) {
                        const updatedBooking = await res.json();
                        // Socket will handle the update via broadcast if setup, 
                        // but let's manually update pending list locally to be snappy
                        setPendingBookings(prev => prev.filter(b => (b.id !== id && b._id !== id)));
                        setLocalBookings(prev => {
                            const existingIndex = prev.findIndex(b =>
                                (b._id && updatedBooking._id && b._id === updatedBooking._id) ||
                                (b.id && updatedBooking.id && b.id === updatedBooking.id)
                            );

                            if (existingIndex >= 0) {
                                const newBookings = [...prev];
                                newBookings[existingIndex] = updatedBooking;
                                return newBookings;
                            } else {
                                return [updatedBooking, ...prev];
                            }
                        });

                        // Emit socket to notify others (Admin/User)
                        socket.emit('job_updated', updatedBooking);
                    } else {
                        alert("Failed to accept job. Please try again.");
                    }
                } catch (error) {
                    console.error("Error accepting job:", error);
                    alert("Network error. Please try again.");
                }
            } else {
                console.error("Cannot assign job: Profile is null");
                alert("Error: Profile not loaded. Cannot accept job.");
            }
        } else {
            console.log(`Emitting update_status: ${status}`);
            setLocalBookings(prev => prev.map(b => (b.id === id || b._id === id) ? { ...b, status } : b));
            socket.emit('update_status', { bookingId: id, status });
        }
    };

    const toggleAvailability = async () => {
        if (!profile) return;
        try {
            const res = await fetch(`https://mujconnect-3lj9.onrender.com/api/provider/availability/${profile._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isAvailable: !profile.isAvailable })
            });
            if (res.ok) {
                const updated = await res.json();
                setProfile(updated);
            }
        } catch (e) {
            console.error(e);
        }
    }

    const handleSchedulePause = async (startDate: string, endDate: string) => {
        if (!profile) return;
        try {
            const res = await fetch(`https://mujconnect-3lj9.onrender.com/api/provider/pause-service`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ providerId: profile._id, startDate, endDate })
            });
            if (res.ok) {
                const updated = await res.json();
                setProfile(updated);
            } else {
                alert("Failed to schedule pause.");
            }
        } catch (e) {
            console.error(e);
            alert("Network error. Please try again.");
        }
    };

    const handleProfileUpdate = async (updatedData: any) => {
        if (!profile) return;
        try {
            const res = await fetch(`https://mujconnect-3lj9.onrender.com/api/provider/${profile._id}/details`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });

            if (res.ok) {
                const updatedProfile = await res.json();
                setProfile(updatedProfile);
            } else {
                console.error("Failed to update profile details");
            }
        } catch (error) {
            console.error("Error updating profile", error);
        }
    };

    if (isLoadingProfile) {
        return <div className="p-8 flex justify-center text-gray-500">Loading profile...</div>;
    }

    // 1. Not Registered -> Show Form
    if (!profile) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Partner Registration</h1>
                    <Button variant="outline" onClick={logout}>Sign Out</Button>
                </div>
                <ServiceRegistrationForm
                    userEmail={user?.email || ''}
                    userName={user?.name || ''}
                    onSubmit={handleRegistrationSubmit}
                />
            </div>
        );
    }

    // 2. Pending -> Show Status
    if (profile.status === 'pending') {
        return (
            <div className="container mx-auto p-6 max-w-2xl text-center space-y-6">
                <div className="flex justify-end">
                    <Button variant="outline" onClick={logout}>Sign Out</Button>
                </div>
                <div className="bg-yellow-50 p-8 rounded-xl border border-yellow-100">
                    <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 mb-4">
                        <Clock size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Application Under Review</h2>
                    <p className="text-gray-600">
                        Thank you for applying to be a service provider. Your application is currently pending approval from our admin team.
                    </p>
                    <div className="mt-6 flex justify-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                            <CheckCircle size={14} className="text-green-500" /> Documents Uploaded
                        </div>
                        <div className="flex items-center gap-1">
                            <CheckCircle size={14} className="text-green-500" /> Profile Submitted
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // 3. Rejected -> Show Reason
    if (profile.status === 'rejected') {
        return (
            <div className="container mx-auto p-6 max-w-2xl text-center space-y-6">
                <div className="flex justify-end">
                    <Button variant="outline" onClick={logout}>Sign Out</Button>
                </div>
                <div className="bg-red-50 p-8 rounded-xl border border-red-100">
                    <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-4">
                        <XCircle size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Application Rejected</h2>
                    <p className="text-gray-600 mb-4">
                        Unfortunately, your application to become a service provider was not approved.
                    </p>
                    {profile.rejectionReason && (
                        <div className="bg-white p-4 rounded-lg text-left text-sm text-gray-700 border border-red-100 inline-block max-w-md">
                            <span className="font-semibold text-red-600">Reason:</span> {profile.rejectionReason}
                        </div>
                    )}
                    <div className="mt-8">
                        <p className="text-sm text-gray-500 mb-4">You may edit and re-submit your application.</p>
                        <Button onClick={() => setProfile(null)}>Re-apply</Button>
                    </div>
                </div>
            </div>
        );
    }

    // 4. Approved -> Show Full Dashboard
    return (
        <div className="container mx-auto p-6 space-y-8">
            {/* HEADER */}
            <div className="flex justify-between items-center">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold">Partner Dashboard</h1>
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium border border-green-200">
                            Verified Partner
                        </span>
                    </div>
                    <p className="text-gray-500">Manage your services and business</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-2 items-end">
                        <div className="flex items-center gap-4 bg-white p-2 px-3 rounded-xl border shadow-sm">
                            <div className="flex flex-col text-right mr-2">
                                <span className={`text-sm font-bold ${profile.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                                    {profile.isAvailable ? 'Active' : 'Paused'}
                                </span>
                                {!profile.isAvailable && profile.pauseEndDate && (
                                    <span className="text-xs text-gray-500 font-medium">
                                        Until {format(new Date(profile.pauseEndDate), "MMM d, yy")}
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={toggleAvailability}
                                className={`
                                    w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out
                                    ${profile.isAvailable ? 'bg-green-500 justify-end' : 'bg-gray-300 justify-start'}
                                `}
                            >
                                <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                            </button>
                        </div>
                        {profile.isAvailable && (
                            <Button variant="outline" size="sm" onClick={() => setShowPauseDialog(true)} className="h-7 text-xs px-2 shadow-sm">
                                Schedule Pause
                            </Button>
                        )}
                    </div>
                    <Button variant="outline" onClick={logout} className="ml-2">
                        Sign Out
                    </Button>
                </div>
            </div>



            {/* PROFILE OVERVIEW (Restored Feature) */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle>Profile Overview</CardTitle>
                    <EditProfileDialog profile={profile} onUpdate={handleProfileUpdate} />
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-4 gap-6">
                        <div>
                            <label className="text-sm text-gray-500 block mb-1">Name</label>
                            <p className="font-semibold text-gray-900">{profile.personalDetails.name}</p>
                        </div>
                        <div>
                            <label className="text-sm text-gray-500 block mb-1">Email</label>
                            <p className="font-semibold text-gray-900">{profile.email || user?.email}</p>
                        </div>
                        <div>
                            <label className="text-sm text-gray-500 block mb-1">Phone Number</label>
                            <p className="font-semibold text-gray-900">{profile.personalDetails.phone}</p>
                        </div>
                        <div>
                            <label className="text-sm text-gray-500 block mb-1">KYC Status</label>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {profile.status.toUpperCase()}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* STATS */}
            <div className="grid md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5" /> Earnings
                        </CardTitle>
                        <CardDescription>Total earnings</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">{formatINR(earnings)}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5" /> Active Jobs
                        </CardTitle>
                        <CardDescription>Assigned to you</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold text-orange-600">
                            {pendingRequests.length}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Service Status</CardTitle>
                        <CardDescription>Total active services</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold text-blue-600">
                            {services.length}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* TABS */}
            <Tabs defaultValue="requests">
                <TabsList>
                    <TabsTrigger value="requests">Live Jobs</TabsTrigger>
                    <TabsTrigger value="services">My Services</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                {/* REQUESTS TAB */}
                <TabsContent value="requests" className="space-y-4">
                    {/* NEW OPPORTUNITIES SECTION */}
                    <div className="mb-8">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            New Opportunities
                        </h2>
                        {!profile.isAvailable ? (
                            <div className="bg-orange-50 border border-orange-100 p-6 rounded-xl text-center">
                                <p className="text-orange-800 font-medium tracking-wide">
                                    Your profile is currently paused. Resume your availability to view and accept new jobs.
                                </p>
                            </div>
                        ) : pendingBookings.length === 0 ? (
                            <p className="text-gray-500 italic">No new jobs available at the moment.</p>
                        ) : (
                            pendingBookings.map((req) => (
                                <Card key={req._id || req.id} className="mb-4 border-l-4 border-l-green-500">
                                    <CardContent className="flex justify-between items-center p-6">
                                        <div>
                                            <h3 className="font-bold text-lg text-green-700">
                                                {req.items?.map((i: any) => i.service?.name || i.serviceName).join(", ")}
                                            </h3>
                                            <p className="text-gray-500">Customer Area: {req.address}</p>
                                            <p className="text-sm font-semibold">{formatINR(req.totalAmount)}</p>
                                        </div>
                                        <Button
                                            onClick={() => {
                                                console.log("Accept Job Clicked:", req._id || req.id);
                                                handleAction(req._id || req.id, "assigned");
                                            }}
                                            className="bg-green-600 hover:bg-green-700 flex-shrink-0 ml-4"
                                        >
                                            Accept Job
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>

                    <h2 className="text-xl font-bold">Assigned Jobs</h2>

                    {bookingsToDisplay.length === 0 ? (
                        <p className="text-gray-500">No active jobs assigned yet.</p>
                    ) : (
                        bookingsToDisplay.map((req) => (
                            <Card key={req.id || req._id} className="relative overflow-hidden">
                                <CardContent className="flex flex-col xl:flex-row justify-between items-start xl:items-center p-6 gap-6">
                                    <div className="flex-1 w-full xl:w-auto">
                                        <h3 className="font-bold text-lg">
                                            {req.items?.map((i: any) => i.service?.name || i.serviceName).join(", ")}
                                        </h3>

                                        <p className="text-gray-500">
                                            Customer: {req.customerName || 'Guest User'}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Address: {req.address}
                                        </p>

                                        <p className="text-sm text-gray-400">
                                            Date:{" "}
                                            {req.date
                                                ? format(new Date(req.date), "MMM d, yyyy")
                                                : "N/A"}{" "}
                                            at {req.time}
                                        </p>

                                        <p className="text-sm font-semibold mt-1">
                                            {formatINR(req.totalAmount)}
                                        </p>

                                        <p className="text-xs mt-1 text-blue-600">
                                            Status: {req.status}
                                        </p>
                                    </div>

                                    {/* ACTION BUTTONS & CHAT/LOCATION DASHBOARD */}
                                    <div className="w-full flex flex-col items-end gap-3 mt-4 lg:mt-0 xl:w-auto">
                                        {req.status === "assigned" && (
                                            <Button
                                                className="bg-purple-600 hover:bg-purple-700"
                                                onClick={() =>
                                                    handleAction(req.id || req._id || "", "in-progress")
                                                }
                                            >
                                                Start Job
                                            </Button>
                                        )}

                                        {req.status === "in-progress" && (
                                            <div className="flex flex-col gap-4 mt-4 bg-gray-50/50 p-4 rounded-xl w-full col-span-full xl:col-span-2 shadow-inner border border-gray-100">
                                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                                    <ProviderLocationControl bookingId={req.id || req._id || ""} />
                                                    <ProviderChat bookingId={req.id || req._id || ""} />
                                                </div>

                                                <Button
                                                    className="bg-green-600 hover:bg-green-700 w-full xl:w-1/2 self-end mt-2 h-12 text-lg shadow-md"
                                                    onClick={() =>
                                                        handleAction(req.id || req._id || "", "completed")
                                                    }
                                                >
                                                    <CheckCircle className="w-5 h-5 mr-3" />
                                                    Job Complete & Stop Sharing
                                                </Button>
                                            </div>
                                        )}
                                        {req.status === "completed" && (
                                            <span className="text-green-600 font-bold border border-green-200 px-3 py-1 rounded">Done</span>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>

                {/* SERVICES TAB */}
                <TabsContent value="services" className="space-y-4">
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex gap-3 text-blue-800 mb-6">
                        <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                        <div className="text-sm">
                            <p className="font-semibold">Approved Service Categories:</p>
                            <p>{profile.serviceCategory}</p>
                            <p className="mt-1 opacity-80">You can only add services within your approved category.</p>
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">Offered Services</h2>
                        <Button onClick={addService}>
                            <Plus className="w-4 h-4 mr-2" /> Add New Service
                        </Button>
                    </div>

                    {services.map((service, index) => (
                        <Card key={index}>
                            <CardContent className="flex justify-between items-center p-6">
                                <div>
                                    <h3 className="font-bold text-lg">{service.name}</h3>
                                    <p className="text-gray-500">
                                        {formatINR(service.price)}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => editService(index)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => deleteService(index)}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>

                {/* HISTORY TAB */}
                <TabsContent value="history">
                    <div className="text-center text-gray-500 py-8">
                        No completion history yet.
                    </div>
                </TabsContent>
            </Tabs>
            <PauseServiceDialog 
                open={showPauseDialog} 
                onOpenChange={setShowPauseDialog} 
                onConfirm={handleSchedulePause} 
            />
        </div >
    );
}