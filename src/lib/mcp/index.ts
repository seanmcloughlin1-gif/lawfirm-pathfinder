import { defineMcp } from "@lovable.dev/mcp-js";
import searchJobs from "./tools/search-jobs";
import getJob from "./tools/get-job";
import listEmployers from "./tools/list-employers";
import getEmployer from "./tools/get-employer";

export default defineMcp({
  name: "jd-careers-mcp",
  title: "JD Careers",
  version: "0.1.0",
  instructions:
    "Public read-only tools for the JD Careers job board — a niche marketplace for non-practicing attorneys and JD-advantage legal roles. Use search_jobs to find open positions with filters (category, location, remote, JD-advantage), get_job for the full description and apply URL, list_employers to browse hiring organizations, and get_employer for an employer profile with their current openings.",
  tools: [searchJobs, getJob, listEmployers, getEmployer],
});
