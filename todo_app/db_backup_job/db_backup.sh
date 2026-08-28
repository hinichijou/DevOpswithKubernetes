#!/usr/bin/env bash
set -e

if [ $POSTGRES_SVC ] && [ $POSTGRES_PORT ] && [ $BUCKET_URL ] && [ $BACKUP_FILE ] && [ $METADATA_URL ] && \
  [ $BACKUP_PATH ] && [ $POSTGRES_USER ] && [ $POSTGRES_PASSWORD ] && [ $POSTGRES_DB ]
then
  FILENAME="${NAMESPACE}-$(date +%s)-${BACKUP_FILE}"
  FILEPATH="${BACKUP_PATH}/${FILENAME}"

  echo "Dumping database to $FILENAME"

  pg_dump -v -h "${POSTGRES_SVC}" -p "${POSTGRES_PORT}" -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -f "${FILEPATH}"

  if [ -f "$FILEPATH" ]; then
    echo "Backup file created successfully."
  else
    echo "Backup file creation failed!"
    # Makes sense to exit here but better to test that the script works in the first place first
  fi

  # To avoid needing to install the complete gcloud api to use gcloud auth we need to request the metadata server for a access token
  # https://docs.cloud.google.com/compute/docs/metadata/querying-metadata#obtain-oauth-tokens
  # -q suppresses default wget output. -O - directs output to console.
  RESPONSE=$(wget -q -O - \
    --header="Authorization: Bearer $(wget -q -O - --header="Metadata-Flavor: Google" ${METADATA_URL} | jq -r '.access_token')" \
    --header="Content-Type: application/octet-stream" \
    --post-file="${FILEPATH}" "${BUCKET_URL}/o?uploadType=media&name=${FILENAME}")

  # $? holds the exit status of most recently executed command. 0 means success.
  if [ $? -eq 0 ]; then
    echo "Backup upload successful."
  else
    echo "Backup upload failed! Reason: ${RESPONSE}"
  fi
fi