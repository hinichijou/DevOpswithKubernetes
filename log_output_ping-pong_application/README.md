## Log output and ping-pong applications

First run a Kubernetes cluster. For example with k3d you can run `k3d cluster create -p 8081:80@loadbalancer --agents 2`. Local port 8081 is opened to port 80 in load balancer.

Deploy with `kubectl apply -f manifests`. This creates deployment, ingress and service resources defined by the yamls in the manifests folder. The service connects the application port to a cluster internal network port and the ingress routes all traffic to this service port. The log output writer and readeer share a deployment and a volume, the writer writes to a file in the volume which the reader reads. The ping-pong application shares an ingress with the log output reader.

Follow output logs with `kubectl logs -f *insert pod name here*`. You can use `kubectl get pods` to find out the pod name.

You can view the contents of the log file being written from http://localhost:8081/status. A random string generated on application start and a time stamp is written to the file every 5 seconds. The endpoint http://localhost:8081/pingpong displays a counter showing how many requests to the endpoint have been made while the application is running.

You can remove the resources with `kubectl delete -f manifests`.

The cluster can be stopped with `k3d cluster stop` and started with `k3d cluster start`. The cluster can be deleted with `k3d cluster delete`.