#!/usr/bin/env bash
set -e

if [ $POSTGRES_URL ] && [ $BUCKET_URL ] && [ $BACKUP_PATH ] && [ $POSTGRES_USER ] && [ $POSTGRES_PASSWORD ] && [ $POSTGRES_DB ]
then
  pg_dump -v postgres://$POSTGRES_USER:$POSTGRES_PASSWORD@$POSTGRES_URL/$POSTGRES_DB > $BACKUP_PATH

  curl -F ‘data=@$BACKUP_PATH’ $BUCKET_URL
fi