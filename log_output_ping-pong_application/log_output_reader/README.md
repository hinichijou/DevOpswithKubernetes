## Log output app - reader

Node.js Hono server application. Reads and outputs the last line of a log file written by log output writer. Requests and displays the number of requests made to pingpong application from endpoint set to environment variable `PING_PONG_APP_URL` and `PING_PONG_APP_PINGS_PATH`. Also reads and displays the contents of the file `information.txt` placed at the application root folder and displays the value of the environment variable `MESSAGE`. Available at http://localhost:*insert_defined_port_here*/.

Has path `/health` for health checks and `/ready` for readiness checks. The readiness path checks the response from `PING_PONG_APP_READY_PATH` to define if the app can receive data from the ping pong application.

Can be run locally with `npm run dev`. With default port available at http://localhost:3000/.