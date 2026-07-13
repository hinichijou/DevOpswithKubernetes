## Todo app

First run a Kubernetes cluster. For example with k3d you can run `k3d cluster create --port 8082:30080@agent:0 -p 8081:80@loadbalancer --agents 2`. Local port 8082 is opened to 30080 in cluster agent 0 and local port 8081 to port 80 in load balancer.

Deploy with `kubectl apply -f manifests/deployment.yaml`.

The application produces a log message `Server started in port *application port (default 3000)*` when it starts.

Apply service file with `kubectl apply -f manifests/service.yaml` to ensure the application can be accessed.

You can change the application port from `manifests/deployment.yaml` by changing the env PORT value before deploying.

If the port is changed also the `targetPort` in `manifests/service.yaml` needs to be changed. The `nodePort` of `manifests/service.yaml` needs to match the port we opened on the agent side during the creation step.

Follow output logs with `kubectl logs -f *insert pod name here*`. You can use `kubectl get pods` to find out the pod name.

You can view the HTML page served from http://localhost:8082.

You can remove the deployment with `kubectl delete -f manifests/deployment.yaml`.

The cluster can be stopped with `k3d cluster stop` and started with `k3d cluster start`. The cluster can be deleted with `k3d cluster delete`.

---

The server project can be tested locally by running:

`npm install`

`npm run dev`

Default port is 3000 and can be accessed from http://localhost:3000.
An environment variable called PORT can be used to change the default port.
