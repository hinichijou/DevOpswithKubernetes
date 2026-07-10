## Todo app

First run a Kubernetes cluster. For example with k3d you can run `k3d cluster create -a 2`.

Deploy with `kubectl apply -f manifests/deployment.yaml`.

The application produces a log message `Server started in port 3000` when it starts.

Follow output logs with `kubectl logs -f *insert pod name here*`. You can use `kubectl get pods` to find out the pod name.

You can stop and delete the deployment with `kubectl delete deployment todoapp-dep`

The cluster can be stopped with `k3d cluster stop` and started with `k3d cluster start`. The cluster can be deleted with `k3d cluster delete`.

---

The server project can be tested locally by running:

`npm install`
`npm run dev`

Default port is 3000 and can be accessed from http://localhost:3000.
An environment variable called PORT can be used to change the default port.
