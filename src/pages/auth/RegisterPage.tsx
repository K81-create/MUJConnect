import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useAuth, UserRole } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, User, Mail, Lock, Loader2, AlertCircle } from "lucide-react";

export function RegisterPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { register } = useAuth();

    // effectiveRole is controlled by local state, initialized from URL or default 'user'
    // If URL has 'admin', we default to 'user' to avoid showing the restricted page immediately unless intended, 
    // but actually the existing logic to block admin registration is good to keep if someone tries.
    // However, for the tabs, we only want User and Stakeholder.
    const urlRole = searchParams.get("role") as UserRole;
    const initialRole = (urlRole === 'user' || urlRole === 'stakeholder') ? urlRole : 'user';

    const [role, setRole] = useState<UserRole>(initialRole);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Update URL when role changes
    useEffect(() => {
        setSearchParams({ role });
    }, [role, setSearchParams]);

    if (urlRole === 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-bold text-slate-900">Admin Registration Restricted</h1>
                    <p className="text-slate-500">Please contact system administrator for access.</p>
                    <Link to="/" className="text-blue-600 hover:underline block">Return Home</Link>
                </div>
            </div>
        )
    }

    const roleTitles: Record<string, string> = {
        user: "Create Account",
        stakeholder: "Partner Join",
    };

    const dashboardMap: Record<UserRole, string> = {
        user: "/user/dashboard",
        stakeholder: "/stakeholder/dashboard",
        admin: "/admin/dashboard",
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Client-side validation
        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        try {
            await register(name, email, password, role);
            navigate(dashboardMap[role]);
        } catch (error: any) {
            console.error("Registration failed", error);
            setError(error.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <Link to="/" className="absolute top-8 left-8 flex items-center text-slate-600 hover:text-slate-900 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
            </Link>

            <div className="w-full max-w-md space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Urban Home</h1>
                    <p className="text-slate-500">Join our community today</p>
                </div>

                <Card className="border-0 shadow-xl ring-1 ring-slate-900/5 bg-white">
                    <CardHeader className="space-y-1 text-center pb-6">
                        <Tabs value={role} onValueChange={(v) => setRole(v as UserRole)} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-4">
                                <TabsTrigger value="user">User</TabsTrigger>
                                <TabsTrigger value="stakeholder">Provider</TabsTrigger>
                            </TabsList>
                        </Tabs>

                        <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900 pt-2">
                            {roleTitles[role]}
                        </CardTitle>
                        <CardDescription className="text-slate-500 text-base">
                            Enter your details to create your account
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleRegister}>
                        <CardContent className="space-y-4 pt-0">
                            {error && (
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-slate-700">Full Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="name"
                                        placeholder="John Doe"
                                        className="pl-10 h-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                        value={name}
                                        onChange={(e) => { setName(e.target.value); setError(""); }}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-700">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        className="pl-10 h-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value); setError(""); }}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-slate-700">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Create a strong password (min. 6 chars)"
                                        className="pl-10 h-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                        value={password}
                                        onChange={(e) => { setPassword(e.target.value); setError(""); }}
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <p className="text-xs text-slate-400">Must be at least 6 characters</p>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4 pt-4">
                            <Button
                                className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-md hover:shadow-lg"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...
                                    </>
                                ) : (
                                    "Create Account"
                                )}
                            </Button>
                            <div className="text-center text-sm text-slate-500 mt-2">
                                Already have an account?{" "}
                                <Link
                                    to={`/auth/login?role=${role}`}
                                    className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
                                >
                                    Sign in instead
                                </Link>
                            </div>
                        </CardFooter>
                    </form>
                </Card>

                <p className="text-center text-xs text-slate-400">
                    &copy; 2024 Urban Home Services. Terms &amp; Privacy.
                </p>
            </div>
        </div>
    );
}
