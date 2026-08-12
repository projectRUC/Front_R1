import http from 'k6/http';
import { check } from 'k6';

export const options = {
  scenarios: {
    ia_stress: { executor: 'per-vu-iterations', vus: 50, iterations: 1 },
  },
  thresholds: {
    http_req_duration: ['p(95)<3000'],
    http_req_failed: ['rate<0.05'],
  },
};

export default function () {
  const res = http.post(
    'http://localhost/api/ai/generate',
    JSON.stringify({ prompt: 'Genera un resumen del sprint actual' }),
    { headers: { 'Content-Type': 'application/json', Cookie: __ENV.AUTH_COOKIE } }
  );
  check(res, { 'status 200': (r) => r.status === 200 });
}
