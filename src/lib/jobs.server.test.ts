import { describe, it, expect, mock, beforeEach } from "bun:test";
import type { JobLead } from "./types";

const reed = mock(async (_category: string, _keyword: string, _wider?: boolean) => ({ jobs: [] as (JobLead & { postedAt: number })[], available: true }));
const company = mock(async (_category: string) => ({ jobs: [] as (JobLead & { postedAt: number })[], available: true }));
mock.module("./reed.server", () => ({ fetchLiveJobs: reed }));
mock.module("./greenhouse.server", () => ({ fetchGreenhouseJobs: company }));
const { runJobSearch } = await import("./jobs.server");
const lead: JobLead & { postedAt: number } = { id: "test", title: "Junior Data Analyst", employer: "Example", location: "London", category: "tech", payHint: "Pay not listed", summary: "SQL", whyYou: "Check requirements", requirements: [], applyUrl: "https://example.com/jobs/1", source: "Test", postedHint: "Posted today", postedAt: 1 };

describe("search availability", () => {
  beforeEach(() => {
    reed.mockReset(); company.mockReset();
    reed.mockResolvedValue({ jobs: [], available: true });
    company.mockResolvedValue({ jobs: [], available: true });
  });
  it("widens a successful empty search once without inventing openings", async () => {
    reed.mockResolvedValueOnce({ jobs: [], available: true }).mockResolvedValueOnce({ jobs: [lead], available: true });
    const result = await runJobSearch("tech", "");
    expect(reed).toHaveBeenCalledTimes(2);
    expect(reed).toHaveBeenLastCalledWith("tech", "", true);
    expect(result.jobs[0]?.id).toBe("test");
    expect(result.notice).toContain("last month");
  });
  it("does not label a source outage as no vacancies or run a wider search", async () => {
    reed.mockResolvedValue({ jobs: [], available: false });
    await expect(runJobSearch("casual", "")).rejects.toThrow("couldn't be reached");
    expect(reed).toHaveBeenCalledTimes(1);
  });
  it("returns a genuine empty result after the wider window", async () => {
    const result = await runJobSearch("tech", "");
    expect(result.jobs).toEqual([]);
    expect(reed).toHaveBeenCalledTimes(2);
  });
  it("keeps a responding source when another fails", async () => {
    reed.mockResolvedValue({ jobs: [], available: false });
    company.mockResolvedValue({ jobs: [lead], available: true });
    const result = await runJobSearch("tech", "");
    expect(result.jobs.length).toBe(1);
    expect(result.notice).toContain("temporarily unavailable");
  });
});