## Log output app - reader

Node.js Hono server application. Reads and outputs the last line of a log file written by log output writer. Requests and displays the number of requests made to pingpong application from endpoint set to environment variable `PINGS_URL`.  Also reads and displays the contents of the file `information.txt` placed at the application root folder and displays the value of the environment variable `MESSAGE`. Available at http://localhost:*insert_defined_port_here*/.

Can be run locally with `npm run dev`. With default port available at http://localhost:3000/.