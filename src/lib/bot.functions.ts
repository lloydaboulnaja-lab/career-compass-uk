import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { runJobSearch } from "./jobs.server";
import { runCvTailor } from "./cv.server";

export const findJobs = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        category: z.enum(["tech", "casual", "apprenticeship"]),
        extraArea: z.string().max(200).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => runJobSearch(data.category, data.extraArea ?? ""));

export const tailorCv = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        cvText: z.string().trim().min(50).max(20000),
        jobTitle: z.string().trim().min(2).max(160),
        employer: z.string().trim().max(160),
        jobDescription: z.string().trim().max(8000),
      })
      .parse(input),
  )
  .handler(async ({ data }) => runCvTailor(data));
