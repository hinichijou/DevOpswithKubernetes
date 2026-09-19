## Log output app - reader

Node.js Hono server application. Reads and outputs the last line of a log file written by log output writer. Requests and displays the number of requests made to pingpong application. Also reads and displays the contents of the file `information.txt` placed at the application root folder and displays the value of the environment variable `MESSAGE`. In addition displays a greeting message requested from the greeter application. Available at http://localhost:*insert_defined_port_here*/.

Has path `/health` for health checks and `/ready` for readiness checks.

Has the following environment variables:

* `MESSAGE`: defines the message that is displayed after `env variable: MESSAGE=`. If not set the text displayed will be `env variable: MESSAGE=undefined`.

* `PORT`: can be set to change the default port. Default `3000`.

* `PING_PONG_APP_URL`: the url of the ping pong application service. If not set the text displayed will be `Ping / Pongs: Unable to get response`.

* `PING_PONG_APP_PINGS_PATH`: the pings path of the ping pong application. If not set the text displayed will be `Ping / Pongs: Unable to get response`.

* `PING_PONG_APP_READY_PATH`: the ready path of the ping pong application. If not set the `/ready` path of the application will return 503.

* `GREETER_APP_URL`: the url of the greeter application service. If not set the text displayed will be `greetings: Unable to get response`.

* `GREETER_APP_MESSAGE_PATH`: the message path of the greeter application service. If not set the text displayed will be `greetings: Unable to get response`.

* `GREETER_APP_READY_PATH`: the ready path of the greeter application. If not set the `/ready` path of the application will return 503.

Can be run locally with `npm run dev`. With default port available at http://localhost:3000/.