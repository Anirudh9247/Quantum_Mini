import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 120000, // 2 minutes timeout to account for cold starts on Render
});

export default api;
