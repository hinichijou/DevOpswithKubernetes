#!/usr/bin/env bash
set -e

if [ $POSTGRES_URL ] && [ $BUCKET_URL ] && [ $BACKUP_FILE ] && [ $METADATA_URL ] && \
  [ $BACKUP_PATH ] && [ $POSTGRES_USER ] && [ $POSTGRES_PASSWORD ] && [ $POSTGRES_DB ]
then
  echo "Dumping database to $BACKUP_PATH/$BACKUP_FILE"

  pg_dump -v "postgres://$POSTGRES_USER:$POSTGRES_PASSWORD@$POSTGRES_URL/$POSTGRES_DB" > "$BACKUP_PATH/$BACKUP_FILE"

  if [ -f "$BACKUP_PATH/$BACKUP_FILE" ]
    echo "Backup file created successfully."
  else
    echo "Backup file creation failed!"
    # Makes sense to exit here but better to test that the script works in the first place first

  # To avoid needing to install the complete gcloud api to use gcloud auth we need to request the metadata server for a access token
  # https://docs.cloud.google.com/compute/docs/metadata/querying-metadata#obtain-oauth-tokens
  # -q suppresses default wget output. -O - directs output to console.
  RESPONSE=$(wget -q -O - \
    --header="Authorization: Bearer $(wget -q -O - --header="Metadata-Flavor: Google" $METADATA_URL | jq -r '.access_token')" \
    --header="Content-Type: application/octet-stream" \
    --post-file="$BACKUP_PATH/$BACKUP_FILE" "$BUCKET_URL/o?uploadType=media&name=$BACKUP_FILE")

  # $? holds the exit status of most recently executed command. 0 means success.
  if [ $? -eq 0 ]; then
    echo "Backup upload successful."
  else
    echo "Backup upload failed! Reason: $RESPONSE"
  fi
fi