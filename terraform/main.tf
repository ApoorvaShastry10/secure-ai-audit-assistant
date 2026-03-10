provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}

# Cloud SQL (Postgres)
resource "google_sql_database_instance" "postgres" {
  name             = "secure-audit-db"
  database_version = "POSTGRES_16"
  region           = var.gcp_region

  settings {
    tier    = "db-f1-micro"
    edition = "ENTERPRISE"
    
    ip_configuration {
      ipv4_enabled = true
      # Restrict in production
    }
  }
}

resource "google_sql_database" "database" {
  name     = "secure_audit"
  instance = google_sql_database_instance.postgres.name
}

resource "google_sql_user" "users" {
  name     = var.db_username
  instance = google_sql_database_instance.postgres.name
  password = var.db_password
}

# Cloud Storage (Document & Log Export)
resource "google_storage_bucket" "audit_storage" {
  name          = var.gcs_bucket_name
  location      = var.gcp_region
  force_destroy = true

  versioning {
    enabled = true
  }
}

# Cloud Run (FastAPI Backend)
resource "google_cloud_run_v2_service" "backend" {
  name     = "secure-audit-api"
  location = var.gcp_region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    containers {
      image = var.backend_image_url
      
      env {
        name  = "POSTGRES_DB"
        value = google_sql_database.database.name
      }
      env {
        name  = "POSTGRES_USER"
        value = google_sql_user.users.name
      }
      # In production, reference a secret for the DB password, JWT secret, and Neo4j creds
    }
  }
}

# Allow public unauthenticated access to the Cloud Run service (API handles its own JWT auth)
resource "google_cloud_run_v2_service_iam_member" "public_access" {
  project  = google_cloud_run_v2_service.backend.project
  location = google_cloud_run_v2_service.backend.location
  name     = google_cloud_run_v2_service.backend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
