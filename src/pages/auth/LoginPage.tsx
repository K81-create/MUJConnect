import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useAuth, UserRole } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Mail, Lock, Loader2, AlertCircle } from "lucide-react";

export function LoginPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();

    // effectiveRole is controlled by local state, initialized from URL or default 'user'
    const [role, setRole] = useState<UserRole>((searchParams.get("role") as UserRole) || "user");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Update URL when role changes to keep bookmarkable state
    useEffect(() => {
        setSearchParams({ role });
    }, [role, setSearchParams]);

    const roleTitles: Record<UserRole, string> = {
        user: "Welcome Back",
        stakeholder: "Provider Portal",
        admin: "Admin Access",
    };

    const dashboardMap: Record<UserRole, string> = {
        user: "/user/dashboard",
        stakeholder: "/stakeholder/dashboard",
        admin: "/admin/dashboard",
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await login(email, password, role);
            navigate(dashboardMap[role]);
        } catch (error: any) {
            console.error("Login failed", error);
            setError(error.message || "Login failed. Please check your credentials.");
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
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">MUJConnect</h1>
                    <p className="text-slate-500">Professional services at your doorstep</p>
                </div>

                <Card className="border-0 shadow-xl ring-1 ring-slate-900/5 bg-white">
                    <CardHeader className="space-y-1 text-center pb-6">
                        <Tabs value={role} onValueChange={(v) => setRole(v as UserRole)} className="w-full">
                            <TabsList className="grid w-full grid-cols-3 mb-4">
                                <TabsTrigger value="user">User</TabsTrigger>
                                <TabsTrigger value="stakeholder">Provider</TabsTrigger>
                                <TabsTrigger value="admin">Admin</TabsTrigger>
                            </TabsList>
                        </Tabs>

                        <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900 pt-2">
                            {roleTitles[role]}
                        </CardTitle>
                        <CardDescription className="text-slate-500 text-base">
                            Sign in to continue to your account
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleLogin}>
                        <CardContent className="space-y-4 pt-0">
                            {error && (
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}
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
                                        placeholder="••••••••"
                                        className="pl-10 h-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                        value={password}
                                        onChange={(e) => { setPassword(e.target.value); setError(""); }}
                                        required
                                    />
                                </div>
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
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...
                                    </>
                                ) : (
                                    "Sign In"
                                )}
                            </Button>
                            {role !== 'admin' && (
                                <div className="text-center text-sm text-slate-500 mt-2">
                                    Don't have an account?{" "}
                                    <Link
                                        to={`/auth/register?role=${role}`}
                                        className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
                                    >
                                        Create one now
                                    </Link>
                                </div>
                            )}
                        </CardFooter>
                    </form>
                </Card>

                <p className="text-center text-xs text-slate-400">
                    &copy; 2024 Urban Home Services. Secure &amp; Encrypted.
                </p>
            </div>
        </div>
    );
}
