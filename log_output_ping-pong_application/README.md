## Log output and ping-pong applications

Contains source code for the course exercise application. Configurations and instructions for running the application in a Kubernetes cluster can be found from [a separate repository](https://github.com/hinichijou/DevOpswithKubernetesManifests/tree/4.10/log_output_ping-pong_application).

* The [ping-pong_application folder](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.10/log_output_ping-pong_application/ping-pong_application) contains the source code for a Node.js Express server that has a route for incrementing a counter that is saved to a Postgres database and a route for fetching the value for the counter.

* The [log_output_writer folder](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.10/log_output_ping-pong_application/log_output_writer) contains the source code for a Python script that writes a random string and a time stamp to a log file.

* The [log_output_reader folder](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.10/log_output_ping-pong_application/log_output_reader) contains the source code for a Node.js Hono server that displays the latest log row, the value of an env variable, the value contents of a provided text file and the ping-pong application counter value.