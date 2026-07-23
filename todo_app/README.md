## Todo app

Application that displays a list of todos and a random image from `https://picsum.photos/1200`. Consists of a Next.js + React frontend and a Node.js + Hono backend.

First run a Kubernetes cluster. For example with k3d you can run `k3d cluster create -p 8081:80@loadbalancer --agents 2`. Local port 8081 is opened to port 80 in load balancer.

For the PersistentVolume to work you first need to create the local path in the node we are binding it to. We can create the folder `/tmp/kube` in container `k3d-k3s-default-agent-0` with `docker exec k3d-k3s-default-agent-0 mkdir -p /tmp/kube`.

Create persistent volume by applying `kubectl apply -f persistent_volume_manifests`. As PersistentVolumes are often maintained by cluster administrators rather than developers and those are not application specific the definitions are separated from the application manifests. Applying creates a local persistent volume to path `/tmp/kube`.

Deploy with `kubectl apply -f manifests`. This creates deployment, ingress and service resources defined by the yamls in the manifests folder. The frontend service connects the application port to a cluster internal network port and the ingress routes all traffic to this service port. The frontend requests  `/api/path/todo` path of the backend service. The todo list get is requested by the frontend directly using the kubernetes cluster internal routing and the post request for a new todo is done from the browser to the backend.

The backend application produces a log message `Server started in port *application port (default 3001)*` when it starts.

Follow output logs with `kubectl logs -f *insert pod name here*`. You can use `kubectl get pods` to find out the pod name.

You can view the HTML page served from http://localhost:8081. The frontend fetches a new image from https://picsum.photos/1200 every 10 minutes. The frontend writes the image to persistent storage so it persists between application restarts. Frontend reads said image from the persistent storage and displays it. The backend has a get and post path for todos at '/api/todos'. The frontend has the functionality for displaying the todos and adding a new todo.

You can remove the resources with `kubectl delete -f manifests` and `kubectl delete -f persistent_volume_manifests`.

The cluster can be stopped with `k3d cluster stop` and started with `k3d cluster start`. The cluster can be deleted with `k3d cluster delete`.
