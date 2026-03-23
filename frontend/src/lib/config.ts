// src/lib/config.ts
import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";

export const API_BASE = "http://localhost:8000";

export default axios;