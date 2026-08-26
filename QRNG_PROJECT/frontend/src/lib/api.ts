import axios from 'axios';
import { ExperimentResult, ComparisonResult, ApiResponse } from '@/types/experiment';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '',
  timeout: 120000, // 2 minutes timeout to account for cold starts on Render
});

apiClient.interceptors.request.use((config) => {
  const apiKey = process.env.NEXT_PUBLIC_API_KEY;
  if (apiKey) {
    config.headers['x-api-key'] = apiKey;
  }
  return config;
});

export const checkHealth = async (): Promise<boolean> => {
  try {
    const res = await apiClient.get('/health');
    return res.data.status === 'ok';
  } catch {
    return false;
  }
};

export const runExperiment = async (
  generator: string,
  sampleSize: number
): Promise<ApiResponse<ExperimentResult>> => {
  try {
    const res = await apiClient.post('/run-experiment-db', {
      generator,
      sample_size: sampleSize,
    });
    return res.data;
  } catch (error: any) {
    return {
      success: false,
      data: null,
      error: error?.response?.data?.error || error?.message || 'Failed to execute experiment',
    };
  }
};

export const compareGenerators = async (
  sampleSize = 100
): Promise<ApiResponse<ComparisonResult>> => {
  try {
    const res = await apiClient.post('/comparison/compare-rng', {
      sample_size: sampleSize,
    });
    return res.data;
  } catch (error: any) {
    return {
      success: false,
      data: null,
      error: error?.response?.data?.error || error?.message || 'Failed to compare generators',
    };
  }
};

export const getExperiments = async (): Promise<ApiResponse<ExperimentResult[]>> => {
  try {
    const res = await apiClient.get('/experiments');
    return res.data;
  } catch (error: any) {
    return {
      success: false,
      data: null,
      error: error?.response?.data?.error || error?.message || 'Failed to fetch experiment logs',
    };
  }
};

export const getExperimentById = async (
  id: number
): Promise<ApiResponse<ExperimentResult>> => {
  try {
    const res = await apiClient.get(`/experiment/${id}`);
    return res.data;
  } catch (error: any) {
    return {
      success: false,
      data: null,
      error: error?.response?.data?.error || error?.message || 'Experiment record not found',
    };
  }
};

export default apiClient;
