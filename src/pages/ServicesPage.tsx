import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { ServiceCard } from "../components/ServiceCard";
import { fetchServices } from "../api/client";
import { Service } from "../types";

export function ServicesPage() {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Handle initial category from URL
  const validCategories = ["women", "men", "repair", "cleaning", "painting", "pest-control", "water-tank"];
  const defaultCategory: "women" | "men" | "repair" | "cleaning" | "painting" | "pest-control" | "water-tank" =
    (categoryParam && validCategories.includes(categoryParam))
      ? (categoryParam as any)
      : "women";

  const [activeTab, setActiveTab] = useState<"women" | "men" | "repair" | "cleaning" | "painting" | "pest-control" | "water-tank">(
    defaultCategory
  );
  const searchQuery = searchParams.get("search")?.toLowerCase() || "";

  useEffect(() => {
    const loadServices = async () => {
      try {
        const data = await fetchServices();
        setServices(data);
      } catch (error) {
        console.error("Failed to load services", error);
      } finally {
        setLoading(false);
      }
    };
    loadServices();
  }, []);

  // Sync tab with URL parameter
  useEffect(() => {
    if (categoryParam && validCategories.includes(categoryParam)) {
      setActiveTab(categoryParam as any);
    }
  }, [categoryParam]);

  const filteredServices = useMemo(() => {
    let filtered = services.filter((service) => service.category === activeTab);

    if (searchQuery) {
      filtered = filtered.filter(
        (service) =>
          service.name.toLowerCase().includes(searchQuery) ||
          service.description.toLowerCase().includes(searchQuery)
      );
    }

    return filtered;
  }, [activeTab, searchQuery, services]);

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-slate-900">Our Services</h1>
        <p className="text-slate-600">
          Choose from a wide range of professional home services
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="mb-8 flex flex-wrap h-auto gap-2 bg-transparent justify-start p-0">
          <TabsTrigger value="women" className="data-[state=active]:bg-pink-100 data-[state=active]:text-pink-700">Women</TabsTrigger>
          <TabsTrigger value="men" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">Men</TabsTrigger>
          <TabsTrigger value="repair" className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700">Repair</TabsTrigger>
          <TabsTrigger value="cleaning" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700">Cleaning</TabsTrigger>
          <TabsTrigger value="painting" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">Painting</TabsTrigger>
          <TabsTrigger value="pest-control" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-700">Pest Control</TabsTrigger>
          <TabsTrigger value="water-tank" className="data-[state=active]:bg-cyan-100 data-[state=active]:text-cyan-700">Water Tank</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {loading ? (
            <div className="flex justify-center p-12">
              <p className="text-slate-500">Loading services...</p>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
              <p className="text-slate-500">No services found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
