/**
 * API client — same-origin when served by FastAPI static mount.
 */
const DEFAULT_BASE = "";

function joinUrl(base, path) {
  const b = base.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

export async function checkHealth(baseUrl = DEFAULT_BASE) {
  const url = joinUrl(baseUrl, "/health");
  const res = await fetch(url, { method: "GET", headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Health check failed (${res.status})`);
  return res.json();
}

export async function analyzeGraph(formData, baseUrl = DEFAULT_BASE) {
  const url = joinUrl(baseUrl, "/upload_and_analyze_graph");
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    body: formData,
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error("Invalid JSON from server");
  }
  if (!res.ok) {
    const detail = data.detail ?? data.message ?? text;
    throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
  }
  return data;
}
