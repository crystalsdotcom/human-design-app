const API_BASE = ""; // Uses Next.js proxy → /api/* → backend on :8000

export interface PlanetData {
  planet: string;
  longitude: number;
  gate: number;
  line: number;
  color: number;
  tone: number;
  base: number;
  retrograde: boolean;
}

export interface ChartData {
  name?: string;
  type_: string;
  authority: string;
  profile: [number, number];
  definition: string;
  defined_centers: string[];
  undefined_centers: string[];
  defined_channels: string[];
  defined_gates: number[];
  personality: Record<string, PlanetData>;
  design: Record<string, PlanetData>;
  birth_date: string;
  design_date: string;
}

export interface ChartRequest {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  latitude: number;
  longitude: number;
  timezone_offset: number;
  name?: string;
}

export async function calculateChart(req: ChartRequest): Promise<ChartData> {
  const res = await fetch(`${API_BASE}/api/chart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to calculate chart");
  }
  return res.json();
}

export async function getInterpretation(
  chart: ChartData,
  question?: string,
  depth: "quick" | "standard" | "deep" = "standard"
): Promise<string> {
  const res = await fetch(`${API_BASE}/api/interpret`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chart, question, depth }),
  });
  if (!res.ok) throw new Error("Failed to get interpretation");
  const data = await res.json();
  return data.interpretation;
}

export async function streamDecisionSimulation(
  chart: ChartData,
  decision: string,
  onChunk: (chunk: string) => void,
  onDone: () => void
) {
  const res = await fetch(`${API_BASE}/api/simulate/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chart, decision }),
  });

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const text = decoder.decode(value);
    const lines = text.split("\n");
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const chunk = line.slice(6);
        if (chunk === "[DONE]") { onDone(); return; }
        onChunk(chunk);
      }
    }
  }
  onDone();
}

export async function streamInterpretation(
  chart: ChartData,
  question: string | undefined,
  depth: "quick" | "standard" | "deep" = "standard",
  onChunk: (chunk: string) => void,
  onDone: () => void
) {
  const res = await fetch(`${API_BASE}/api/interpret/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chart, question, depth }),
  });

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const text = decoder.decode(value);
    const lines = text.split("\n");
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const chunk = line.slice(6);
        if (chunk === "[DONE]") { onDone(); return; }
        onChunk(chunk);
      }
    }
  }
  onDone();
}
