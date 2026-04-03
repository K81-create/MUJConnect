import { useAuth } from "@/context/auth-context";
import { useBooking } from "@/context/booking-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { Calendar, Clock, MapPin, Scissors, User as UserIcon, Wrench, Sparkles, Paintbrush, Bug, Droplets, Search, ShoppingCart, ChevronDown, Shield, ThumbsUp } from "lucide-react";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";
import { fetchUserBookings } from "@/api/client";
import { useNavigate } from "react-router-dom";
import Chatbot from "@/components/Chatbot";


export function UserDashboard() {
    const { user, logout } = useAuth();
    const [bookings, setBookings] = useState<any[]>([]);
    const navigate = useNavigate();


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
        <div className="min-h-screen bg-gray-50 pb-24 font-sans text-gray-800">
            {/* 1. Top Navbar */}
            <nav className="bg-white border-b sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Left: Logo & Location */}
                        <div className="flex items-center gap-8">
                            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => navigate('/')}>
                                <span className="text-2xl font-black tracking-tighter text-black">Fix<span className="text-green-600">It</span></span>
                            </div>

                        </div>



                        {/* Right: Cart & Profile */}
                        <div className="flex items-center gap-6">
                            <Button variant="ghost" size="sm" className="hidden sm:flex relative rounded-full" onClick={() => navigate('/checkout')}>
                                <ShoppingCart className="w-6 h-6 text-gray-700" />
                            </Button>
                            <div className="flex items-center gap-3">
                                <div className="hidden sm:block text-right">
                                    <p className="text-sm font-semibold">{user?.name || 'User'}</p>
                                    <button onClick={logout} className="text-xs text-red-500 hover:text-red-700 font-medium tracking-wide">Sign Out</button>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold border border-green-200 shadow-sm">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content Layout */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">

                {/* 2. Hero Section */}
                <div className="flex flex-col lg:flex-row gap-12 items-center mb-16">
                    <div className="lg:w-1/2 space-y-6">
                        <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] text-gray-900">
                            Home services at your <br className="hidden lg:block" /><span className="text-green-600">doorstep</span>
                        </h1>
                        <p className="text-lg text-gray-600 max-w-md pt-2">
                            Expert professionals, transparent pricing, and guaranteed satisfaction.
                        </p>
                        <div className="space-y-4 pt-4 border-l-4 border-green-500 pl-5">
                            <div className="flex items-center gap-4 w-max">
                                <div className="bg-green-100 p-2.5 rounded-full text-green-700 shadow-sm">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-800 tracking-wide">Verified Professionals</p>
                                    <p className="text-xs text-gray-500 leading-tight mt-0.5">Background checked and trained</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 w-max">
                                <div className="bg-blue-100 p-2.5 rounded-full text-blue-700 shadow-sm">
                                    <ThumbsUp className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-800 tracking-wide">High Quality Service</p>
                                    <p className="text-xs text-gray-500 leading-tight mt-0.5">Satisfaction guaranteed</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:w-1/2 flex gap-4 w-full justify-center">
                        <img src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&h=600&fit=crop" alt="Cleaning" className="rounded-3xl shadow-lg object-cover h-80 w-[45%]" />
                        <div className="flex flex-col gap-4 w-[45%]">
                            <img src="https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=500&h=290&fit=crop" alt="Repair" className="rounded-3xl shadow-lg object-cover h-[152px] w-full" />
                            <img src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&h=290&fit=crop" alt="Salon" className="rounded-3xl shadow-lg object-cover h-[152px] w-full" />
                        </div>
                    </div>
                </div>

                {/* 3. Service Search Section (Main Categories) */}
                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 mb-16 relative">
                    <h2 className="text-3xl font-bold mb-8 text-center tracking-tight text-gray-900">What are you looking for?</h2>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 justify-items-center">
                        <Link to="/services?category=women" className="group flex flex-col items-center gap-4 text-center w-full">
                            <div className="bg-pink-50 w-24 h-24 rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                                <Scissors className="w-10 h-10 text-pink-600" />
                            </div>
                            <span className="text-sm font-bold text-gray-700 group-hover:text-black">Women's Salon</span>
                        </Link>
                        <Link to="/services?category=men" className="group flex flex-col items-center gap-4 text-center w-full">
                            <div className="bg-blue-50 w-24 h-24 rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                                <UserIcon className="w-10 h-10 text-blue-600" />
                            </div>
                            <span className="text-sm font-bold text-gray-700 group-hover:text-black">Men's Salon</span>
                        </Link>
                        <Link to="/services?category=repair" className="group flex flex-col items-center gap-4 text-center w-full">
                            <div className="bg-orange-50 w-24 h-24 rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                                <Wrench className="w-10 h-10 text-orange-600" />
                            </div>
                            <span className="text-sm font-bold text-gray-700 group-hover:text-black">AC & Appliance</span>
                        </Link>
                        <Link to="/services?category=cleaning" className="group flex flex-col items-center gap-4 text-center w-full">
                            <div className="bg-green-50 w-24 h-24 rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                                <Sparkles className="w-10 h-10 text-green-600" />
                            </div>
                            <span className="text-sm font-bold text-gray-700 group-hover:text-black">Cleaning & Pest</span>
                        </Link>
                        <Link to="/services?category=painting" className="group flex flex-col items-center gap-4 text-center w-full">
                            <div className="bg-purple-50 w-24 h-24 rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                                <Paintbrush className="w-10 h-10 text-purple-600" />
                            </div>
                            <span className="text-sm font-bold text-gray-700 group-hover:text-black">Painting</span>
                        </Link>
                        <Link to="/services?category=water-tank" className="group flex flex-col items-center gap-4 text-center w-full">
                            <div className="bg-cyan-50 w-24 h-24 rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                                <Droplets className="w-10 h-10 text-cyan-600" />
                            </div>
                            <span className="text-sm font-bold text-gray-700 group-hover:text-black">Plumbing & Water</span>
                        </Link>
                    </div>
                </div>

                {/* Dashboard Tabs for Bookings & Profile */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-12 relative overflow-hidden">
                    <Tabs defaultValue="bookings" className="w-full">
                        <TabsList className="mb-8 bg-gray-100 p-1.5 rounded-2xl w-max">
                            <TabsTrigger value="bookings" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-2.5 font-bold text-sm tracking-wide">My Bookings</TabsTrigger>
                            <TabsTrigger value="profile" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-2.5 font-bold text-sm tracking-wide">Profile</TabsTrigger>
                        </TabsList>

                        <TabsContent value="bookings" className="space-y-6">
                            <div className="flex justify-between items-center bg-gray-50 p-5 rounded-2xl mb-6 shadow-inner border border-gray-100">
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-500 font-semibold tracking-wide uppercase">Total Bookings</p>
                                    <p className="text-2xl font-black text-gray-900">{bookings.length}</p>
                                </div>
                                <div className="text-right space-y-1">
                                    <p className="text-sm text-gray-500 font-semibold tracking-wide uppercase">Active Services</p>
                                    <p className="text-2xl font-black text-green-600">{activeServices}</p>
                                </div>
                            </div>

                            {bookings.length === 0 ? (
                                <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                    <div className="bg-gray-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <ShoppingCart className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-2">No bookings yet</h3>
                                    <p className="text-gray-500 font-medium mb-6">Time to book your first service!</p>
                                    <Link to="/services">
                                        <Button className="font-bold tracking-wide rounded-xl px-8 shadow-md">Browse Services</Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid gap-6 md:grid-cols-2">
                                    {bookings.map((booking) => (
                                        <Card key={booking._id || booking.id} className="rounded-2xl border-gray-200 shadow-sm hover:shadow-md transition-shadow bg-white">
                                            <CardContent className="p-6">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="space-y-1">
                                                        <h3 className="font-bold text-lg text-gray-900 line-clamp-1">
                                                            {booking.items && Array.isArray(booking.items)
                                                                ? booking.items.map((i: any) => i.service?.name || i.serviceName).join(", ")
                                                                : booking.serviceName || "Service"}
                                                        </h3>
                                                        <div className="flex items-center text-sm text-gray-500 gap-4 font-medium">
                                                            <span className="flex items-center">
                                                                <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                                                                {booking.date ? format(new Date(booking.date), "MMM d, yyyy") : "Date N/A"}
                                                            </span>
                                                            <span className="flex items-center">
                                                                <Clock className="w-4 h-4 mr-1 text-gray-400" /> {booking.time}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-black text-lg text-gray-900">₹{booking.totalAmount || booking.totalPrice}</p>
                                                    </div>
                                                </div>

                                                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                                    <div className={`text-xs font-bold px-3 py-1.5 rounded-lg inline-block capitalize tracking-wide
                                                    ${booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                            booking.status === 'assigned' ? 'bg-blue-100 text-blue-700' :
                                                                booking.status === 'in-progress' ? 'bg-purple-100 text-purple-700' :
                                                                    'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {booking.status}
                                                    </div>

                                                    {booking.assignedProvider && (
                                                        <div className="flex items-center gap-3">
                                                            <span className="flex items-center text-xs font-semibold text-gray-600">
                                                                <UserIcon className="w-3.5 h-3.5 mr-1" />
                                                                {booking.assignedProvider}
                                                            </span>
                                                            {(booking.status === 'assigned' || booking.status === 'in-progress') && (
                                                                <Link to={`/track/${booking._id || booking.id}`}>
                                                                    <Button size="sm" variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold">
                                                                        <MapPin className="w-3.5 h-3.5 mr-1" /> Track
                                                                    </Button>
                                                                </Link>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="profile">
                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center"><UserIcon className="w-5 h-5 mr-2 text-green-600" /> Profile Details</h3>
                                <div className="space-y-6 max-w-md">
                                    <div className="grid gap-2">
                                        <label className="text-sm font-semibold tracking-wide text-gray-500 uppercase">Full Name</label>
                                        <div className="px-4 py-3 border rounded-xl bg-white shadow-sm font-medium text-gray-800">{user?.name}</div>
                                    </div>
                                    <div className="grid gap-2">
                                        <label className="text-sm font-semibold tracking-wide text-gray-500 uppercase">Email Address</label>
                                        <div className="px-4 py-3 border rounded-xl bg-white shadow-sm font-medium text-gray-800">{user?.email}</div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* Floating Chatbot Component */}
            <Chatbot />
        </div>
    );
}
