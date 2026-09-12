## Broadcaster
Listens to messages broadcasted by todoapp backend via NATS on todo post and put requests. Sends the message forward to an external service defined in the environment variables.

Has following environment variables:
* `NATS_URL`: defines the address of the nats server to which we connect to. Default value: `nats://nats:4222`
* `SUBJECT`: subject to which to subscribe to. Default value: `todos_updated`.
* `QUEUE`: queue to which to place the listeners. Default value: `broadcaster.workers`.
* `EXTERNAL_SERVICE_URL`: the url to which the message is relayed to with a post request that has headers `Content-type`: `application/json` and a JSON object body that contains the field `content`. This works at least with Discord hooks, may require modification to use with other services.

Can be tested locally by running:

`npm install`

`npm run dev`


4.9: test triggering a build