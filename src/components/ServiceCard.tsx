import { Link } from "react-router-dom";
import { Clock, Star } from "lucide-react";
import { Service } from "../types";
import { cn } from "../lib/utils";

interface ServiceCardProps {
  service: Service;
  className?: string;
}

export function ServiceCard({ service, className }: ServiceCardProps) {
  return (
    <Link
      to={`/services/${service.id}`}
      className={cn(
        "group block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md",
        className
      )}
    >
      <div className="mb-4 overflow-hidden rounded-xl">
  <img
    src={service.image}
    alt={service.name}
    className="h-40 w-full object-cover transition-transform group-hover:scale-105"
  />
</div>

      <h3 className="mb-2 text-lg font-semibold text-slate-900 group-hover:text-primary">
        {service.name}
      </h3>
      <p className="mb-4 line-clamp-2 text-sm text-slate-600">
        {service.description}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium text-slate-900">
              {service.rating}
            </span>
            <span className="text-xs text-slate-500">
              ({service.reviewCount})
            </span>
          </div>
          <div className="flex items-center gap-1 text-sm text-slate-500">
            <Clock className="h-4 w-4" />
            <span>{service.duration} min</span>
          </div>
        </div>
        <div className="text-lg font-semibold text-slate-900">
          ₹{service.price}
        </div>
      </div>
    </Link>
  );
}
