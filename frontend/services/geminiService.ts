import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING, description: "A brief executive summary of the consumption trends." },
    recommendations: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Strategic recommendations based on the data."
    },
    regions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING, description: "Name of the Kabupaten or Kota in Indonesia" },
          category: { type: Type.STRING, enum: ['Fruit', 'Vegetable', 'Combined'] },
          currentConsumption: { type: Type.NUMBER, description: "Current year consumption in kg/capita" },
          production: { type: Type.NUMBER, description: "Annual production in metric tonnes" },
          population: { type: Type.INTEGER, description: "Total population of the regency/city" },
          growthRate: { type: Type.NUMBER, description: "Year over year growth percentage" },
          clusterGroup: { type: Type.STRING, enum: ['High', 'Medium', 'Low'], description: "Cluster based on consumption volume" },
          coordinates: {
            type: Type.OBJECT,
            properties: {
              lat: { type: Type.NUMBER, description: "Latitude of the city center" },
              lng: { type: Type.NUMBER, description: "Longitude of the city center" }
            },
            required: ["lat", "lng"]
          },
          historicalData: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                year: { type: Type.INTEGER },
                consumption: { type: Type.NUMBER }
              }
            }
          },
          forecastData: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                year: { type: Type.INTEGER },
                consumption: { type: Type.NUMBER }
              }
            }
          }
        },
        required: ["id", "name", "category", "currentConsumption", "production", "population", "growthRate", "clusterGroup", "coordinates", "historicalData", "forecastData"]
      }
    }
  },
  required: ["summary", "recommendations", "regions"]
};

export const generateAnalysisData = async (regionFocus: string): Promise<AnalysisResult> => {
  try {
    const model = "gemini-2.5-flash";
    const prompt = `
      Generate a realistic, synthetic dataset for Fruit and Vegetable Consumption Analysis for specific Regencies (Kabupaten) or Cities (Kota) in the region of: ${regionFocus || "Java, Indonesia"}.
      
      Requirements:
      1. Generate data for 6-10 distinct Kabupaten/Kota within the requested island/region.
      2. For each region, provide accurate latitude and longitude for its center to map correctly in Indonesia.
      3. Include 'production' (tonnes) and 'population' estimates to allow gap analysis.
      4. Provide historical data from 2019 to 2023.
      5. Perform a forecast for 2024 to 2026 based on trends.
      6. Cluster the regions into 'High', 'Medium', or 'Low' based on consumption per capita.
      7. Return strictly JSON matching the schema.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.4
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisResult;
    }
    
    throw new Error("No data returned from Gemini");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};