import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { isEligibleJob } from "./job-eligibility";

describe("job eligibility", () => {
  it("keeps entry-level tech roles, not unrelated associates or experienced developers", () => {
    assert.equal(isEligibleJob("tech", "Associate Legal Counsel", "GoCardless", ""), false);
    assert.equal(isEligibleJob("tech", "Operations Planning & Insights Associate", "Deliveroo", ""), false);
    assert.equal(isEligibleJob("tech", "Software Developer", "Example", ""), false);
    assert.equal(isEligibleJob("tech", "Junior Data Analyst", "Example", "SQL and Excel"), true);
    assert.equal(isEligibleJob("tech", "IT Administrator", "Example", "Windows support"), true);
    assert.equal(isEligibleJob("tech", "Helpdesk Administrator", "Example", "Facilities and maintenance enquiries"), false);
  });
  it("excludes paid course advertisements", () => {
    assert.equal(isEligibleJob("tech", "Software Developer Trainee", "ITOL Recruit", "A pathway into tech"), false);
    assert.equal(isEligibleJob("tech", "Junior Software Developer", "Example", "Training course fee payable"), false);
  });
  it("excludes explicit degree requirements without banning optional degrees", () => {
    assert.equal(isEligibleJob("tech", "Associate Software Engineer - Intern", "Monzo", "Must have a bachelor's degree"), false);
    assert.equal(isEligibleJob("tech", "Junior Data Analyst", "Example", "Degree required"), false);
    assert.equal(isEligibleJob("tech", "Junior Data Analyst", "Example", "Degree preferred but not essential"), true);
  });
  it("keeps apprenticeships tech-only and out of the ordinary tech feed", () => {
    assert.equal(isEligibleJob("apprenticeship", "IT Support Apprentice", "QA", ""), true);
    assert.equal(isEligibleJob("apprenticeship", "Nursery Apprentice", "Example", ""), false);
    assert.equal(isEligibleJob("apprenticeship", "Customer Support Apprentice", "Example", ""), false);
    assert.equal(isEligibleJob("tech", "IT Support Apprentice", "QA", ""), false);
  });
  it("keeps casual work suitable for screening at 17", () => {
    assert.equal(isEligibleJob("casual", "Barista", "Example", "Training provided"), true);
    assert.equal(isEligibleJob("casual", "Retail Assistant", "Example", "Must be at least 18"), false);
    assert.equal(isEligibleJob("casual", "Delivery Driver", "Example", ""), false);
  });
});