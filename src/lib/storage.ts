import type { JobLead, TailorResult } from "./types";

const CV_KEY = "kjb.cv";
const SAVED_KEY = "kjb.saved";
const TAILORED_KEY = "kjb.tailored";


/** Cached snapshots so useSyncExternalStore gets a stable reference. */
const cache = new Map<string, unknown>();

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  if (cache.has(key)) return cache.get(key) as T;
  let value = fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw) value = JSON.parse(raw) as T;
  } catch {
    value = fallback;
  }
  cache.set(key, value);
  return value;
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    cache.set(key, value);
    window.dispatchEvent(new Event("kjb-storage"));
  } catch (error) {
    console.warn("Could not save locally", error);
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key) cache.delete(event.key);
    else cache.clear();
  });
}

export const cvStore = {
  get: () => read<string>(CV_KEY, ""),
  set: (text: string) => write(CV_KEY, text),
};

export const savedJobs = {
  get: () => read<JobLead[]>(SAVED_KEY, []),
  toggle: (job: JobLead) => {
    const current = read<JobLead[]>(SAVED_KEY, []);
    const exists = current.some((j) => j.id === job.id);
    write(SAVED_KEY, exists ? current.filter((j) => j.id !== job.id) : [job, ...current]);
    return !exists;
  },
  remove: (id: string) =>
    write(
      SAVED_KEY,
      read<JobLead[]>(SAVED_KEY, []).filter((j) => j.id !== id),
    ),
};


export interface TailoredRecord extends TailorResult {
  id: string;
  jobTitle: string;
  employer: string;
  createdAt: string;
}

export const tailoredStore = {
  get: () => read<TailoredRecord[]>(TAILORED_KEY, []),
  add: (record: TailoredRecord) =>
    write(TAILORED_KEY, [record, ...read<TailoredRecord[]>(TAILORED_KEY, [])].slice(0, 5)),
};

export function subscribeStore(listener: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("kjb-storage", listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener("kjb-storage", listener);
    window.removeEventListener("storage", listener);
  };
}
