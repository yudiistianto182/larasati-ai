import { defineEventHandler, setResponseHeader } from "h3";

export default defineEventHandler((event) => {
  setResponseHeader(event, "Content-Type", "application/json");
  setResponseHeader(event, "Access-Control-Allow-Origin", "*");

  return {
    status: "ok",
    service: "circuit-challenge-service",
    timestamp: new Date().toISOString(),
    epoch: Date.now(),
  };
});
