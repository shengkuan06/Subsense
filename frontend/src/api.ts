import axios from "axios";

const api = axios.create({ baseURL: "http://127.0.0.1:8000/api" });

export const getOverview = () =>
  api.get("/dashboard/overview").then((r) => r.data.data);

export const getAlerts = () => api.get("/alerts").then((r) => r.data);

export const getCustomers = (limit = 100) =>
  api.get(`/customers?limit=${limit}`).then((r) => r.data);

export const getCustomer = (id: string) =>
  api.get(`/customers/${id}`).then((r) => r.data.data);

export const getChurn = (id: string) =>
  api.get(`/customers/${id}/churn`).then((r) => r.data.data);
