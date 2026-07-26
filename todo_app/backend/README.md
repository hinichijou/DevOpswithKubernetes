## Todo app backend

Todo app Node.js/Hono backend project.

Serves the following routes:
* `GET /api/todos`: returns currently hardcoded todo data
* `POST /api/todos`: add a new todo to the list of todos

The server project can be tested locally by running:

`npm install`

`npm run dev`

Default port is 3001 and application can be accessed from [http://localhost:3001](http://localhost:3001).

Has environment variables PORT, API_PATH and TODOS_DEFAULTS_PATH. PORT can be used to change the default port, API_PATH can be used to base path of the routes being served (default: `/api`) and TODOS_DEFAULTS_PATH can be used to define location for a `todos.json` file that contains default todos data (default: `./config/todos.json`).
