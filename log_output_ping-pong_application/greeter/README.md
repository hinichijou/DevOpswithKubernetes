## Greeter

Node.js Hono server application. Responds with a greeting message when a GET request is sent to the root path.

Has the following environment variables:

* `MESSAGE`: defines the message that is served by the root path. Default `Hello from version 1`.

* `PORT`: can be set to change the default port. Default `3000`.

Has path `/health` for health checks and `/ready` for readiness checks.

Install with `npm install`

Can be run locally with `npm run dev`.

With default port available at http://localhost:3000/.