import { useAuth } from "@/context/auth-context";
import { useBooking } from "@/context/booking-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { Calendar, Clock, MapPin, Scissors, User, Wrench, Sparkles, Paintbrush, Bug, Droplets } from "lucide-react";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";
import { fetchBookings, fetchUserBookings } from "@/api/client";
import { useNavigate } from "react-router-dom";
import { BackgroundSlideshow } from "@/components/ui/BackgroundSlideshow";
import bgCleaning from "@/assests/bg-cleaning.jpg.jpg";
import bgRepair from "@/assests/bg-repair.jpg.jpg";
import bgSalon from "@/assests/bg-salon.jpg.jpg";


export function UserDashboard() {
    const { user, logout } = useAuth();
    const [bookings, setBookings] = useState<any[]>([]);
    // const [trackingBookingId, setTrackingBookingId] = useState<string | null>(null); // Unused now
    const navigate = useNavigate();
    const backgroundImages = [bgCleaning, bgRepair, bgSalon];


    useEffect(() => {
        if (!user?.id) return;

        // Fetch bookings (simulating user specific fetch)
        fetchUserBookings(user.id).then(data => {
            console.log("Fetched bookings:", data);
            if (Array.isArray(data)) {
                setBookings(data);
            } else {
                console.error("Bookings data is not an array:", data);
                setBookings([]);
            }
        }).catch(err => console.error(err));

        socket.on('job_updated', (updatedJob) => {
            setBookings(prev => prev.map(b => b._id === updatedJob._id ? updatedJob : b));
        });

        return () => {
            socket.off('job_updated');
        };
    }, []);

    const activeServices = Array.isArray(bookings) ? bookings.filter(b =>
        b.status === 'pending' ||
        b.status === 'confirmed' ||
        b.status === 'assigned' ||
        b.status === 'in-progress'
    ).length : 0;

    return (
        <div className="min-h-screen relative">
            <BackgroundSlideshow images={backgroundImages} />
            <div className="container mx-auto p-6 space-y-8 relative z-10">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Welcome back, {user?.name}</h1>
                        <p className="text-gray-200">Manage your bookings and profile</p>
                    </div>
                    <div className="flex items-center gap-3">

                        {/* 💬 Chat Button */}
                        <button
                            onClick={() => navigate("/chatbot")}
                            style={{
                                borderRadius: "50%",
                                width: "45px",
                                height: "45px",
                                fontSize: "20px",
                                backgroundColor: "#4CAF50",
                                color: "white",
                                border: "none",
                                cursor: "pointer"
                            }}
                        >
                            💬
                        </button>

                        {/* 🔓 Sign Out */}
                        <Button variant="outline" onClick={logout}>
                            Sign Out
                        </Button>

                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <Card className="bg-blue-50 border-blue-200">
                        <CardHeader>
                            <CardTitle>Total Bookings</CardTitle>
                            <CardDescription>All time service history</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold text-blue-600">{bookings.length}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-50 border-green-200">
                        <CardHeader>
                            <CardTitle>Active Services</CardTitle>
                            <CardDescription>Currently in progress</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold text-green-600">{activeServices}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Need a Service?</CardTitle>
                            <CardDescription>Browse our catalog</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link to="/services">
                                <Button className="w-full">Browse Services</Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-4">
                    <h2 className="text-2xl font-bold">Explore Services</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Link to="/services?category=women">
                            <Card className="hover:bg-gray-50 cursor-pointer h-full transition-colors">
                                <CardContent className="flex flex-col items-center justify-center p-6 space-y-2">
                                    <div className="p-3 rounded-full bg-pink-100 text-pink-600">
                                        <Scissors className="w-6 h-6" />
                                    </div>
                                    <span className="font-semibold">Women's Salon</span>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link to="/services?category=men">
                            <Card className="hover:bg-gray-50 cursor-pointer h-full transition-colors">
                                <CardContent className="flex flex-col items-center justify-center p-6 space-y-2">
                                    <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                                        <User className="w-6 h-6" />
                                    </div>
                                    <span className="font-semibold">Men's Salon</span>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link to="/services?category=repair">
                            <Card className="hover:bg-gray-50 cursor-pointer h-full transition-colors">
                                <CardContent className="flex flex-col items-center justify-center p-6 space-y-2">
                                    <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                                        <Wrench className="w-6 h-6" />
                                    </div>
                                    <span className="font-semibold">Repair</span>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link to="/services?category=cleaning">
                            <Card className="hover:bg-gray-50 cursor-pointer h-full transition-colors">
                                <CardContent className="flex flex-col items-center justify-center p-6 space-y-2">
                                    <div className="p-3 rounded-full bg-green-100 text-green-600">
                                        <Sparkles className="w-6 h-6" />
                                    </div>
                                    <span className="font-semibold">Cleaning</span>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link to="/services?category=painting">
                            <Card className="hover:bg-gray-50 cursor-pointer h-full transition-colors">
                                <CardContent className="flex flex-col items-center justify-center p-6 space-y-2">
                                    <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                                        <Paintbrush className="w-6 h-6" />
                                    </div>
                                    <span className="font-semibold">Painting</span>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link to="/services?category=pest-control">
                            <Card className="hover:bg-gray-50 cursor-pointer h-full transition-colors">
                                <CardContent className="flex flex-col items-center justify-center p-6 space-y-2">
                                    <div className="p-3 rounded-full bg-amber-100 text-amber-600">
                                        <Bug className="w-6 h-6" />
                                    </div>
                                    <span className="font-semibold">Pest Control</span>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link to="/services?category=water-tank">
                            <Card className="hover:bg-gray-50 cursor-pointer h-full transition-colors">
                                <CardContent className="flex flex-col items-center justify-center p-6 space-y-2">
                                    <div className="p-3 rounded-full bg-cyan-100 text-cyan-600">
                                        <Droplets className="w-6 h-6" />
                                    </div>
                                    <span className="font-semibold">Water Tank</span>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>
                </div>

                <Tabs defaultValue="bookings" className="w-full">
                    <TabsList>
                        <TabsTrigger value="bookings">My Bookings</TabsTrigger>
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                    </TabsList>
                    <TabsContent value="bookings" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Booking History</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {bookings.length === 0 ? (
                                        <p className="text-gray-500 text-center py-4">No bookings yet.</p>
                                    ) : (
                                        bookings.map((booking) => (
                                            <div key={booking._id || booking.id} className="p-4 border rounded-lg hover:bg-gray-50">
                                                <div className="flex justify-between items-center">
                                                    <div className="space-y-1">
                                                        <h3 className="font-semibold">
                                                            {booking.items && Array.isArray(booking.items)
                                                                ? booking.items.map((i: any) => i.service?.name || i.serviceName).join(", ")
                                                                : booking.serviceName || "Service"}
                                                        </h3>
                                                        <div className="flex items-center text-sm text-gray-500 gap-4">
                                                            <span className="flex items-center">
                                                                <Calendar className="w-4 h-4 mr-1" />
                                                                {booking.date ? format(new Date(booking.date), "MMM d, yyyy") : "Date N/A"}
                                                            </span>
                                                            <span className="flex items-center">
                                                                <Clock className="w-4 h-4 mr-1" /> {booking.time}
                                                            </span>
                                                        </div>
                                                        {booking.assignedProvider && (
                                                            <div className="mt-2">
                                                                <div className="text-sm text-blue-600 font-medium flex items-center gap-4 mb-2">
                                                                    <span className="flex items-center">
                                                                        <User className="w-3 h-3 mr-1" />
                                                                        Provider: {booking.assignedProvider}
                                                                    </span>
                                                                </div>
                                                                {(booking.status === 'assigned' || booking.status === 'in-progress') && (
                                                                    <Link to={`/track/${booking._id || booking.id}`}>
                                                                        <Button size="sm" variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                                                                            <MapPin className="w-4 h-4 mr-2" /> Track Order
                                                                        </Button>
                                                                    </Link>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <div className={`text-sm font-medium px-2 py-1 rounded-full inline-block mb-1 capitalize
                                                        ${booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                                booking.status === 'assigned' ? 'bg-blue-100 text-blue-700' :
                                                                    booking.status === 'in-progress' ? 'bg-purple-100 text-purple-700' :
                                                                        'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                            {booking.status}
                                                        </div>
                                                        <p className="font-bold">₹{booking.totalAmount || booking.totalPrice}</p>
                                                    </div>
                                                </div>


                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="profile">
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <label className="font-medium">Name</label>
                                    <div className="p-2 border rounded bg-gray-50">{user?.name}</div>
                                </div>
                                <div className="grid gap-2">
                                    <label className="font-medium">Email</label>
                                    <div className="p-2 border rounded bg-gray-50">{user?.email}</div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>


        </div>

    );
}
