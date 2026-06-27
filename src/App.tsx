import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import AuthModal from "./components/AuthModal";
import DestinationsCarousel from "./components/DestinationsCarousel";
import TravelPlannerForm from "./components/TravelPlannerForm";
import ItineraryViewer from "./components/ItineraryViewer";
import Chatbot from "./components/Chatbot";
import { Destination, Itinerary, SavedTrip } from "./types";
import { 
  Sparkles, Compass, AlertCircle, Bookmark, Calendar, MapPin, 
  Trash, ArrowRight, ClipboardList, CheckCircle 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'explore' | 'my-trips'>('explore');
  
  // Trip planning state
  const [carouselDest, setCarouselDest] = useState("");
  const [isLoadingItinerary, setIsLoadingItinerary] = useState(false);
  const [activeTrip, setActiveTrip] = useState<Itinerary | null>(null);
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Loading state for saving trips
  const [isSaving, setIsSaving] = useState(false);

  // Initialize data on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("travel_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    const savedTripsData = localStorage.getItem("travel_saved_trips");
    if (savedTripsData) {
      setSavedTrips(JSON.parse(savedTripsData));
    }
  }, []);

  const handleLoginSuccess = (userData: { name: string; email: string }) => {
    setUser(userData);
    localStorage.setItem("travel_user", JSON.stringify(userData));
    setSuccessMsg(`Welcome, ${userData.name}! Explore beautiful destinations.`);
    setTimeout(() => setSuccessMsg(""), 4500);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("travel_user");
    setActiveSection('explore');
    setSuccessMsg("Logged out successfully.");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // Triggered when clicking "Plan This Trip" from the carousel
  const handleSelectCarouselDestination = (destName: string) => {
    setCarouselDest(destName);
    // Scroll down to the trip form smoothly
    const formElement = document.getElementById("trip-planner-builder");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Call server API to generate structured itinerary from Gemini
  const handleGenerateItinerary = async (formData: {
    destination: string;
    daysCount: number;
    budget: string;
    travelStyle: string;
  }) => {
    setIsLoadingItinerary(true);
    setErrorMsg("");
    setActiveTrip(null);

    try {
      const res = await fetch("/api/generate-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate travel plan.");
      }

      setActiveTrip(data);
      
      // Scroll to Itinerary view
      setTimeout(() => {
        const viewerElement = document.getElementById("active-itinerary-viewer");
        if (viewerElement) {
          viewerElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);

    } catch (err: any) {
      console.error("Itinerary generation error:", err);
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoadingItinerary(false);
    }
  };

  // Save the generated or customized trip
  const handleSaveTrip = (notes: string, updatedItinerary: Itinerary) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    setIsSaving(true);
    
    setTimeout(() => {
      // Check if already saved
      const existsIdx = savedTrips.findIndex(
        t => t.destination.toLowerCase() === updatedItinerary.destination.toLowerCase() && 
        t.durationDays === updatedItinerary.durationDays
      );

      let updatedTrips = [...savedTrips];

      const newSavedTrip: SavedTrip = {
        id: Date.now().toString(),
        destination: updatedItinerary.destination,
        durationDays: updatedItinerary.durationDays,
        startDate: new Date().toLocaleDateString(),
        endDate: new Date(Date.now() + updatedItinerary.durationDays * 24 * 60 * 60 * 1000).toLocaleDateString(),
        budgetLevel: "Custom",
        travelStyle: "Custom",
        itinerary: updatedItinerary,
        customNotes: notes,
        createdAt: new Date().toISOString()
      };

      if (existsIdx > -1) {
        // Update existing saved trip
        updatedTrips[existsIdx] = {
          ...updatedTrips[existsIdx],
          itinerary: updatedItinerary,
          customNotes: notes
        };
        setSuccessMsg(`Updated: Itinerary for ${updatedItinerary.destination} saved!`);
      } else {
        // Add new trip
        updatedTrips.push(newSavedTrip);
        setSuccessMsg(`Success: Itinerary for ${updatedItinerary.destination} saved to your account!`);
      }

      setSavedTrips(updatedTrips);
      localStorage.setItem("travel_saved_trips", JSON.stringify(updatedTrips));
      setIsSaving(false);
      setTimeout(() => setSuccessMsg(""), 4500);
    }, 1200);
  };

  const handleDeleteSavedTrip = (tripId: string) => {
    const updated = savedTrips.filter(t => t.id !== tripId);
    setSavedTrips(updated);
    localStorage.setItem("travel_saved_trips", JSON.stringify(updated));
    setSuccessMsg("Saved itinerary removed.");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleLoadSavedTrip = (trip: SavedTrip) => {
    setActiveTrip(trip.itinerary);
    setActiveSection('explore');
    
    setTimeout(() => {
      const viewerElement = document.getElementById("active-itinerary-viewer");
      if (viewerElement) {
        viewerElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const isTripAlreadySaved = activeTrip 
    ? savedTrips.some(
        t => t.destination.toLowerCase() === activeTrip.destination.toLowerCase() && 
        t.durationDays === activeTrip.durationDays
      )
    : false;

  return (
    <div className="min-h-screen bg-[#0f172a] font-sans antialiased text-white flex flex-col relative pb-16">
      <div className="mesh-bg"></div>
      
      {/* Dynamic Header */}
      <Header 
        user={user} 
        onOpenAuth={() => setIsAuthOpen(true)} 
        onLogout={handleLogout}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      {/* Floating System Messages */}
      <AnimatePresence>
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 glass text-white rounded-xl px-5 py-3.5 text-xs font-semibold shadow-2xl flex items-center space-x-2.5 w-[90vw] max-w-sm"
          >
            <CheckCircle className="h-4.5 w-4.5 text-emerald-400" />
            <span>{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 w-full">
        {activeSection === 'explore' ? (
          
          /* EXPLORE & PLAN WORKSPACE */
          <div className="space-y-12 pb-16">
            
            {/* Curated Destinations Hero Slider Section */}
            <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
              <DestinationsCarousel onSelectDestination={handleSelectCarouselDestination} />
            </section>

            {/* AI Generator Panel Section */}
            <section id="trip-planner-builder" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Column: Config Form (Col-7) */}
                <div className="lg:col-span-7 space-y-6">
                  <div>
                    <span className="inline-flex items-center space-x-1.5 rounded-full bg-sky-500/20 border border-sky-500/30 px-3 py-1 text-xs font-bold text-sky-300">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Gemini-Powered Engine</span>
                    </span>
                    <h3 className="font-display text-2xl md:text-3xl font-extrabold text-white tracking-tight mt-2">
                      Let AI craft your custom journey
                    </h3>
                    <p className="text-white/60 text-xs md:text-sm mt-1 leading-relaxed">
                      Simply select dates, specify your budget and travel styles, and our Nomad travel intelligence will generate a tailored day-by-day plan immediately.
                    </p>
                  </div>

                  {/* Config Form Component */}
                  <TravelPlannerForm 
                    onGenerate={handleGenerateItinerary} 
                    isLoading={isLoadingItinerary}
                    selectedDestinationName={carouselDest}
                  />

                  {/* Feedback Errors */}
                  {errorMsg && (
                    <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 p-4 text-sm text-rose-200 flex items-start space-x-2">
                      <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-rose-400" />
                      <div>
                        <span className="font-bold">Trip builder failure:</span>
                        <p className="text-xs text-rose-300/90 mt-1">{errorMsg}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Aesthetics Info & Feature Board (Col-5) */}
                <div className="lg:col-span-5 h-full flex flex-col justify-between rounded-2xl glass-card p-6 md:p-8 text-white shadow-2xl relative overflow-hidden min-h-[460px]">
                  <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-sky-500/10 blur-3xl"></div>
                  
                  <div className="space-y-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/20 text-sky-300 border border-white/10">
                      <Compass className="h-5 w-5 animate-spin-slow" />
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-display text-lg font-bold">Why plan with VagabondAI?</h4>
                      <p className="text-xs text-white/70 leading-relaxed font-light">
                        VagabondAI fuses curated travel destinations and global wisdom with Google Gemini’s reasoning to make custom itinerary planning immediate, fun, and easy.
                      </p>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div className="flex items-start space-x-3">
                        <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-sky-500/20 border border-sky-500/30 text-sky-300 font-mono text-[10px]">1</div>
                        <div>
                          <h5 className="text-xs font-semibold">Granular Day Schedules</h5>
                          <p className="text-[10px] text-white/50 mt-0.5 leading-relaxed">Hour-by-hour recommendations optimized for transit times and daily pacing.</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-sky-500/20 border border-sky-500/30 text-sky-300 font-mono text-[10px]">2</div>
                        <div>
                          <h5 className="text-xs font-semibold">Packing checklists</h5>
                          <p className="text-[10px] text-white/50 mt-0.5 leading-relaxed">Hand-picked recommendations based on weather trends and travel styles.</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-sky-500/20 border border-sky-500/30 text-sky-300 font-mono text-[10px]">3</div>
                        <div>
                          <h5 className="text-xs font-semibold">Local Cost Estimations</h5>
                          <p className="text-[10px] text-white/50 mt-0.5 leading-relaxed">No-surprises budget indicators mapping lodging, transport, food, and sightseeing.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/10 mt-6 flex items-center justify-between">
                    <span className="text-[10px] text-white/40 tracking-wider">SECURE & CLOUD STORAGE ENCRYPTED</span>
                    <span className="text-[10px] bg-sky-500/20 text-sky-300 rounded px-2.5 py-0.5 font-bold uppercase tracking-wider">v1.2</span>
                  </div>
                </div>

              </div>
            </section>

            {/* Generated Itinerary Viewing Workspace */}
            <AnimatePresence>
              {activeTrip && (
                <motion.section 
                  id="active-itinerary-viewer"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 scroll-mt-20"
                >
                  <ItineraryViewer 
                    itinerary={activeTrip} 
                    onSaveTrip={handleSaveTrip}
                    isSaving={isSaving}
                    isAlreadySaved={isTripAlreadySaved}
                    userLoggedIn={!!user}
                    onOpenAuth={() => setIsAuthOpen(true)}
                  />
                </motion.section>
              )}
            </AnimatePresence>

          </div>
        ) : (
          
          /* MY SAVED ITINERARIES TAB */
          <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-8">
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-extrabold text-white">
                  My Saved Trips
                </h2>
                <p className="text-xs text-white/60 mt-1">Review, load, or delete previously generated custom itineraries.</p>
              </div>
              <span className="rounded-full bg-sky-500/20 border border-sky-500/30 text-sky-300 px-3.5 py-1 text-xs font-bold flex items-center space-x-1.5">
                <ClipboardList className="h-3.5 w-3.5" />
                <span>{savedTrips.length} Saved</span>
              </span>
            </div>

            {savedTrips.length === 0 ? (
              <div className="text-center py-16 px-4 rounded-2xl glass-card max-w-md mx-auto shadow-2xl space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/5 text-sky-400 border border-white/10">
                  <Bookmark className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold text-white">Your map is empty</h3>
                  <p className="text-xs text-white/60 mt-1.5 leading-relaxed">You haven't saved any travel itineraries yet. Start your trip configuration on the main workspace!</p>
                </div>
                <button
                  onClick={() => setActiveSection('explore')}
                  className="rounded-full bg-sky-500 text-white font-bold text-xs px-5 py-2.5 hover:bg-sky-400 transition flex items-center space-x-1.5 mx-auto cursor-pointer shadow-lg shadow-sky-500/10"
                >
                  <span>Explore Destinations</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedTrips.map((trip) => (
                  <div 
                    key={trip.id} 
                    className="rounded-xl border border-white/10 glass-card glass-card-hover overflow-hidden flex flex-col justify-between group transition"
                  >
                    <div className="p-5 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-bold text-sky-400 uppercase tracking-widest block">Day count: {trip.durationDays} Days</span>
                          <h4 className="font-display text-base font-bold text-white leading-tight">
                            {trip.destination}
                          </h4>
                        </div>
                        
                        <button
                          onClick={() => handleDeleteSavedTrip(trip.id)}
                          className="text-white/40 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition shrink-0 cursor-pointer"
                          title="Delete itinerary"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>

                      <p className="text-xs text-white/70 font-light line-clamp-3 leading-relaxed">
                        {trip.itinerary.summary}
                      </p>

                      {trip.customNotes && (
                        <div className="bg-white/5 rounded-lg p-2.5 border border-white/10">
                          <span className="text-[9px] font-bold text-white/40 uppercase tracking-wide block">Private notes</span>
                          <p className="text-[10px] text-white/80 line-clamp-2 mt-0.5 font-light italic">
                            "{trip.customNotes}"
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[10px] text-white/40 font-mono">
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-3.5 w-3.5 text-white/40" />
                          <span>Planned on {new Date(trip.createdAt).toLocaleDateString()}</span>
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleLoadSavedTrip(trip)}
                      className="w-full border-t border-white/10 bg-white/5 hover:bg-sky-500 py-3 text-center text-xs font-bold text-white transition cursor-pointer"
                    >
                      Load Itinerary Workspace
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Floating Chatbot Widget (Toggles between bottom-left and bottom-right corner) */}
      <Chatbot onQuickPlanDestination={handleSelectCarouselDestination} />

      {/* Auth Modal Trigger */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onLoginSuccess={handleLoginSuccess}
      />

    </div>
  );
}
