## Ping-pong application

Node.js express server application. Counts how many times http://localhost:*insert_defined_port_here* is requested and outputs the count. http://localhost:*insert_defined_port_here*/pings returns the count without incrementing the counter. Saves the counter to and fetches it from a Postgres database which means a local Postgres instance is required. Expects the environment variable `PGPASSWORD` to be set to the environment and match the database password. You should also consider setting `PGUSER`, `PGHOST` and `PGDATABASE` to suitable values. Fetches the value `counter` from table `pingpongs` which means both of these should exist in the database.

Can be run locally with `npm run dev`. With default port available at http://localhost:3000.
