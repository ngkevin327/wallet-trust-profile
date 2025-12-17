import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.API_BASE_URL || "http://localhost:3001";
const SLUG = __ENV.PUBLIC_PROFILE_SLUG || "demo-builder";

export const options = {
  scenarios: {
    cache_warm: {
      executor: "constant-vus",
      vus: 10,
      duration: "30s",
      startTime: "0s",
      tags: { phase: "warm" },
    },
    ramp_load: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "1m", target: 100 },
        { duration: "3m", target: 500 },
        { duration: "2m", target: 500 },
        { duration: "1m", target: 0 },
      ],
      startTime: "35s",
      tags: { phase: "load" },
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<2000"],
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/v1/profiles/${SLUG}`, {
    headers: { Accept: "application/json" },
    tags: { name: "public_profile" },
  });

  check(res, {
    "status is 200": (r) => r.status === 200,
    "has slug": (r) => {
      try {
        return JSON.parse(r.body).slug === SLUG;
      } catch {
        return false;
      }
    },
  });

  sleep(0.3);
}

export function handleSummary(data) {
  return {
    stdout: JSON.stringify(data, null, 2),
    "summary.json": JSON.stringify(data),
  };
}
