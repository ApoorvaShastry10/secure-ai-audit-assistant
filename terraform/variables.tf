variable "gcp_project_id" {
  description = "The GCP project ID to deploy into"
  type        = string
}

variable "gcp_region" {
  description = "The GCP region to deploy into"
  default     = "us-central1"
}

variable "db_username" {
  description = "Master username for the Cloud SQL Postgres instance"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Master password for the Cloud SQL Postgres instance"
  type        = string
  sensitive   = true
}

variable "gcs_bucket_name" {
  description = "Name for the GCS bucket to store audit docs and exported logs"
  type        = string
}

variable "backend_image_url" {
  description = "GCR or Artifact Registry URL for the backend Docker image"
  type        = string
}

output "cloud_run_url" {
  value = google_cloud_run_v2_service.backend.uri
}

output "cloud_sql_connection_name" {
  value = google_sql_database_instance.postgres.connection_name
}
