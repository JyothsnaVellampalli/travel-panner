export interface Destination {
  id: string;
  name: string;
  country: string;
  image: string;
  description: string;
  tags: string[];
  bestTime: string;
  averageDailyCost: string;
  popularPlaces: string[];
}

export interface Activity {
  time: string;
  title: string;
  description: string;
  costEstimateUSD: number;
  type: 'sightseeing' | 'dining' | 'transit' | 'relaxation' | 'shopping' | string;
}

export interface ItineraryDay {
  dayNumber: number;
  theme: string;
  activities: Activity[];
}

export interface BudgetBreakdown {
  accommodationPercent: number;
  foodPercent: number;
  activitiesPercent: number;
  transportPercent: number;
  estimatedTotalUSD: number;
}

export interface Itinerary {
  destination: string;
  durationDays: number;
  summary: string;
  packingList: string[];
  budgetBreakdown: BudgetBreakdown;
  days: ItineraryDay[];
}

export interface SavedTrip {
  id: string;
  destination: string;
  durationDays: number;
  startDate: string;
  endDate: string;
  budgetLevel: string;
  travelStyle: string;
  itinerary: Itinerary;
  customNotes?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  isError?: boolean;
}
