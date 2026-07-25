## Log output app - reader

Node.js Hono server application. Reads a log file written by log output writer and requests the number of requests made to http://localhost:*insert_defined_port_here*/pingpongs on request. Fetches the number of requests from endpoint http://pingpongapp-svc:2345/pings, meaning the functionality assumes the pingpongapp-svc is deployed and available in the same cluster at port 2345. Available at http://localhost:*insert_defined_port_here*/. Also reads and displays the contents of the file `information.txt` placed at the application root folder and displays the value of the environment variable `MESSAGE`.

Can be run locally with `npm run dev`. With default port available at http://localhost:3000/.