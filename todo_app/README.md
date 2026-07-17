## Todo app

First run a Kubernetes cluster. For example with k3d you can run `k3d cluster create -p 8081:80@loadbalancer --agents 2`. Local port 8081 is opened to port 80 in load balancer.

Create persistent volume by applying `kubectl apply -f persistent_volume_manifests`. As PersistentVolumes are often maintained by cluster administrators rather than developers and those are not application specific the definitions are separated from the application manifests. This creates a local persistent volume to path `/tmp/kube`.

Deploy with `kubectl apply -f manifests`. This creates deployment, ingress and service resources defined by the yamls in the manifests folder. The service connects the application port to a cluster internal network port and the ingress routes all traffic to this service port.

The application produces a log message `Server started in port *application port (default 3000)*` when it starts.

You can change the application port from `manifests/deployment.yaml` by changing the env PORT value before deploying. If the port is changed also the `targetPort` in `manifests/service.yaml` needs to be changed to the same value.

Follow output logs with `kubectl logs -f *insert pod name here*`. You can use `kubectl get pods` to find out the pod name.

You can view the HTML page served from http://localhost:8081. The application fetches a new image from https://picsum.photos/1200 every 10 minutes. The picture is saved to persistent storage and persists between application restarts.

You can remove the resources with `kubectl delete -f manifests` and `kubectl delete -f persistent_volume_manifests`.

The cluster can be stopped with `k3d cluster stop` and started with `k3d cluster start`. The cluster can be deleted with `k3d cluster delete`.

---

The server project can be tested locally by running:

`npm install`

`npm run dev`

Default port is 3000 and application can be accessed from http://localhost:3000.
An environment variable called PORT can be used to change the default port.
