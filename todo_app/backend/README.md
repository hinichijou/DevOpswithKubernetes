## Todo app backend

Todo app Node.js/Hono backend project.

Serves the following routes:
* `GET /todos`: returns todo data from database
* `POST /todos`: add a new todo to the list of todos
* `PUT /todos/:id`: update a todo with id
* `GET /health`: health check path.
* `GET /ready`: readiness check path.

The server project can be tested locally by running:

`npm install`

`npm run dev`

Default port is 3001 and application can be accessed from [http://localhost:3001](http://localhost:3001).

Has following environment variables :
* `PORT` can be used to change the default port. Default value: `3001`.
* `TODO_MIN_LENGTH` and `TODO_MAX_LENGTH`: can be used to set text length limits to the todo schema. Default value: `0`.
* `NATS_URL`: the address for connecting to NATS server. Default value: `nats://nats:4222`.
* `SUBJECT`: the subject for the messages published to NATS.

Saves the todos to and fetches them from a Postgres database which means a local Postgres instance is required. Expects the environment variable `PGPASSWORD` to be set to the environment and match the database password. You should also consider setting `PGUSER`, `PGHOST` and `PGDATABASE` to suitable values. Fetches the values `id` and `title` `done` from table `todos` see [`manifests/init_todo_db.sql`](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.5/todo_app/manifests/init_todo_db.sql) for how the todos table is defined.

Every request made to the backend and the body of every post and put request received is logged to console.

Publishes a message on NATS with every `POST /todos` and `PUT /todos/:id`. The POST message includes the todo text and the PUT message includes the todo id and the updated values.

4.8: trigger build