## Todo app

Contains source code for an application that displays a list of todos and a random image from `https://picsum.photos/1200`. Consists of a Next.js + React frontend, a Node.js + Hono backend and a PostgreSQL database which is used by the backend to store the todo data.

Configurations and instructions for running the application in a Kubernetes cluster can be found from [a separate repository](https://github.com/hinichijou/DevOpswithKubernetesManifests/todo_app).

* The [backend folder](https://github.com/hinichijou/DevOpswithKubernetesManifests/todo_app/backend) contains the source code for application backend.

* The [todo_app_frontend folder](https://github.com/hinichijou/DevOpswithKubernetesManifests/todo_app/todo_app_frontend) contains the source code for application frontend.

* The [broadcaster folder](https://github.com/hinichijou/DevOpswithKubernetesManifests/todo_app/broadcaster) contains source code for a application that listens for [NATS](https://docs.nats.io/) messages and sends the message forward using a Discord hook.

* The [db_backup_job folder](https://github.com/hinichijou/DevOpswithKubernetesManifests/todo_app/db_backup_job) contains source code for a job that takes backups of a Postgres database and saves the result to Google Artifacts repository. The job is written to work inside a Google Kubernetes cluster and uses cluster internal authentication (i.e. the job doesn't work in a local cluster).

* The [wikipedia_todo_job folder](https://github.com/hinichijou/DevOpswithKubernetesManifests/todo_app/wikipedia_todo_job) contains source code for a job that requests a random Wikipedia link and posts it to the backend as a read todo.