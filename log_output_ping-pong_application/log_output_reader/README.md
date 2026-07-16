## Log output app - reader

Node.js Hono server application. Reads a log file and the number of requests made to http://localhost:*insert_defined_port_here*/pingpongs on request and outputs them to http://localhost:*insert_defined_port_here*/status.

Can be run locally with `npm run dev`. With default port available at http://localhost:3000/status. Modify the `directory` variable which determines the location of the files if necessary.