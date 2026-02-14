import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Home } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-24 text-center">
      <div className="mb-8">
        <h1 className="mb-4 text-6xl font-bold text-slate-900">404</h1>
        <h2 className="mb-4 text-2xl font-semibold text-slate-700">
          Page Not Found
        </h2>
        <p className="text-slate-500">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>
      <Link to="/">
        <Button size="lg">
          <Home className="mr-2 h-5 w-5" />
          Go Home
        </Button>
      </Link>
    </div>
  );
}
