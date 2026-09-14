## Dummysite

Node.js Hono server application. The server sends a request to the defined url and saves the response. The saved content is then served when the root path gets requested. Simply saves the body of the request as is i.e. any assets fetched with additional requests will not be displayed.

Has the following environment variables:

* `URL`: defines the destination url where the content gets fetched from. Default `https://example.com/`.

* `PORT`: can be set to change the default port. Default `3000`.

* `FILE_DIR`: Where the response is saved. Default value is `static/`.

* `FILE_NAME`: the name of the file that is saved. Default value `dummy.html`.

Has path `/health` for health checks and `/ready` for readiness checks.

Install with `npm install`

Can be run locally with `npm run dev`.

With default port available at http://localhost:3000/.