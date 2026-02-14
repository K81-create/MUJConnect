import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Button } from "../components/ui/button";

export function BookingConfirmedPage() {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-12 text-center">
            <div className="mb-6 rounded-full bg-green-100 p-6">
                <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <h1 className="mb-4 text-3xl font-bold text-slate-900">Booking Confirmed!</h1>
            <p className="mb-8 max-w-md text-slate-600">
                Your service has been successfully booked. You can view the details in your dashboard.
                Our service provider will contact you shortly.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
                <Button
                    onClick={() => navigate("/user/dashboard")}
                    className="min-w-[200px]"
                >
                    Go to Dashboard
                </Button>
                <Button
                    variant="outline"
                    onClick={() => navigate("/services")}
                    className="min-w-[200px]"
                >
                    Book Another Service
                </Button>
            </div>
        </div>
    );
}
