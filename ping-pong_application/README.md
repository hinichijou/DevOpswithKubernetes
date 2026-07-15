## Ping-pong application

First run a Kubernetes cluster. For example with k3d you can run `k3d cluster create -p 8081:80@loadbalancer --agents 2`. Local port 8081 is opened to port 80 in load balancer.

Deploy with `kubectl apply -f manifests`. This creates deployment, ingress and service resources defined by the yamls in the manifests folder. The service connects the application port to a cluster internal network port and the ingress routes all traffic to this service port. The ingress is shared with the log output application and can be found from `https://github.com/hinichijou/DevOpswithKubernetes/tree/1.9/log_output/manifests`. After deploying this application deploy the log output application by running `kubectl apply -f manifests` in the log_output app folder.

You can view the HTML page served from http://localhost:8081/pingpong.

You can remove the resources with `kubectl delete -f manifests`.

The cluster can be stopped with `k3d cluster stop` and started with `k3d cluster start`. The cluster can be deleted with `k3d cluster delete`.
