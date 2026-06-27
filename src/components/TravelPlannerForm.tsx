import React, { useState } from "react";
import { Search, Calendar, Landmark, Sparkles, Sliders, ChevronDown } from "lucide-react";
import { CURATED_DESTINATIONS } from "../data";

interface TravelPlannerFormProps {
  onGenerate: (data: {
    destination: string;
    daysCount: number;
    budget: string;
    travelStyle: string;
  }) => void;
  isLoading: boolean;
  selectedDestinationName: string;
}

const BUDGET_OPTIONS = ["Budget", "Moderate", "Luxury"];
const STYLE_OPTIONS = ["Adventure", "Cultural & Historic", "Relaxation & Spa", "Culinary & Foodie", "Family Friendly", "Nature & Wildlife"];

export default function TravelPlannerForm({ onGenerate, isLoading, selectedDestinationName }: TravelPlannerFormProps) {
  const [destination, setDestination] = useState(selectedDestinationName || "");
  const [daysCount, setDaysCount] = useState(3);
  const [budget, setBudget] = useState("Moderate");
  const [travelStyle, setTravelStyle] = useState("Cultural & Historic");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Sync selected destination from carousel
  React.useEffect(() => {
    if (selectedDestinationName) {
      setDestination(selectedDestinationName);
    }
  }, [selectedDestinationName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) return;
    onGenerate({
      destination: destination.trim(),
      daysCount,
      budget,
      travelStyle,
    });
  };

  const filteredSuggestions = CURATED_DESTINATIONS.filter((item) =>
    item.name.toLowerCase().includes(destination.toLowerCase()) ||
    item.country.toLowerCase().includes(destination.toLowerCase())
  );

  return (
    <div className="rounded-2xl glass-card p-5 md:p-7 shadow-2xl relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-400 to-indigo-500 rounded-t-2xl"></div>

      <div className="flex items-center space-x-2.5 mb-6">
        <Sliders className="h-5 w-5 text-sky-400 animate-pulse" />
        <h3 className="font-display text-lg font-bold text-white">Custom Trip Configurator</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Destination autocomplete input */}
        <div className="space-y-1.5 relative">
          <label className="text-xs font-bold text-white/85 block">Where do you want to go?</label>
          <div className="relative">
            <Search className="absolute top-3.5 left-3.5 h-4.5 w-4.5 text-white/40" />
            <input
              type="text"
              placeholder="e.g. Kyoto, Santorini, Paris..."
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="w-full rounded-xl glass-input py-3 pr-4 pl-11 text-sm outline-none transition focus:ring-2 focus:ring-sky-500/20"
              required
            />
          </div>

          {/* Autocomplete dropdown suggestions */}
          {showSuggestions && destination.trim() !== "" && filteredSuggestions.length > 0 && (
            <div className="absolute top-full left-0 w-full mt-2 rounded-xl border border-white/10 bg-slate-900/95 p-1.5 shadow-2xl z-20 max-h-48 overflow-y-auto backdrop-blur-md">
              {filteredSuggestions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onMouseDown={() => {
                     setDestination(item.name);
                     setShowSuggestions(false);
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-white/80 hover:bg-white/10 hover:text-white transition cursor-pointer"
                >
                  <div>
                    <span className="font-semibold block">{item.name}</span>
                    <span className="text-[10px] text-white/45">{item.country}</span>
                  </div>
                  <span className="text-[10px] rounded bg-sky-500/20 text-sky-300 px-1.5 py-0.5 font-bold">Curated</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Triple Grid Configs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Trip Duration Days */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white/85 block">Duration (Days)</label>
            <div className="relative">
              <Calendar className="absolute top-3.5 left-3.5 h-4.5 w-4.5 text-white/40" />
              <select
                value={daysCount}
                onChange={(e) => setDaysCount(Number(e.target.value))}
                className="w-full appearance-none rounded-xl glass-input py-3 pr-8 pl-11 text-sm outline-none transition focus:ring-2 focus:ring-sky-500/20 [&_option]:bg-slate-900 [&_option]:text-white"
              >
                {[2, 3, 4, 5, 6, 7].map((day) => (
                  <option key={day} value={day}>{day} Days</option>
                ))}
              </select>
              <ChevronDown className="absolute top-3.5 right-3.5 h-4.5 w-4.5 text-white/40 pointer-events-none" />
            </div>
          </div>

          {/* Budget Level */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white/85 block">Budget Level</label>
            <div className="relative">
              <Landmark className="absolute top-3.5 left-3.5 h-4.5 w-4.5 text-white/40" />
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full appearance-none rounded-xl glass-input py-3 pr-8 pl-11 text-sm outline-none transition focus:ring-2 focus:ring-sky-500/20 [&_option]:bg-slate-900 [&_option]:text-white"
              >
                {BUDGET_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <ChevronDown className="absolute top-3.5 right-3.5 h-4.5 w-4.5 text-white/40 pointer-events-none" />
            </div>
          </div>

          {/* Travel Style Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white/85 block">Travel Style</label>
            <div className="relative">
              <Sparkles className="absolute top-3.5 left-3.5 h-4.5 w-4.5 text-white/40" />
              <select
                value={travelStyle}
                onChange={(e) => setTravelStyle(e.target.value)}
                className="w-full appearance-none rounded-xl glass-input py-3 pr-8 pl-11 text-sm outline-none transition focus:ring-2 focus:ring-sky-500/20 [&_option]:bg-slate-900 [&_option]:text-white"
              >
                {STYLE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <ChevronDown className="absolute top-3.5 right-3.5 h-4.5 w-4.5 text-white/40 pointer-events-none" />
            </div>
          </div>

        </div>

        {/* Generate Action Button */}
        <button
          type="submit"
          disabled={isLoading || !destination.trim()}
          className="w-full rounded-xl bg-sky-500 py-3 text-sm font-bold text-white shadow-lg shadow-sky-500/10 hover:bg-sky-400 active:scale-98 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2.5 cursor-pointer"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Consulting celestial guide maps...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4.5 w-4.5" />
              <span>Generate Custom AI Itinerary</span>
            </>
          )}
        </button>

      </form>
    </div>
  );
}
