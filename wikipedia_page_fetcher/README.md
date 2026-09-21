## Wikipedia page fetcher

Fetches the HTML content of a Wikipedia page and saves it to disk. If requesting `https://en.wikipedia.org/wiki/Special:Random` will first make a request to fetch the target link and then fetch the page after a short wait to avoid being treated as a bot. Will sleep for a random amount of seconds defined with the environment variables after the request.

Uses the following environment variables:
* WIKIPEDIA_URL: the Wikipedia page fetched. If unset will request `https://en.wikipedia.org/wiki/Special:Random`.
* FILE_NAME: the name of the file which is saved to disk.
* MAX_TIMEOUT: the maximum timeout before the request in seconds. If < 1 the sleep will be skipped.
* MIN_TIMEOUT: the minimum timeout before the request in seconds. If < 1 the sleep will be skipped.