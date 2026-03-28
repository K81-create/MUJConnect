import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, Wrench, Droplets, Zap, Sparkles, ShieldCheck, Clock, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import Chatbot from "@/components/Chatbot";

export function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#eef2ff] to-[#f9fafb] font-sans text-slate-800 overflow-x-hidden selection:bg-blue-200">
            {/* 1. Navbar */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
                <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md">
                            M
                        </div>
                        <span className="text-2xl font-black tracking-tight text-slate-900">
                            MUJ<span className="text-blue-600">Connect</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            className="font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors hidden sm:flex"
                            onClick={() => navigate("/auth/login")}
                        >
                            Login
                        </Button>
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-200 transition-all rounded-xl px-6"
                            onClick={() => navigate("/auth/register")}
                        >
                            Get Started
                        </Button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 pb-24">
                {/* 2. Hero Section */}
                <div className="pt-16 pb-12 lg:pt-24 lg:pb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center animate-in fade-in duration-700 slide-in-from-bottom-8">
                    {/* LEFT */}
                    <div className="space-y-8 relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-slate-100 text-blue-700 text-sm font-semibold">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
                            </span>
                            The #1 Home Services Platform
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                            Professional Services at Your <br className="hidden sm:block"/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500">Doorstep</span>
                        </h1>

                        <p className="text-lg text-slate-600 max-w-lg leading-relaxed font-medium">
                            Book trusted, reliable, and verified professionals for cleaning, repairs, and maintenance. Satisfaction guaranteed.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Button
                                size="lg"
                                className="h-14 px-8 text-lg font-bold gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/20 rounded-xl transition-all hover:scale-[1.02]"
                                onClick={() => navigate("/auth/register")}
                            >
                                Create Account <ArrowRight className="w-5 h-5" />
                            </Button>

                            <Button
                                size="lg"
                                variant="outline"
                                className="h-14 px-8 text-lg font-bold border-2 border-slate-200 hover:border-blue-600 hover:text-blue-600 hover:bg-transparent rounded-xl transition-all"
                                onClick={() => navigate("/auth/login")}
                            >
                                Login
                            </Button>
                        </div>
                    </div>

                    {/* RIGHT (Image Collage) */}
                    <div className="relative h-[500px] w-full hidden lg:block">
                        <div className="absolute top-4 right-0 w-[80%] h-[90%] bg-blue-100 rounded-[2.5rem] transform rotate-3 transition-transform duration-700 hover:rotate-6"></div>
                        <img 
                            src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80" 
                            alt="Cleaning Professional" 
                            className="absolute top-10 right-6 w-[80%] h-[85%] object-cover rounded-[2rem] shadow-2xl transform transition-transform hover:-translate-y-2 duration-500 border-4 border-white" 
                        />
                        <div className="absolute bottom-16 left-4 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-4 animate-bounce shrink-0 border border-slate-50">
                            <div className="bg-green-100 p-3 rounded-full text-green-600">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-900">4.8/5 Rating</p>
                                <p className="text-sm text-slate-500 font-medium">Based on 10k+ reviews</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Popular Services Section */}
                <div className="py-12 border-t border-slate-200 animate-in fade-in duration-1000 delay-300">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 text-center lg:text-left">Popular Searches</p>
                    <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                        {['AC Repair', 'Home Cleaning', 'Women\'s Salon', 'Men\'s Haircut', 'Plumbing', 'Electrician', 'Pest Control'].map((service) => (
                            <button 
                                key={service} 
                                onClick={() => navigate('/services')}
                                className="px-5 py-2.5 rounded-full bg-white border border-slate-200 shadow-sm text-slate-700 font-semibold hover:border-blue-500 hover:text-blue-600 hover:shadow-md transition-all duration-200"
                            >
                                {service}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 4. Service Cards */}
                <div className="py-16">
                    <div className="flex justify-between items-end mb-10">
                        <div>
                            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Top Categories</h2>
                            <p className="text-slate-500 mt-2 font-medium">Expert services for every need</p>
                        </div>
                        <Button variant="ghost" className="text-blue-600 font-bold hidden sm:flex hover:bg-blue-50" onClick={() => navigate('/services')}>
                            View All <ArrowRight className="w-4 h-4 ml-2 gap-1" />
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: Sparkles, color: 'text-blue-600', bg: 'bg-blue-50', title: 'Home Cleaning', desc: 'Deep cleaning & sanitization.' },
                            { icon: Droplets, color: 'text-cyan-600', bg: 'bg-cyan-50', title: 'Plumbing', desc: 'Leak fixing & installation.' },
                            { icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-50', title: 'Electrician', desc: 'Repairs & wiring services.' },
                            { icon: Wrench, color: 'text-green-600', bg: 'bg-green-50', title: 'Appliance Repair', desc: 'AC, fridge, washing machine.' },
                        ].map((category, idx) => (
                            <div key={idx} className="bg-white rounded-[1.5rem] p-8 shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group" onClick={() => navigate('/services')}>
                                <div className={`${category.bg} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    <category.icon className={`w-8 h-8 ${category.color}`} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{category.title}</h3>
                                <p className="text-slate-500 font-medium">{category.desc}</p>
                            </div>
                        ))}
                    </div>
                    {/* Mobile View All Button */}
                    <div className="mt-8 text-center sm:hidden">
                        <Button variant="outline" className="text-blue-600 font-bold border-blue-200" onClick={() => navigate('/services')}>
                            View All Categories
                        </Button>
                    </div>
                </div>

                {/* 5. Why Choose Us Section */}
                <div className="py-16 mt-8 bg-blue-600 rounded-[2.5rem] px-8 lg:px-16 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-400 opacity-20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
                    
                    <div className="relative z-10 text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">Why Choose MUJConnect?</h2>
                        <p className="text-blue-100 max-w-2xl mx-auto text-base font-medium">We bring the best professionals directly to your home with guaranteed quality, fast booking, and transparent pricing.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 text-center hover:bg-white/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                            <ShieldCheck className="w-10 h-10 text-green-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-2">Verified Pros</h3>
                            <p className="text-blue-50 text-sm font-medium leading-relaxed">Every partner goes through strict background checks and skill verification.</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 text-center hover:bg-white/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                            <Tag className="w-10 h-10 text-yellow-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-2">Affordable Pricing</h3>
                            <p className="text-blue-50 text-sm font-medium leading-relaxed">Clear, upfront pricing with no hidden charges. You pay exactly what you see.</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 text-center hover:bg-white/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                            <Clock className="w-10 h-10 text-pink-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-2">Fast Booking</h3>
                            <p className="text-blue-50 text-sm font-medium leading-relaxed">Book a service seamlessly in under 60 seconds and get instant confirmations.</p>
                        </div>
                    </div>
                </div>

            </main>

            {/* Floating Chatbot Component */}
            <Chatbot />
        </div>
    );
}
