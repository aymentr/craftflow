export type JobStatus = "draft" | "active" | "completed" | "invoiced";

export type Job = {
  id: string;
  company_id: string;
  customer_id: string;
  title: string;
  description: string;
  location: string;
  labor_hours: number;
  status: JobStatus;
  internal_notes?: string | null;
  completed_at?: string | null;
  created_at: string;
};

export type JobPhoto = {
  id: string;
  company_id?: string;
  job_id: string;
  file_url: string;
  storage_bucket?: string | null;
  storage_path?: string | null;
  created_at: string;
};
