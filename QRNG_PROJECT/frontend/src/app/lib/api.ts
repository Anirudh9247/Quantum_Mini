import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  timeout: 120000,
});

if (process.env.NEXT_PUBLIC_API_KEY) {
  api.defaults.headers.common["X-API-Key"] = process.env.NEXT_PUBLIC_API_KEY;
}

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await api.get("/health");
    return response.data?.status === "ok";
  } catch {
    return false;
  }
}

export async function runExperiment(generator: string, sampleSize: number) {
  try {
    const response = await api.post("/run-experiment", {
      generator,
      sample_size: sampleSize,
    });

    return {
      success: response.data?.success ?? true,
      data: response.data?.data ?? null,
      error: response.data?.error ?? null,
    };
  } catch (error: any) {
    return {
      success: false,
      data: null,
      error: error?.response?.data?.error ?? "Failed to run experiment.",
    };
  }
}

export async function compareGenerators(sampleSize: number) {
  try {
    const response = await api.post("/comparison/compare-rng", {
      sample_size: sampleSize,
    });

    return {
      success: response.data?.success ?? true,
      data: response.data?.data ?? null,
      error: response.data?.error ?? null,
    };
  } catch (error: any) {
    return {
      success: false,
      data: null,
      error: error?.response?.data?.error ?? "Failed to fetch comparison.",
    };
  }
}

export default api;