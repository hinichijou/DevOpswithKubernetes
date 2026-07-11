## Log output app
First run a Kubernetes cluster. For example with k3d you can run `k3d cluster create -a 2`.

Deploy with `kubectl apply -f manifests/deployment.yaml`.

Follow output logs with `kubectl logs -f *insert pod name here*`. You can use `kubectl get pods` to find out the pod name.

The cluster can be stopped with `k3d cluster stop` and started with `k3d cluster start`. The cluster can be deleted with `k3d cluster delete`.