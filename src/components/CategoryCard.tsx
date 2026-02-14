import { Link } from "react-router-dom";
import { Category } from "../types";
import { cn } from "../lib/utils";

interface CategoryCardProps {
  category: Category;
  className?: string;
}

export function CategoryCard({ category, className }: CategoryCardProps) {
  return (
    <Link
      to={`/services?category=${category.slug}`}
      className={cn(
        "group flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md",
        className
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-100 text-3xl transition-transform group-hover:scale-110">
        {category.icon}
      </div>
      <span className="text-sm font-medium text-slate-900">{category.name}</span>
    </Link>
  );
}
