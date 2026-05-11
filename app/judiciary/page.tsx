"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { MapPin, Landmark, Phone, Briefcase, Scale } from "lucide-react";

const localOffices = [
  { id: 1, name: "Suri District Court (Birbhum)", type: "Court", address: "Suri, Birbhum, West Bengal 731101", phone: "03462-255222", distance: "1.2 km", icon: Landmark },
  { id: 2, name: "Birbhum District Legal Services Authority", type: "Legal Office", address: "District Court Compound, Suri", phone: "03462-258444", distance: "1.3 km", icon: Scale },
  { id: 3, name: "Suri Bar Association", type: "Lawyers", address: "Court Compound, Suri, West Bengal 731101", phone: "+91 98321 00000", distance: "1.2 km", icon: Briefcase },
  { id: 4, name: "Roy & Associates Legal Firm", type: "Lawyers", address: "SP More, Suri, West Bengal", phone: "+91 98765 43210", distance: "2.5 km", icon: Briefcase }
];

export default function JudiciaryPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex flex-1 flex-col px-4 pb-20 pt-24 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <MapPin className="w-8 h-8 text-primary" />
              Nearby Judiciary Offices
            </h1>
            <p className="mt-2 text-muted-foreground">Find local courts, legal aid, and verified lawyers in your area.</p>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-2">
            {localOffices.map((office, idx) => (
              <motion.div 
                key={office.id}
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: idx * 0.1 }}
                className="rounded-xl border border-border bg-card p-6 shadow-sm hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <office.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">{office.name}</h3>
                    <span className="inline-block mt-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                      {office.type}
                    </span>
                    
                    <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span>{office.address} ({office.distance})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 shrink-0" />
                        <span>{office.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}