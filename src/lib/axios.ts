import axios from "axios";
import { redirectToSignIn } from "@/lib/auth/sessionExpiry";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      redirectToSignIn();
    }

    const message =
      err.response?.data?.error || err.message || "Request failed";
    return Promise.reject(new Error(message));
  },
);

export default api;
