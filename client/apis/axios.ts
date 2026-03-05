import axios from "axios";

// Create reusable axios instance
export const api = axios.create({

  // Backend base URL
  baseURL: process.env.NEXT_PUBLIC_API_URL,

  // Allows cookies to be sent automatically, needed for refresh token stored in httpOnly cookie
  withCredentials: true,
});