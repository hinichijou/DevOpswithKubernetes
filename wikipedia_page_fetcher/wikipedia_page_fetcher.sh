#!/usr/bin/env bash
set -e

echo 'Wikipedia page fetcher running'

cd page

if [ $MAX_TIMEOUT ] && [ $MIN_TIMEOUT ]
then
  if [ $MAX_TIMEOUT -gt 0 ] && [ $MIN_TIMEOUT -gt 0 ]
  then
    TIMEOUT=$(( $MIN_TIMEOUT + RANDOM % ($MAX_TIMEOUT - $MIN_TIMEOUT)))
    echo "Pod sleep: ${TIMEOUT} seconds"
    sleep $TIMEOUT
  fi
fi

if [ $WIKIPEDIA_URL ] && [ $FILE_NAME ]
then
  wget -O $FILE_NAME $WIKIPEDIA_URL
  echo "${WIKIPEDIA_URL} fetched and saved to file ${FILE_NAME}"
elif [ $FILE_NAME ]
then
  random_url=$(wget -S 'https://en.wikipedia.org/wiki/Special:Random' 2>&1 | grep 'location:' | grep -o 'en.wikipedia.org.*')
  echo "Next fetch target: ${random_url}"
  sleep 1
  wget -O $FILE_NAME $random_url
  echo "${random_url} fetched and saved to file ${FILE_NAME}"
fi