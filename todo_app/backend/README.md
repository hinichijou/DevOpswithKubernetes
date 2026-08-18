## Todo app backend

Todo app Node.js/Hono backend project.

Serves the following routes:
* `GET /api/todos`: returns currently hardcoded todo data
* `POST /api/todos`: add a new todo to the list of todos

The server project can be tested locally by running:

`npm install`

`npm run dev`

Default port is 3001 and application can be accessed from [http://localhost:3001](http://localhost:3001).

Has environment variables PORT, API_PATH, TODO_MIN_LENGTH and TODO_MAX_LENGTH. PORT can be used to change the default port, API_PATH can be used to change base path of the routes being served (default: `/api`). TODO_MIN_LENGTH and TODO_MAX_LENGTH can be used to set text length limits to the todo schema.

Saves the todos to and fetches them from a Postgres database which means a local Postgres instance is required. Expects the environment variable `PGPASSWORD` to be set to the environment and match the database password. You should also consider setting `PGUSER`, `PGHOST` and `PGDATABASE` to suitable values. Fetches the values `id` and `title` from table `todos` see [`manifests/init_todo_db.sql`](https://github.com/hinichijou/DevOpswithKubernetes/tree/2.8/todo_app/manifests/init_todo_db.sql) for how the todos table is defined.

Every request made to the backend and the body of every post request received is logged to console.