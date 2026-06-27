import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, DollarSign, ArrowRight, Tag } from "lucide-react";
import { Destination } from "../types";
import { CURATED_DESTINATIONS } from "../data";
import { motion, AnimatePresence } from "motion/react";

interface DestinationsCarouselProps {
  onSelectDestination: (destinationName: string) => void;
}

export default function DestinationsCarousel({ onSelectDestination }: DestinationsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);

  useEffect(() => {
    if (!isAutoplay) return;
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % CURATED_DESTINATIONS.length);
    }, 6000); // changes every 6 seconds
    return () => clearInterval(timer);
  }, [isAutoplay]);

  const handlePrev = () => {
    setIsAutoplay(false);
    setCurrentIndex((prev) => (prev === 0 ? CURATED_DESTINATIONS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setIsAutoplay(false);
    setCurrentIndex((prev) => (prev + 1) % CURATED_DESTINATIONS.length);
  };

  const activeDest = CURATED_DESTINATIONS[currentIndex];

  return (
    <div className="relative w-full overflow-hidden glass py-12 md:py-20 text-white rounded-3xl">
      {/* Background blur decorative element */}
      <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl"></div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Carousel Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12">
          <div>
            <span className="inline-flex items-center space-x-1.5 rounded-full bg-sky-500/20 px-3 py-1 text-xs font-bold text-sky-400">
              <Calendar className="h-3.5 w-3.5" />
              <span>CURATED ESCAPES</span>
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight text-white mt-2.5">
              Inspiring Wanderlust
            </h2>
            <p className="text-white/60 text-sm mt-2 max-w-md">
              Hand-picked escapes with stunning vistas, rich cultures, and unforgettable activities. Click "Plan This Trip" to begin.
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <button
              onClick={handlePrev}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 hover:bg-white/15 active:scale-95 transition-all text-white cursor-pointer"
              aria-label="Previous destination"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-xs font-mono text-white/50">
              {String(currentIndex + 1).padStart(2, '0')} / {String(CURATED_DESTINATIONS.length).padStart(2, '0')}
            </span>
            <button
              onClick={handleNext}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 hover:bg-white/15 active:scale-95 transition-all text-white cursor-pointer"
              aria-label="Next destination"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Carousel Slider Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Information (Col-5) */}
          <div className="lg:col-span-5 order-2 lg:order-1 flex flex-col justify-center h-full z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeDest.id}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.35 }}
                className="space-y-4 md:space-y-6"
              >
                <div>
                  <p className="font-display text-xs font-bold tracking-widest text-sky-400 uppercase">
                    {activeDest.country}
                  </p>
                  <h3 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight text-white mt-1">
                    {activeDest.name}
                  </h3>
                </div>

                <p className="text-white/85 text-sm md:text-base leading-relaxed font-light">
                  {activeDest.description}
                </p>

                {/* Popular spots & facts */}
                <div className="grid grid-cols-2 gap-4 border-y border-white/10 py-4.5">
                  <div>
                    <span className="text-[10px] text-white/45 uppercase tracking-wider font-bold block">Best Time to Visit</span>
                    <span className="text-xs md:text-sm font-semibold text-white/90 mt-0.5 block">{activeDest.bestTime}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/45 uppercase tracking-wider font-bold block">Estimated Cost</span>
                    <span className="text-xs md:text-sm font-semibold text-white/90 mt-0.5 block">{activeDest.averageDailyCost}</span>
                  </div>
                </div>

                {/* Highlights tags */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {activeDest.tags.map((tag, idx) => (
                    <span 
                      key={idx} 
                      className="inline-flex items-center space-x-1 rounded-xl bg-white/5 border border-white/10 px-3 py-1 text-xs text-white/95"
                    >
                      <Tag className="h-3.5 w-3.5 text-sky-400" />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>

                {/* Main Action Trigger */}
                <div className="pt-4">
                  <button
                    onClick={() => onSelectDestination(activeDest.name)}
                    className="group inline-flex items-center space-x-2 rounded-xl bg-sky-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-500/15 hover:bg-sky-400 hover:shadow-sky-500/25 active:scale-95 transition-all cursor-pointer"
                  >
                    <span>Plan This Trip</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Column: Stunning Image Slider (Col-7) */}
          <div className="lg:col-span-7 order-1 lg:order-2 relative aspect-video sm:aspect-[16/10] lg:aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-slate-900 group">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeDest.id}
                src={activeDest.image}
                alt={activeDest.name}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.45 }}
                referrerPolicy="no-referrer"
                className="absolute inset-0 h-full w-full object-cover transition-all duration-700 group-hover:scale-103"
              />
            </AnimatePresence>
            
            {/* Dark elegant gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>
            
            {/* Quick list overlays on the image (bottom left) */}
            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2 items-center justify-between pointer-events-none">
              <div className="bg-slate-950/85 backdrop-blur-md border border-white/5 rounded-xl px-3 py-2 text-left">
                <span className="text-[9px] text-slate-400 font-semibold block uppercase">Local Hotspots</span>
                <span className="text-[11px] font-medium text-white line-clamp-1">
                  {activeDest.popularPlaces.slice(0, 3).join(" • ")}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Dots Navigator Indicator */}
        <div className="flex justify-center space-x-2 mt-8 md:mt-12">
          {CURATED_DESTINATIONS.map((dest, idx) => (
            <button
              key={dest.id}
              onClick={() => {
                setIsAutoplay(false);
                setCurrentIndex(idx);
              }}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentIndex ? "w-8 bg-sky-400" : "w-2 bg-white/20 hover:bg-white/40"
              }`}
              title={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

      </div>
    </div>
  );
}
