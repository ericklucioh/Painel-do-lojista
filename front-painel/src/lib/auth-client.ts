import axios from "axios";

export const authClient = axios.create({
    baseURL: "/api/auth",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});
