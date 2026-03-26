import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, Wrench, Droplets, Zap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assests/hero-bg.png";

export function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen relative overflow-hidden bg-slate-50">

            {/* Background */}
            <div className="absolute inset-0 z-0">
                <img src={heroBg} alt="Background" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm"></div>
            </div>

            {/* Soft blobs */}
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-300 rounded-full blur-3xl opacity-10 pointer-events-none z-0"></div>
            <div className="absolute top-1/3 -right-32 w-96 h-96 bg-purple-300 rounded-full blur-3xl opacity-10 pointer-events-none z-0"></div>

            {/* Navbar */}
            <nav className="relative z-10 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto">
                <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                    MUJConnect
                </div>

                <div className="flex gap-3">
                    <Button
                        variant="ghost"
                        className="text-gray-700 hover:text-gray-900"
                        onClick={() => navigate("/auth/login")}
                    >
                        Login
                    </Button>
                    <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => navigate("/auth/register")}
                    >
                        Get Started
                    </Button>
                </div>
            </nav>

            {/* Hero */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 pt-14 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                {/* LEFT */}
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium mb-6">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        The Trusted Platform for Home Services
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
                        Professional Services,
                        <span className="block text-blue-600">
                            Delivered to Your Doorstep.
                        </span>
                    </h1>

                    <p className="text-lg text-gray-600 mt-5 max-w-xl leading-relaxed">
                        Book trusted professionals for cleaning, repairs, and maintenance
                        Or join MUJConnect as a provider and grow your business.
                    </p>

                    <div className="mt-8 flex flex-col sm:flex-row gap-4">
                        <Button
                            size="lg"
                            className="h-14 px-8 text-lg gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20"
                            onClick={() => navigate("/auth/login")}
                        >
                            Login <ArrowRight className="w-5 h-5" />
                        </Button>

                        <Button
                            size="lg"
                            variant="outline"
                            className="h-14 px-8 text-lg border-2"
                            onClick={() => navigate("/auth/register")}
                        >
                            Create Account
                        </Button>
                    </div>

                    {/* Trust badges */}
                    <div className="mt-10 flex flex-col sm:flex-row gap-4 text-gray-600">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                            Verified Providers
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                            Secure Payments
                        </div>
                    </div>


                </div>


                {/* RIGHT (Service Cards) */}
                <div className="grid grid-cols-2 gap-5">
                    <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl shadow-lg p-6">
                        <Sparkles className="w-8 h-8 text-blue-600" />
                        <h3 className="mt-3 font-semibold text-slate-900">Home Cleaning</h3>
                        <p className="text-sm text-slate-500 mt-1">
                            Deep cleaning & sanitization.
                        </p>
                    </div>

                    <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl shadow-lg p-6">
                        <Droplets className="w-8 h-8 text-purple-600" />
                        <h3 className="mt-3 font-semibold text-slate-900">Plumbing</h3>
                        <p className="text-sm text-slate-500 mt-1">
                            Leak fixing & installation.
                        </p>
                    </div>

                    <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl shadow-lg p-6">
                        <Zap className="w-8 h-8 text-yellow-600" />
                        <h3 className="mt-3 font-semibold text-slate-900">Electrician</h3>
                        <p className="text-sm text-slate-500 mt-1">
                            Repairs & wiring services.
                        </p>
                    </div>

                    <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl shadow-lg p-6">
                        <Wrench className="w-8 h-8 text-green-600" />
                        <h3 className="mt-3 font-semibold text-slate-900">Appliance Repair</h3>
                        <p className="text-sm text-slate-500 mt-1">
                            AC, fridge, washing machine.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
