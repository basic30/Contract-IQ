"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { MapPin, Landmark, Phone, Briefcase, Scale, Navigation, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Dynamically import the map to prevent Server-Side Rendering crashes
const DynamicMap = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-muted/20">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  ),
});

const localOffices = [
  { id: 1, name: "Suri District Court (Birbhum)", type: "Court", address: "Suri, Birbhum, West Bengal 731101", phone: "03462-255222", distance: "1.2 km", icon: Landmark, coordinates: [23.9080, 87.5270] },
  { id: 2, name: "Birbhum District Legal Services Authority", type: "Legal Office", address: "District Court Compound, Suri", phone: "03462-258444", distance: "1.3 km", icon: Scale, coordinates: [23.9075, 87.5285] },
  { id: 3, name: "Suri Bar Association", type: "Lawyers", address: "Court Compound, Suri, West Bengal 731101", phone: "+91 98321 00000", distance: "1.2 km", icon: Briefcase, coordinates: [23.9082, 87.5265] },
  { id: 4, name: "Roy & Associates Legal Firm", type: "Lawyers", address: "SP More, Suri, West Bengal", phone: "+91 98765 43210", distance: "2.5 km", icon: Briefcase, coordinates: [23.9100, 87.5300] }
];

export default function JudiciaryPage() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    // Set map center context smoothly on load
    setUserLocation([23.9054, 87.5266]);
  }, []);

  const handleLocateUser = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
          setIsLocating(false);
        },
        (error) => {
          console.error("Error obtaining location:", error);
          alert("Could not find your location. Please ensure location services are enabled.");
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
      setIsLocating(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      
      <main className="flex flex-1 flex-col px-4 pb-20 pt-24 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <MapPin className="w-8 h-8 text-primary" />
                Nearby Legal Offices
              </h1>
              <p className="mt-2 text-muted-foreground">Find courts, legal aid, and verified lawyers in your area.</p>
            </div>
            
            <Button onClick={handleLocateUser} disabled={isLocating} variant="outline" className="gap-2 shrink-0">
              {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
              {isLocating ? "Locating..." : "Use My Live Location"}
            </Button>
          </motion.div>

          {/* Two-Column Grid Layout */}
          <div className="grid gap-6 lg:grid-cols-5 h-[600px]">
            
            {/* Left Side: Interactive Map */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }} 
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-3 order-1 lg:order-none relative overflow-hidden rounded-xl border border-border bg-card shadow-sm h-[400px] lg:h-full"
            >
              <DynamicMap userLocation={userLocation} offices={localOffices} />
            </motion.div>

            {/* Right Side: Scrollable List */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 order-2 lg:order-none flex flex-col gap-4 overflow-y-auto pr-2 pb-4"
            >
              {localOffices.map((office, idx) => (
                <div 
                  key={office.id}
                  className="rounded-xl border border-border bg-card p-5 shadow-sm hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <office.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{office.name}</h3>
                      <span className="inline-block mt-1.5 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                        {office.type}
                      </span>
                      
                      <div className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                        <div className="flex items-start gap-2.5">
                          <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-primary/70" />
                          <span className="leading-tight">{office.address} <br/> <span className="text-xs font-medium text-primary">({office.distance})</span></span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <Phone className="h-4 w-4 shrink-0 text-primary/70" />
                          <span>{office.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}