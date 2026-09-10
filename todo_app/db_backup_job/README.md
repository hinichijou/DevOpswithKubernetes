## DB backup job

Takes a backup of a Postgres database wit `pg_dump` and saves the result to Google Cloud Storage bucket. Requests `METADATA_URL` for an authentication token which is used to authenticate the Kubernetes service account attached to the pod for a post request to the defined Google Cloud Storage bucket.

Uses the following environment variables:
* POSTGRES_SVC: Name of the postgres service in the cluster
* POSTGRES_PORT: Port of the postgres service
* BUCKET_URL: URL for uploading to the target bucket
* METADATA_URL: URL for requesting the metadata server for a access token for the service account.
* BACKUP_FILE: Base string of th backup file name. Gets prefixed by namespace and timestamp.
* BACKUP_PATH: Path where the backup is saved
* POSTGRES_USER: User for the postgres database.
* PGPASSWORD: Password for the postgres database.
* POSTGRES_DB: The name of the postgres database being backed up.
* NAMESPACE: The namespace where the pod is deployed to. Used to form the backup file name.
