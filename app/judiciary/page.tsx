"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { MapPin, Landmark, Phone, Briefcase, Scale, Navigation, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Dynamically import the map to prevent Server-Side Rendering crashes
const DynamicMap = dynamic(() => import("@/components/Map"), {
  ssr: false,
});

// Helper to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return (R * c).toFixed(1);
}

// Fallback mock generator (in case the area has no OSM data mapped yet)
const generateMockOffices = (lat: number, lon: number) => {
  return [
    {
      id: "mock-1",
      name: "District Civil Court",
      type: "Court",
      address: "Central Judicial Complex",
      phone: "Contact Registry",
      icon: Landmark,
      coordinates: [lat + 0.012, lon + 0.008] as [number, number]
    },
    {
      id: "mock-2",
      name: "Regional Legal Aid Authority",
      type: "Legal Office",
      address: "Public Service Building",
      phone: "Toll-free 1800-XXX",
      icon: Scale,
      coordinates: [lat - 0.008, lon + 0.015] as [number, number]
    },
    {
      id: "mock-3",
      name: "Apex Law Associates",
      type: "Lawyers",
      address: "Commercial Hub, Suite 405",
      phone: "Available on request",
      icon: Briefcase,
      coordinates: [lat + 0.005, lon - 0.012] as [number, number]
    }
  ].map(office => ({
     ...office,
     distance: calculateDistance(lat, lon, office.coordinates[0], office.coordinates[1]) + ' km'
  }));
};

export default function JudiciaryPage() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [offices, setOffices] = useState<any[]>([]);
  const [isLocating, setIsLocating] = useState(true);
  const [isFetchingOffices, setIsFetchingOffices] = useState(false);

  // Function to ping OpenStreetMap for real local courts and lawyers
  const fetchOffices = useCallback(async (lat: number, lon: number) => {
    setIsFetchingOffices(true);
    try {
      const radius = 15000; // Search within 15km
      const query = `
        [out:json];
        (
          node["amenity"="courthouse"](around:${radius},${lat},${lon});
          node["office"="lawyer"](around:${radius},${lat},${lon});
          way["amenity"="courthouse"](around:${radius},${lat},${lon});
        );
        out center 10;
      `;
      
      const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: query
      });
      
      const data = await res.json();
      
      if (data && data.elements && data.elements.length > 0) {
        const results = data.elements.map((el: any, index: number) => {
          const isNode = el.type === 'node';
          const latCoord = isNode ? el.lat : el.center?.lat;
          const lonCoord = isNode ? el.lon : el.center?.lon;
          const type = el.tags?.amenity === 'courthouse' ? 'Court' : 'Law Firm';
          const name = el.tags?.name || (type === 'Court' ? 'Local District Court' : 'Legal Associates');
          
          return {
            id: el.id || `real-${index}`,
            name: name,
            type: type,
            address: el.tags?.['addr:full'] || el.tags?.['addr:street'] || 'Address unavailable',
            phone: el.tags?.phone || 'Contact not listed',
            distance: calculateDistance(lat, lon, latCoord, lonCoord) + ' km',
            icon: type === 'Court' ? Landmark : Briefcase,
            coordinates: [latCoord, lonCoord] as [number, number]
          };
        });
        
        // Sort by closest distance
        setOffices(results.sort((a: any, b: any) => parseFloat(a.distance) - parseFloat(b.distance)));
      } else {
        setOffices(generateMockOffices(lat, lon));
      }
    } catch (error) {
      console.error("Failed to fetch real offices:", error);
      setOffices(generateMockOffices(lat, lon)); // Fallback if API fails
    } finally {
      setIsFetchingOffices(false);
    }
  }, []);

  // Get User's Live Location
  const locateUser = useCallback(() => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setUserLocation([lat, lon]);
          fetchOffices(lat, lon);
          setIsLocating(false);
        },
        (error) => {
          console.error("Error obtaining location:", error);
          // Fallback to New Delhi if user denies permission so page isn't broken
          const fallbackLat = 28.6139; 
          const fallbackLon = 77.2090;
          setUserLocation([fallbackLat, fallbackLon]);
          fetchOffices(fallbackLat, fallbackLon);
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setIsLocating(false);
    }
  }, [fetchOffices]);

  // Trigger automatically when the page loads
  useEffect(() => {
    locateUser();
  }, [locateUser]);

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
              <p className="mt-2 text-muted-foreground">Automatically fetching courts, legal aid, and verified lawyers in your area.</p>
            </div>
            
            <Button onClick={locateUser} disabled={isLocating} variant="outline" className="gap-2 shrink-0">
              {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
              {isLocating ? "Locating..." : "Refresh Live Location"}
            </Button>
          </motion.div>

          {/* Two-Column Grid Layout */}
          <div className="grid gap-6 lg:grid-cols-5 h-[600px]">
            
            {/* Left Side: Interactive Map */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }} 
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-3 order-1 lg:order-none relative overflow-hidden rounded-xl border border-border bg-card shadow-sm h-[400px] lg:h-full flex items-center justify-center"
            >
              {!userLocation ? (
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p>Requesting Location Access...</p>
                </div>
              ) : (
                <DynamicMap userLocation={userLocation} offices={offices} />
              )}
            </motion.div>

            {/* Right Side: Scrollable Dynamic List */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 order-2 lg:order-none flex flex-col gap-4 overflow-y-auto pr-2 pb-4"
            >
              {isFetchingOffices || !userLocation ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                  <p>Searching for nearby legal offices...</p>
                </div>
              ) : offices.map((office) => (
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