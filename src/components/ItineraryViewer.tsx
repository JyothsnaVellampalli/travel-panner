import React, { useState } from "react";
import { 
  Calendar, Check, Landmark, Camera, Utensils, Car, ShoppingBag, 
  MapPin, Plus, Save, BookOpen, Trash, Info, ClipboardList, AlertCircle
} from "lucide-react";
import { Itinerary, Activity, SavedTrip } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface ItineraryViewerProps {
  itinerary: Itinerary;
  onSaveTrip?: (notes: string, updatedItinerary: Itinerary) => void;
  isSaving?: boolean;
  isAlreadySaved?: boolean;
  userLoggedIn: boolean;
  onOpenAuth: () => void;
}

export default function ItineraryViewer({ 
  itinerary, 
  onSaveTrip, 
  isSaving = false, 
  isAlreadySaved = false,
  userLoggedIn,
  onOpenAuth
}: ItineraryViewerProps) {
  const [activeDay, setActiveDay] = useState(1);
  const [localItinerary, setLocalItinerary] = useState<Itinerary>(itinerary);
  const [customNotes, setCustomNotes] = useState("");
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  
  // Custom Activity addition states
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [newTime, setNewTime] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCost, setNewCost] = useState("0");
  const [newType, setNewType] = useState("sightseeing");

  // Sync state if itinerary changes from outside
  React.useEffect(() => {
    setLocalItinerary(itinerary);
    setCustomNotes("");
    setCheckedItems({});
    setActiveDay(1);
  }, [itinerary]);

  const toggleCheckItem = (item: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  const handleAddCustomActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newActivity: Activity = {
      time: newTime || "Anytime",
      title: newTitle.trim(),
      description: newDesc.trim() || "Custom scheduled activity.",
      costEstimateUSD: Number(newCost) || 0,
      type: newType
    };

    // Clone local Itinerary and insert activity in the active day
    const updatedDays = localItinerary.days.map(day => {
      if (day.dayNumber === activeDay) {
        return {
          ...day,
          activities: [...day.activities, newActivity]
        };
      }
      return day;
    });

    // Re-calculate estimated total cost
    const additionalCost = Number(newCost) || 0;
    const updatedBudget = {
      ...localItinerary.budgetBreakdown,
      estimatedTotalUSD: localItinerary.budgetBreakdown.estimatedTotalUSD + additionalCost
    };

    setLocalItinerary({
      ...localItinerary,
      budgetBreakdown: updatedBudget,
      days: updatedDays
    });

    // Reset Form
    setNewTime("");
    setNewTitle("");
    setNewDesc("");
    setNewCost("0");
    setNewType("sightseeing");
    setShowAddActivity(false);
  };

  const handleDeleteActivity = (dayNum: number, activityIdx: number, costUSD: number) => {
    const updatedDays = localItinerary.days.map(day => {
      if (day.dayNumber === dayNum) {
        return {
          ...day,
          activities: day.activities.filter((_, idx) => idx !== activityIdx)
        };
      }
      return day;
    });

    const updatedBudget = {
      ...localItinerary.budgetBreakdown,
      estimatedTotalUSD: Math.max(0, localItinerary.budgetBreakdown.estimatedTotalUSD - costUSD)
    };

    setLocalItinerary({
      ...localItinerary,
      budgetBreakdown: updatedBudget,
      days: updatedDays
    });
  };

  const handleSaveAction = () => {
    if (!userLoggedIn) {
      onOpenAuth();
      return;
    }
    if (onSaveTrip) {
      onSaveTrip(customNotes, localItinerary);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "dining":
        return <Utensils className="h-4 w-4 text-amber-500" />;
      case "transit":
        return <Car className="h-4 w-4 text-blue-500" />;
      case "shopping":
        return <ShoppingBag className="h-4 w-4 text-emerald-500" />;
      case "relaxation":
        return <Landmark className="h-4 w-4 text-purple-500" />;
      case "sightseeing":
      default:
        return <Camera className="h-4 w-4 text-indigo-500" />;
    }
  };

  const currentDayData = localItinerary.days.find(d => d.dayNumber === activeDay) || localItinerary.days[0];

  return (
    <div className="space-y-8">
      
      {/* 1. Itinerary Header Card */}
      <div className="rounded-2xl glass-card p-6 md:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-sky-500/10 blur-2xl"></div>
        
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold tracking-widest text-sky-300 uppercase bg-sky-500/20 px-2.5 py-1 rounded-full">
                AI GENERATED ITINERARY
              </span>
              <span className="text-[10px] font-bold text-white/70 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full flex items-center space-x-1">
                <Calendar className="h-3.5 w-3.5 text-sky-400" />
                <span>{localItinerary.durationDays} Days Plan</span>
              </span>
            </div>
            <h2 className="font-display text-2xl md:text-3.5xl font-extrabold text-white leading-tight">
              Adventures in <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">{localItinerary.destination}</span>
            </h2>
            <p className="text-white/80 text-sm md:text-base font-light leading-relaxed max-w-3xl pt-1">
              {localItinerary.summary}
            </p>
          </div>

          {/* Save Action trigger */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 min-w-[160px]">
            <button
              onClick={handleSaveAction}
              disabled={isSaving || isAlreadySaved}
              className={`w-full rounded-xl px-5 py-3 text-sm font-bold text-white shadow-lg active:scale-97 transition flex items-center justify-center space-x-2 cursor-pointer ${
                isAlreadySaved 
                  ? "bg-emerald-500 shadow-emerald-500/10 cursor-default" 
                  : "bg-sky-500 hover:bg-sky-400 shadow-sky-500/10"
              }`}
            >
              {isAlreadySaved ? (
                <>
                  <Check className="h-4.5 w-4.5 stroke-[3]" />
                  <span>Saved to Trips</span>
                </>
              ) : isSaving ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4.5 w-4.5" />
                  <span>{userLoggedIn ? "Save Itinerary" : "Login & Save Itinerary"}</span>
                </>
              )}
            </button>
            {!userLoggedIn && (
              <span className="text-[10px] text-white/50 text-center flex items-center justify-center space-x-1">
                <AlertCircle className="h-3 w-3 text-sky-400" />
                <span>Required to keep permanently</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Grid Columns: Itinerary Activities Timeline (Col-8) & Packing List + Budget (Col-4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Itinerary Schedule Timeline Column */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Day Navigation Tabs */}
          <div className="flex overflow-x-auto pb-1 gap-2 border-b border-white/10">
            {localItinerary.days.map(day => (
              <button
                key={day.dayNumber}
                onClick={() => {
                  setActiveDay(day.dayNumber);
                  setShowAddActivity(false);
                }}
                className={`flex-shrink-0 rounded-xl px-5 py-3 text-sm font-bold transition-all cursor-pointer ${
                  activeDay === day.dayNumber
                    ? "bg-sky-500 text-white shadow-md"
                    : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                Day {day.dayNumber}
              </button>
            ))}
          </div>

          {/* Active Day Meta Summary */}
          <div className="rounded-xl bg-white/5 p-4 border border-white/10">
            <span className="text-[9px] font-bold text-sky-400 block tracking-widest uppercase">DAY {activeDay} FOCUS</span>
            <span className="text-sm font-bold text-white block mt-0.5">{currentDayData?.theme}</span>
          </div>

          {/* Activities List */}
          <div className="relative border-l-2 border-sky-500/20 pl-6 ml-3 space-y-7">
            {currentDayData?.activities.length === 0 ? (
              <div className="text-white/40 text-sm py-4 italic">No activities scheduled for today. Add one below!</div>
            ) : (
              currentDayData?.activities.map((act, index) => (
                <div key={index} className="relative group">
                  
                  {/* Timeline point icon indicator */}
                  <div className="absolute -left-[35px] top-1.5 flex h-7.5 w-7.5 items-center justify-center rounded-full bg-slate-900 border-2 border-sky-400 shadow-lg transition group-hover:scale-110">
                    {getActivityIcon(act.type)}
                  </div>

                  {/* Activity Details Card */}
                  <div className="flex items-start justify-between bg-white/5 border border-white/10 rounded-xl p-4 shadow-lg hover:border-white/20 transition">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-sky-300 bg-sky-500/20 px-2 py-0.5 rounded-md">
                          {act.time}
                        </span>
                        {act.costEstimateUSD > 0 ? (
                          <span className="text-[10px] font-bold text-white/60 bg-white/5 border border-white/5 px-2 py-0.5 rounded-md">
                            Est. ${act.costEstimateUSD}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-md uppercase">
                            Free
                          </span>
                        )}
                      </div>
                      <h4 className="font-display text-sm font-bold text-white">{act.title}</h4>
                      <p className="text-xs text-white/70 leading-relaxed font-light">{act.description}</p>
                    </div>

                    {/* Delete Custom Item capability */}
                    <button
                      onClick={() => handleDeleteActivity(activeDay, index, act.costEstimateUSD)}
                      className="text-white/40 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition cursor-pointer"
                      title="Delete activity"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>

                </div>
              ))
            )}
          </div>

          {/* Add Custom Activity Form Action */}
          <div className="pt-2">
            {!showAddActivity ? (
              <button
                onClick={() => setShowAddActivity(true)}
                className="inline-flex items-center space-x-2 rounded-xl border border-dashed border-white/10 bg-white/5 hover:bg-white/10 hover:border-sky-400 px-4 py-2.5 text-xs font-bold text-white/80 transition cursor-pointer"
              >
                <Plus className="h-4 w-4 text-sky-400" />
                <span>Customize Day: Add Activity</span>
              </button>
            ) : (
              <form onSubmit={handleAddCustomActivity} className="rounded-xl border border-white/10 bg-slate-900/60 p-4 space-y-3.5">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <h5 className="text-xs font-bold text-white">Add Activity to Day {activeDay}</h5>
                  <button 
                    type="button" 
                    onClick={() => setShowAddActivity(false)}
                    className="text-xs text-white/40 hover:text-white font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/60 uppercase">Time</label>
                    <input
                      type="text"
                      placeholder="e.g. 09:00 AM, Evening"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full rounded-lg glass-input p-2.5 text-xs outline-none transition focus:ring-1 focus:ring-sky-500/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/60 uppercase">Cost (USD)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={newCost}
                      onChange={(e) => setNewCost(e.target.value)}
                      className="w-full rounded-lg glass-input p-2.5 text-xs outline-none transition focus:ring-1 focus:ring-sky-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/60 uppercase">Activity Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Dinner at Local Izakaya"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full rounded-lg glass-input p-2.5 text-xs outline-none transition focus:ring-1 focus:ring-sky-500/20"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/60 uppercase">Activity Category</label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value)}
                      className="w-full rounded-lg glass-input p-2.5 text-xs outline-none transition focus:ring-1 focus:ring-sky-500/20 [&_option]:bg-slate-900 [&_option]:text-white"
                    >
                      <option value="sightseeing">Sightseeing</option>
                      <option value="dining">Dining & Food</option>
                      <option value="transit">Transit & Flight</option>
                      <option value="shopping">Shopping</option>
                      <option value="relaxation">Relaxation / Stay</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-white/60 uppercase">Short Description</label>
                  <textarea
                    placeholder="Describe what you plan to do..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    rows={2}
                    className="w-full rounded-lg glass-input p-2.5 text-xs outline-none transition focus:ring-1 focus:ring-sky-500/20"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-sky-500 py-2.5 text-xs font-bold text-white hover:bg-sky-400 active:scale-98 transition cursor-pointer"
                >
                  Insert Activity
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Right Packing List & Budget Sidebar Column */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* A. Estimated Budget Meter Breakdown */}
          <div className="rounded-2xl glass-card p-5 shadow-2xl space-y-4">
            <div className="flex items-center space-x-2.5 border-b border-white/10 pb-3">
              <Landmark className="h-4 w-4 text-sky-400" />
              <h4 className="font-display text-sm font-bold text-white">Cost & Budget Estimates</h4>
            </div>

            <div className="text-center bg-white/5 rounded-xl p-4 border border-white/5">
              <span className="text-[10px] text-white/50 uppercase tracking-widest font-bold block">Estimated Total Expense</span>
              <span className="text-2xl font-extrabold text-white font-mono mt-0.5 block">
                ${localItinerary.budgetBreakdown.estimatedTotalUSD}
              </span>
              <span className="text-[9px] text-white/40 mt-1 block">Based on selected preferences</span>
            </div>

            {/* Progress metrics */}
            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-white/70">
                  <span>Accommodation</span>
                  <span className="text-sky-300">{localItinerary.budgetBreakdown.accommodationPercent}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="h-full bg-sky-400 transition-all duration-500"
                    style={{ width: `${localItinerary.budgetBreakdown.accommodationPercent}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-white/70">
                  <span>Dining & Food</span>
                  <span className="text-amber-300">{localItinerary.budgetBreakdown.foodPercent}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="h-full bg-amber-400 transition-all duration-500"
                    style={{ width: `${localItinerary.budgetBreakdown.foodPercent}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-white/70">
                  <span>Sightseeing & Activities</span>
                  <span className="text-purple-300">{localItinerary.budgetBreakdown.activitiesPercent}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="h-full bg-purple-400 transition-all duration-500"
                    style={{ width: `${localItinerary.budgetBreakdown.activitiesPercent}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-white/70">
                  <span>Local Transport</span>
                  <span className="text-blue-300">{localItinerary.budgetBreakdown.transportPercent}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="h-full bg-blue-400 transition-all duration-500"
                    style={{ width: `${localItinerary.budgetBreakdown.transportPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* B. Packing Checklist */}
          <div className="rounded-2xl glass-card p-5 shadow-2xl space-y-4">
            <div className="flex items-center space-x-2.5 border-b border-white/10 pb-3">
              <ClipboardList className="h-4 w-4 text-sky-400" />
              <h4 className="font-display text-sm font-bold text-white">Smart Packing Assistant</h4>
            </div>

            <p className="text-[11px] text-white/60 leading-relaxed">Recommended essentials custom to this getaway. Tap to check them off.</p>

            <div className="space-y-2">
              {localItinerary.packingList.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => toggleCheckItem(item)}
                  className="flex w-full items-center space-x-2.5 rounded-lg p-2 text-left hover:bg-white/5 transition cursor-pointer"
                >
                  <div className={`flex h-4.5 w-4.5 items-center justify-center rounded-md border text-white transition ${
                    checkedItems[item] 
                      ? "bg-emerald-500 border-emerald-500" 
                      : "border-white/20 bg-white/5 group-hover:border-white/40"
                  }`}>
                    {checkedItems[item] && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                  </div>
                  <span className={`text-xs ${checkedItems[item] ? "line-through text-white/40 font-light" : "text-white/80 font-semibold"}`}>
                    {item}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* C. Interactive Private Notes */}
          <div className="rounded-2xl glass-card p-5 shadow-2xl space-y-4">
            <div className="flex items-center space-x-2.5 border-b border-white/10 pb-3">
              <BookOpen className="h-4 w-4 text-sky-400" />
              <h4 className="font-display text-sm font-bold text-white">My Personal Trip Notes</h4>
            </div>

            <p className="text-[11px] text-white/60 leading-relaxed">Write down flight numbers, reservation codes, or checklist ideas.</p>

            <textarea
              placeholder="e.g. Flight AA234 leaves at 8:00 AM. Stay is booked under 'Vellampalli'..."
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              rows={4}
              className="w-full rounded-xl glass-input p-3 text-xs outline-none transition focus:ring-1 focus:ring-sky-500/20"
            />
            
            <button
              onClick={handleSaveAction}
              className="w-full flex items-center justify-center space-x-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold py-2.5 transition active:scale-98 cursor-pointer shadow-lg shadow-sky-500/10"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save Notes to Itinerary</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
