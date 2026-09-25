import { defineEventHandler, setHeader } from "nitro/h3";

export default defineEventHandler((event) => {
  setHeader(event, "Access-Control-Allow-Origin", "*");
  setHeader(event, "Content-Type", "application/json");
  return {
    status: "ok",
    service: "circuit-challenge-service",
    timestamp: new Date().toISOString(),
    epoch: Date.now(),
  };
});
