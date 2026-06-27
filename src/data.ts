import { Destination } from "./types";

export const CURATED_DESTINATIONS: Destination[] = [
  {
    id: "kyoto",
    name: "Kyoto",
    country: "Japan",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200&auto=format&fit=crop",
    description: "Kyoto is the cultural heart of Japan, famous for its classical Buddhist temples, gardens, imperial palaces, Shinto shrines, and traditional wooden merchant houses.",
    tags: ["Culture", "Temples", "Food", "History"],
    bestTime: "Oct - Dec (Autumn Leaves) & Apr (Cherry Blossoms)",
    averageDailyCost: "$120 - $280 / day",
    popularPlaces: ["Fushimi Inari Shrine", "Arashiyama Bamboo Grove", "Kinkaku-ji (Golden Pavilion)", "Gion District"]
  },
  {
    id: "santorini",
    name: "Santorini",
    country: "Greece",
    image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1200&auto=format&fit=crop",
    description: "Known for its dramatic views, whitewashed houses with blue domes, and stunning caldera cliffs, Santorini is the ultimate Greek romantic paradise.",
    tags: ["Romantic", "Beaches", "Sunset", "Scenic"],
    bestTime: "May - Oct",
    averageDailyCost: "$180 - $450 / day",
    popularPlaces: ["Oia Village", "Fira Cliffs", "Red Beach", "Akrotiri Archaeological Site"]
  },
  {
    id: "rome",
    name: "Rome",
    country: "Italy",
    image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=1200&auto=format&fit=crop",
    description: "A potent blend of haunting ruins, awe-inspiring art, and vibrant street life, Rome is an open-air museum where ancient history meets modern romance.",
    tags: ["History", "Architecture", "Food", "Art"],
    bestTime: "Apr - Jun & Sep - Oct",
    averageDailyCost: "$130 - $320 / day",
    popularPlaces: ["Colosseum", "Vatican Museums", "Trevi Fountain", "Pantheon"]
  },
  {
    id: "paris",
    name: "Paris",
    country: "France",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1200&auto=format&fit=crop",
    description: "The City of Light is a global center for art, fashion, gastronomy, and culture, with centuries-old history visible in its wide boulevards and the winding Seine.",
    tags: ["Art", "Romantic", "Gastronomy", "Fashion"],
    bestTime: "Apr - Jun & Sep - Nov",
    averageDailyCost: "$150 - $380 / day",
    popularPlaces: ["Eiffel Tower", "Louvre Museum", "Notre-Dame Cathedral", "Champs-Élysées"]
  },
  {
    id: "banff",
    name: "Banff",
    country: "Canada",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop",
    description: "Located in the heart of the majestic Canadian Rockies, Banff National Park offers breathtaking views of turquoise glacial lakes, soaring peaks, and rich wildlife.",
    tags: ["Nature", "Adventure", "Hiking", "Skiing"],
    bestTime: "Jun - Aug (Summer Trails) & Dec - Mar (Winter Skiing)",
    averageDailyCost: "$140 - $350 / day",
    popularPlaces: ["Lake Louise", "Moraine Lake", "Banff Gondola", "Johnston Canyon"]
  },
  {
    id: "maui",
    name: "Maui",
    country: "USA",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop",
    description: "Maui, known as 'The Valley Isle', is beloved for its world-famous beaches, the scenic Road to Hana, sacred Iao Valley, and migrating humpback whales.",
    tags: ["Beaches", "Tropical", "Relaxing", "Adventure"],
    bestTime: "Apr - May & Sep - Nov",
    averageDailyCost: "$190 - $490 / day",
    popularPlaces: ["Road to Hana", "Haleakala National Park", "Kaanapali Beach", "Molokini Crater Snorkeling"]
  }
];
