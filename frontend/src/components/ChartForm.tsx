"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { calculateChart, ChartData } from "@/lib/api";

interface Props {
  onChart: (chart: ChartData) => void;
}

// Open-Meteo geocoding result — returns lat, lon AND timezone in one CORS-friendly call
interface GeoResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  timezone: string;
  country: string;
  admin1?: string;
  country_code: string;
}

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

function getCityLabel(r: GeoResult): string {
  return [r.name, r.admin1, r.country].filter(Boolean).join(", ");
}

function getOffsetAtDatetime(tz: string, year: number, month: number, day: number, hour: number, min: number): number {
  try {
    // Use the actual birth date/time to get historically correct DST offset
    const d = new Date(year, month - 1, day, hour, min);
    const utcStr = d.toLocaleString("en-US", { timeZone: "UTC" });
    const tzStr  = d.toLocaleString("en-US", { timeZone: tz });
    return Math.round((new Date(tzStr).getTime() - new Date(utcStr).getTime()) / 3600000);
  } catch {
    return 0;
  }
}

export default function ChartForm({ onChart }: Props) {
  const [name,   setName]   = useState("");
  const [day,    setDay]    = useState("");
  const [month,  setMonth]  = useState("");
  const [year,   setYear]   = useState("");
  const [hour,   setHour]   = useState("");
  const [minute, setMinute] = useState("");
  const [ampm,   setAmpm]   = useState<"AM" | "PM">("AM");

  // City autocomplete
  const [cityQuery,    setCityQuery]    = useState("");
  const [cityResults,  setCityResults]  = useState<GeoResult[]>([]);
  const [selectedCity, setSelectedCity] = useState<{
    label: string; lat: number; lon: number; tz: string;
  } | null>(null);
  const [cityLoading,  setCityLoading]  = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const debounceRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Open-Meteo: single call returns lat + lon + timezone — no CORS issues, no API key
  const searchCity = useCallback(async (q: string) => {
    if (q.length < 2) { setCityResults([]); setShowDropdown(false); return; }
    setCityLoading(true);
    try {
      const res  = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=en&format=json`
      );
      const data = await res.json();
      const results: GeoResult[] = (data.results || []).slice(0, 5);
      setCityResults(results);
      setShowDropdown(results.length > 0);
    } catch {
      setCityResults([]);
    } finally {
      setCityLoading(false);
    }
  }, []);

  function handleCityInput(value: string) {
    setCityQuery(value);
    setSelectedCity(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchCity(value), 380);
  }

  // Synchronous — timezone is already in the Open-Meteo result, no second API call needed
  function selectCity(result: GeoResult) {
    const label = getCityLabel(result);
    setCityQuery(label);
    setShowDropdown(false);
    setSelectedCity({
      label,
      lat: result.latitude,
      lon: result.longitude,
      tz:  result.timezone,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!day || !month || !year)      { setError("Please enter your birth date.");           return; }
    if (!hour || minute === "")       { setError("Please enter your birth time.");           return; }
    if (!selectedCity)                { setError("Please select a birth city from the list."); return; }

    const y = parseInt(year), m = parseInt(month), d = parseInt(day);
    const rawHour = parseInt(hour), min = parseInt(minute);

    if (y < 1900 || y > 2025)    { setError("Please enter a valid birth year."); return; }
    if (rawHour < 1 || rawHour > 12) { setError("Hour must be 1–12.");           return; }
    if (min < 0 || min > 59)     { setError("Minute must be 0–59.");             return; }

    // Convert 12-hour → 24-hour
    let h = rawHour;
    if (ampm === "AM" && rawHour === 12) h = 0;
    if (ampm === "PM" && rawHour !== 12) h = rawHour + 12;

    const offset = getOffsetAtDatetime(selectedCity.tz, y, m, d, h, min);

    setLoading(true);
    try {
      const chart = await calculateChart({
        year: y, month: m, day: d, hour: h, minute: min,
        latitude:         selectedCity.lat,
        longitude:        selectedCity.lon,
        timezone_offset:  offset,
        name:             name.trim() || undefined,
      });
      onChart(chart);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto text-left">

      {/* Name */}
      <div className="mb-12">
        <label className="label-luxury">Your Name</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Optional"
          className="input-line"
        />
      </div>

      {/* Birth Date */}
      <div className="mb-12">
        <label className="label-luxury">Date of Birth</label>
        <div className="grid grid-cols-3 gap-8">
          <div>
            <input
              value={day}
              onChange={e => setDay(e.target.value.replace(/\D/g, "").slice(0, 2))}
              placeholder="DD"
              className="input-line"
              maxLength={2}
            />
          </div>
          <div>
            <select
              value={month}
              onChange={e => setMonth(e.target.value)}
              className="input-line cursor-pointer appearance-none"
            >
              <option value="">Month</option>
              {MONTHS.map((mo, i) => (
                <option key={mo} value={String(i + 1)}>{mo}</option>
              ))}
            </select>
          </div>
          <div>
            <input
              value={year}
              onChange={e => setYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="YYYY"
              className="input-line"
              maxLength={4}
            />
          </div>
        </div>
      </div>

      {/* Birth Time */}
      <div className="mb-12">
        <label className="label-luxury">Time of Birth</label>
        <div className="grid grid-cols-3 gap-8">
          <div>
            <input
              value={hour}
              onChange={e => setHour(e.target.value.replace(/\D/g, "").slice(0, 2))}
              placeholder="Hour"
              className="input-line"
              maxLength={2}
            />
          </div>
          <div>
            <input
              value={minute}
              onChange={e => setMinute(e.target.value.replace(/\D/g, "").slice(0, 2))}
              placeholder="Minute"
              className="input-line"
              maxLength={2}
            />
          </div>
          <div>
            <select
              value={ampm}
              onChange={e => setAmpm(e.target.value as "AM" | "PM")}
              className="input-line cursor-pointer appearance-none"
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>
      </div>

      {/* Birth City */}
      <div className="mb-12">
        <label className="label-luxury">Birth City</label>
        <div className="relative" ref={dropdownRef}>
          <div className="relative">
            <input
              value={cityQuery}
              onChange={e => handleCityInput(e.target.value)}
              onFocus={() => cityResults.length > 0 && setShowDropdown(true)}
              placeholder="City, Country"
              className="input-line"
              autoComplete="off"
            />
            {cityLoading && (
              <span className="absolute right-0 bottom-3 text-[10px] text-[#1A1714]/25 tracking-widest">
                —
              </span>
            )}
          </div>

          {/* Autocomplete dropdown */}
          {showDropdown && cityResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-[#F8F6F2] border border-[#1A1714]/10 shadow-lg z-50 mt-1">
              {cityResults.map((result) => (
                <button
                  key={result.id}
                  type="button"
                  onClick={() => selectCity(result)}
                  className="w-full text-left px-4 py-3.5 text-sm text-[#1A1714] hover:text-[#7C3AED] transition-colors border-b border-[#1A1714]/6 last:border-0 flex items-baseline gap-2"
                >
                  <span className="font-medium">{result.name}</span>
                  <span className="text-[10px] text-[#1A1714]/30 truncate">
                    {[result.admin1, result.country].filter(Boolean).join(", ")}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Detected timezone */}
          {selectedCity && (
            <p className="text-[10px] text-[#1A1714]/30 mt-2.5 tracking-widest">
              {selectedCity.tz.replace(/_/g, " ")}
            </p>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-400 mb-6 tracking-wide">{error}</p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full border border-[#1A1714] text-[#1A1714] hover:bg-[#1A1714] hover:text-[#F8F6F2] disabled:opacity-25 disabled:cursor-not-allowed py-4 text-[11px] font-medium tracking-[0.22em] uppercase transition-all duration-300"
      >
        {loading ? "Calculating…" : "Reveal My Chart"}
      </button>
    </form>
  );
}
