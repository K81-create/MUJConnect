import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { CategoryCard } from "../components/CategoryCard";
import { ServiceCard } from "../components/ServiceCard";
import { categories, services } from "../data/services";

export function HomePage() {
  const featuredServices = services.slice(0, 6);

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8">
      {/* Hero Section */}
      <section className="mb-16 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-12 text-center">
        <h1 className="mb-4 text-4xl font-bold text-slate-900 sm:text-5xl">
          Home services at your doorstep
        </h1>
        <p className="mb-8 text-lg text-slate-600">
          Professional, reliable, and affordable services delivered to your home
        </p>
        <Link to="/services">
          <Button size="lg">Explore Services</Button>
        </Link>
      </section>

      {/* Categories Grid */}
      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-semibold text-slate-900">
          Browse by Category
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      {/* New and Noteworthy */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">
            New and Noteworthy
          </h2>
          <Link to="/services">
            <Button variant="ghost">View All</Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </section>
    </div>
  );
}
