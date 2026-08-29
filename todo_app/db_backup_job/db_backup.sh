#!/usr/bin/env bash
set -e

if [ $POSTGRES_SVC ] && [ $POSTGRES_PORT ] && [ $BUCKET_URL ] && [ $BACKUP_FILE ] && [ $METADATA_URL ] && \
  [ $BACKUP_PATH ] && [ $POSTGRES_USER ] && [ $PGPASSWORD ] && [ $POSTGRES_DB ]
then
  FILENAME="${NAMESPACE}-$(date +%s)-${BACKUP_FILE}"
  FILEPATH="${BACKUP_PATH}/${FILENAME}"

  echo "Dumping database to $FILENAME"

  pg_dump -v -h "${POSTGRES_SVC}" -p "${POSTGRES_PORT}" -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -f "${FILEPATH}"

  if [ -f "$FILEPATH" ]; then
    echo "Backup file created successfully."
  else
    echo "Backup file creation failed!"
    exit 1
  fi

  # To avoid needing to install the complete gcloud api to use gcloud auth we need to request the metadata server for a access token
  # https://docs.cloud.google.com/compute/docs/metadata/querying-metadata#obtain-oauth-tokens
  # -q suppresses default wget output. -O - directs output to console.
  ACCESS_TOKEN="$(curl -H "Metadata-Flavor: Google" -s "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token" | jq -r '.access_token')"
  # See https://docs.cloud.google.com/storage/docs/uploading-objects#rest-upload-objects for constructing the request
  RESPONSE=$(curl -s -X POST --data-binary "@${FILEPATH}"\
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    -H "Content-Type: application/octet-stream" \
    "${BUCKET_URL}/o?uploadType=media&name=${FILENAME}")

  # $? holds the exit status of most recently executed command. 0 means success.
  if [ $? -eq 0 ]; then
    echo "Backup upload successful. Response: ${RESPONSE}"
  else
    echo "Backup upload failed! Reason: ${RESPONSE}"
    exit 1
  fi
fi