## Todo app backend

Todo app Node.js/Hono backend project. Fetches a new image from https://picsum.photos/1200 every 10 minutes. The picture is saved to persistent storage and persists between application restarts.

Serves the following routes:
* `/api/image`: returns if the image has been saved successfully
* `/api/todos`: return currently hardcoded todo data

The server project can be tested locally by running:

`npm install`

`npm run dev`

Default port is 3000 and application can be accessed from http://localhost:3000.
An environment variable called PORT can be used to change the default port.
