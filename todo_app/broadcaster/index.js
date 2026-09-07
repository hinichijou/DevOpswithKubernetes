import { connect } from "@nats-io/transport-node"

const decoder = new TextDecoder()
const decode = (value) => decoder.decode(value)

const subject = process.env.SUBJECT ?? "todos_updated"
const queue = process.env.QUEUE ?? "broadcaster.workers"

const subscribe = async () => {
  const dataSubscription = nc.subscribe(subject, {
    queue: queue,
    callback: async (err, msg) => {
      if (err) {
        console.error(`Failed to receive ${subject}`, err)
        return
      }

      const message = decode(msg.data)
      console.log(`Received message ${message}`)

      dataSubscription.unsubscribe()

      const body = JSON.stringify({ content: message })
      console.log(`Forwarding message with body ${body}`)

      const res = await fetch(process.env.EXTERNAL_SERVICE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body
      }).catch((e) => console.error(`Fetch failed: ${e}.`))

      if (!res.ok) {
        console.error(`Fetch failed. Status: ${res.status}. Text: ${await res.text()}`)
      }

      subscribe()
    },
  })

  console.log("Broadcaster listening")
}

const nc = await connect({
  servers: process.env.NATS_URL || "nats://nats:4222",
}).catch((err) => {
  console.error("Failed to connect to NATS", err)
  process.exit(1)
});

subscribe()

const onExit = async (exitvalue) => {
  // drain() is also an option, see https://github.com/nats-io/nats.js/blob/main/core/README.md
  await nc.close();
  process.exit(exitvalue)
}

// graceful shutdown
process.on("SIGINT", () => {
  onExit(0)
})
process.on("SIGTERM", () => {
  onExit(0)
})