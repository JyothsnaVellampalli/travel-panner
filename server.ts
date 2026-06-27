import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API endpoint for general travel chatbot
app.post("/api/chat", async (req, res) => {
  try {
    const { message, chatHistory } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    // Prepare system instructions for a high-quality travel assistant
    const systemInstruction = `You are "Nomad AI", an exceptionally friendly, professional, and knowledgeable travel concierge.
Your goal is to help users plan trips, suggest local attractions, food, hotels, packing lists, travel hacks, and handle any travel-related questions.
Keep your responses helpful, engaging, and beautifully structured. Use clean markdown formatting (bold text, bullet points, numbered lists) for easy readability.
Give practical tips and realistic pricing estimates when asked. Be enthusiastic about exploration and respecting local cultures.`;

    // Format chat history for Gemini chat API
    // We can use ai.chats or simple generateContent with formatted messages.
    // Standard generateContent is very reliable and handles the full instruction cleanly.
    const contents = [];
    
    // Add history if present
    if (chatHistory && Array.isArray(chatHistory)) {
      chatHistory.forEach((msg: { role: string; content: string }) => {
        contents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }]
        });
      });
    }
    
    // Add current message
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ reply: response.text || "I'm sorry, I couldn't formulate a response. Please try again." });
  } catch (error: any) {
    console.error("Chat API error:", error);
    res.status(500).json({ 
      error: "Nomad AI is currently navigating through some turbulence. Please try again in a moment.",
      details: error.message 
    });
  }
});

// API endpoint for generating structured itineraries
app.post("/api/generate-itinerary", async (req, res) => {
  try {
    const { destination, daysCount, budget, travelStyle } = req.body;

    if (!destination) {
      return res.status(400).json({ error: "Destination is required." });
    }

    const duration = parseInt(daysCount) || 3;
    const budgetLevel = budget || "Moderate";
    const style = travelStyle || "Adventure";

    const prompt = `Create a highly comprehensive, custom day-by-day travel itinerary for a ${duration}-day trip to ${destination}.
The traveler has selected a "${budgetLevel}" budget level and is seeking a "${style}" travel style.
Generate realistic times, activities, estimated costs in USD, and a sensible travel routing.
Ensure your daily themes and activities reflect local culture and the specified style.`;

    const systemInstruction = `You are a professional travel planner. Generate an exceptionally detailed, highly realistic, and organized trip itinerary.
All cost estimates should be realistic for the specified destination and budget level (Budget, Moderate, Luxury).
Your output must conform EXACTLY to the requested JSON schema. Do not include any text outside the JSON response.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.75,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["destination", "durationDays", "summary", "packingList", "budgetBreakdown", "days"],
          properties: {
            destination: { type: Type.STRING },
            durationDays: { type: Type.INTEGER },
            summary: { type: Type.STRING, description: "A high-level engaging summary of the trip highlighting what makes it special." },
            packingList: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "5-8 custom recommended items to pack for this destination and style."
            },
            budgetBreakdown: {
              type: Type.OBJECT,
              required: ["accommodationPercent", "foodPercent", "activitiesPercent", "transportPercent", "estimatedTotalUSD"],
              properties: {
                accommodationPercent: { type: Type.INTEGER, description: "Percentage of budget for stays (0-100)" },
                foodPercent: { type: Type.INTEGER, description: "Percentage of budget for dining (0-100)" },
                activitiesPercent: { type: Type.INTEGER, description: "Percentage of budget for sightseeing and entry fees (0-100)" },
                transportPercent: { type: Type.INTEGER, description: "Percentage of budget for local transit (0-100)" },
                estimatedTotalUSD: { type: Type.INTEGER, description: "Estimated total cost for the whole trip in USD" }
              }
            },
            days: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["dayNumber", "theme", "activities"],
                properties: {
                  dayNumber: { type: Type.INTEGER },
                  theme: { type: Type.STRING, description: "Catchy focus/theme of the day (e.g., Temple Crawls & Bamboo Trails)" },
                  activities: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      required: ["time", "title", "description", "costEstimateUSD", "type"],
                      properties: {
                        time: { type: Type.STRING, description: "Time of day (e.g. 09:00 AM, 12:30 PM, Evening)" },
                        title: { type: Type.STRING, description: "Name of place or activity" },
                        description: { type: Type.STRING, description: "Short description of what to do, see, or eat." },
                        costEstimateUSD: { type: Type.INTEGER, description: "Estimated cost in USD per person. Put 0 if free." },
                        type: { type: Type.STRING, description: "One of: sightseeing, dining, transit, relaxation, shopping" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response received from Gemini API");
    }

    const itineraryData = JSON.parse(text);
    res.json(itineraryData);
  } catch (error: any) {
    console.error("Generate itinerary error:", error);
    res.status(500).json({ 
      error: "Failed to generate your personalized itinerary due to a celestial map failure. Please try again.",
      details: error.message 
    });
  }
});

// Serve static assets and handle routing
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

startServer();
