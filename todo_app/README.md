## Todo app

Application that displays a list of todos and a random image from `https://picsum.photos/1200`. Consists of a Next.js + React frontend, a Node.js + Hono backend and a PostgreSQL database which is used by the backend to store the todo data.

First run a Kubernetes cluster. In chapter 5 of the course we move back to using a local cluster. For example with [k3d](https://github.com/k3d-io/k3d) you can create a cluster with `k3d cluster create -p 8081:80@loadbalancer --agents 2 --k3s-arg '--disable=traefik@server:0'`. Local port 8081 is opened to port 80 in load balancer. `--disable=traefik@server:0` is required for the gateway api installation. If the cluster already exists it can be started with `k3d cluster start`.

Check with `kubectl cluster-info` that your configuration is pointing to the local cluster. If it is not we can correct this by running `kubectl config get-contexts` to get the name of the context and set it with `kubectl config use-context *context-name*`.

The cluster uses a gateway resource to handle inter-namespace routing from a single externally exposed port to different services. Apply the infra resources using the instructions from [infrastucture_manifests folder](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.7/infrastucture_manifests). This also creates the necessary namespaces.

The cluster uses a gateway resource which doesn't exist in a k3d cluster out of the box. Install the Envoy gateway using the instructions from the [envoy_gateway folder](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.7/services/envoy_gateway).

For the PersistentVolume to work you first need to create the local path in the node we are binding it to. We can create the folder `/tmp/kube` in container `k3d-k3s-default-agent-0` with `docker exec k3d-k3s-default-agent-0 mkdir -p /tmp/kube`.

Create a persistent volume with `kubectl apply -f persistent_volume_manifests`. As PersistentVolumes are often maintained by cluster administrators rather than developers and those are not application specific the definitions are separated from the application manifests. Applying creates a local persistent volume to path `/tmp/kube`.

Deploy with `kubectl apply -k .`. This creates the resources defined by the yamls listed in [`kustomization.yaml`](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.6/todo_app/kustomization.yaml) resources. The services define how the used application ports of the frontend and backend applications are connected to cluster internal network ports. The route resources define how the cluster internal services match to routing paths while the gateway resource defines a point of access to the cluster at which traffic is routed. The todo frontend application and the todo backend application have externally exposed routes while the postgres database is not exposed externally. The frontend requests  `/todo` path of the backend service. The todo list get is requested by the frontend directly using the kubernetes cluster internal routing and the post request for a new todo and the put request for marking a todo done is done from the browser to the backend. [`The backend application route`](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.6/todo_app/manifests/route_backend.yaml) defines a route rewriting rule where requests to the `/api` path are routed to the root path of the backend application.

[`manifests/persistentvolumeclaim_todoapp.yaml`](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.6/todo_app/manifests/persistentvolumeclaim_todoapp.yaml) requests a persistent volume resource to be used by the todoapp frontend to save the displayed image, the data written persists between application runs. Because the `todoapp-pv` PersistentVolume gets claimed by a specific `todoapp-claim` PersistentVolumeClaim deployment, if you remove the resources but want to use the same persistent volume to keep the data stored for a new deployment you should delete the `claimRef` entry from PV specs, so as new PVC can bind to it. This should make the PV Available. This can be done with bash command `kubectl patch pv todoapp-pv -p '{"spec":{"claimRef": null}}'`.

[`manifests/configmap_todoapp.yaml`](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.6/todo_app/manifests/configmap_todoapp.yaml) holds the environment variables for the todo application frontend and backend. See [backend readme](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.6/todo_app/backend/README.md) and [frontend readme](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.6/todo_app/todo_app_frontend/README.md) for more information on what the meaning of each of the environment variables is.

 The backend saves the todo data to a Postgres database with persistent storage which is run as a single replica StatefulSet defined in [`manifests/statefulset_postgres.yaml`](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.6/todo_app/manifests/statefulset_postgres.yaml). The env values required for the configuration of the database and the connection between backend and database can be found in [`manifests/configmap_postgres.yaml`](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.6/todo_app/manifests/configmap_postgres.yaml). The configMapGenerator in [`kustomization.yaml`](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.6/todo_app/kustomization.yaml) creates a file resource for the database initialization based on the contents of the [`manifests/init_todo_db.sql`](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.6/todo_app/manifests/init_todo_db.sql) file. This file also defines the default todos displayed on the page. If deployed to a local cluster the setup should also contain a secret file  `secret_postgres.yaml` which is not in version control which has the name `secret-postgres-config` and defines the environment variable `POSTGRES_PASSWORD`. You can refer to the encrypted version of the file [`manifests/enc_secret_postgres.yaml`](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.6/todo_app/manifests/enc_secret_postgres.yaml) to see what kind of resource is expected.

[`manifests/wikipedia_todo_job.yaml`](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.6/todo_app/manifests/wikipedia_todo_job.yaml) defines a CronJob that sends a new todo post request to backend every hour with the content of "Read *random wikipedia link*". The random wikipedia link is obtained by sending a request to https://en.wikipedia.org/wiki/Special:Random. The job uses a Docker image that contains a single shell script, the contents of the image can be found from [`wikipedia_todo_job folder`](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.6/todo_app/wikipedia_todo_job).

[`manifests/db_backup_job.yaml`](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.6/todo_app/manifests/db_backup_job.yaml) defines a CronJob that takes a backup of the postgres database every 24 hours and saves the result to Google Cloud Storage bucket. The job uses a Docker image that contains a single shell script, the contents of the image can be found from [`db_backup_job folder`](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.6/todo_app/db_backup_job). See [`db_backup_job readme`](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.6/todo_app/db_backup_job/README.md) for more detailed explanation. The job is written to authenticate as a Google Cloud cluster internal job using Workload Identity Federation so the job doesn't work when running in a local cluster.

You can follow pod output logs with `kubectl logs -f *insert pod name here*`. You can use `kubectl get pods` to find out the pod name.

See the [monitoring folder](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.6/monitoring) and the [monitoring readme](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.6/monitoring/README.md) for instructions on how to run a monitoring setup for the deployment.

You can view the HTML page served from http://localhost:8081. The frontend fetches a new image from https://picsum.photos/1200 every 10 minutes. The frontend writes the image to persistent storage so it persists between application restarts. Frontend reads said image from the persistent storage and displays it. The backend has get, post and put paths for todos at `/todos` which is accessable at http://localhost:8081/api/todos. The frontend has the functionality for displaying the todos, adding a new todo and marking a todo as done. The Wikipedia todo CronJob is scheduled to post a new todo with a random Wikipedia link every hour.

You can remove the resources applied with the kustomization file with `kubectl delete -k .`. This doesn't delete the postgres persistent volumes which are not directly created in the manifests. You can delete them by finding the names with `kubectl get pvc` and calling delete directly for the persistent volume claims. You can also delete all resources of certain type, for example `kubectl delete --all deployments` would delete all deployment resources in the current namespace. Deleting the whole namespace with `kubectl delete namespace project` will also delete all the resources in the namespace.

The cluster can be stopped with `k3d cluster stop` and started with `k3d cluster start`. The cluster can be deleted with `k3d cluster delete`.

### Task 4.6
#### Instructions
Create a new separate service for sending status messages of the todos to some chat service. Let's call the new service "broadcaster".

Requirements:
  * The backend should send a message to NATS on saving or updating todos
  * The broadcaster should subscribe to NATS messages
  * The broadcaster should send the message forward to an external service in a format they support

As the external service you can choose either:
  * Discord (you can use the course Full Stack Discord, see [here](https://courses.mooc.fi/org/uh-cs/courses/full-stack-open-continuous-integration/chapter-6#exercise-11-18) for the details)
  * Telegram
  * Slack

or if you don't want to use them, use "Generic" where a URL is set as an Environment variable and the payload is e.g.

```
{
  "user": "bot",
  "message": "A todo was created"
}
```

The broadcaster should be able to be scaled without sending the message multiple times. Test that it can run with 6 replicas without issues. The messages only have to be sent to the external service if all of the services are working correctly. So a randomly missing message is not an issue but a duplicate is.

#### Solution

First we need to install NATS to the cluster with:
```
helm repo add nats https://nats-io.github.io/k8s/helm/charts/
helm repo update
helm upgrade --install my-nats nats/nats --namespace nats --create-namespace --set promExporter.enabled=true
```

See the [broadcaster folder](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.6/todo_app/broadcaster) and the [broadcaster readme](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.6/todo_app/broadcaster/README.md) for the broadcaster implementation and an explanation of the environment variables.

The [backend](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.6/todo_app/backend) publishes a NATS message on `/todos` POST and PUT with the subject defined in [configmap_nats.yaml](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.6/todo_app/manifests/configmap_nats.yaml). The broadcaster in turn subscribes to this subject.

Expects a file `manifests/secret_discord_webhook.yaml` to which the [broadcaster deployment](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.6/todo_app/manifests/deployment_broadcaster.yaml) refers with the name `secret-discord-webhook-config` which contains the value for the environment variable `EXTERNAL_SERVICE_URL`. I used the Full Stack Discord webhook for testing, the url is not pushed to GitHub. If we would like to deploy the messaging configuration to GKE it would probably make sense to handle the url as an environment secret and inject it in the deployment workflow.

The PUT and POST path messages were forwarded to Discord successfully:

![Image of the messages in discord](https://github.com/hinichijou/DevOpswithKubernetes/blob/4.7/task_screenshots/task_4-6a.png?raw=true)

The messages were handled only once and the six replicas ran without issues:

![Image of the replicas](https://github.com/hinichijou/DevOpswithKubernetes/blob/4.7/task_screenshots/task_4-6b.png?raw=true)

The messages were picked up by two different subscriber replicas:

![Image of the subscriber logs](https://github.com/hinichijou/DevOpswithKubernetes/blob/4.7/task_screenshots/task_4-6c.png?raw=true)