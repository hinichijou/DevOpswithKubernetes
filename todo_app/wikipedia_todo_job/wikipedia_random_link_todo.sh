#!/usr/bin/env bash
set -e

if [ $WIKIPEDIA_URL ] && [ $POST_TODO_URL ]
then
  todo_url=$(wget -S $WIKIPEDIA_URL 2>&1 | grep "location:" | grep -o "en.wikipedia.org.*")
  wget --spider --header="Content-Type: application/json" --post-data="{\"title\": \"Read ${todo_url}\"}" $POST_TODO_URL
fi