## Log output and ping-pong applications

First run a Kubernetes cluster. For example with k3d you can run `k3d cluster create -p 8081:80@loadbalancer --agents 2`. Local port 8081 is opened to port 80 in load balancer.

The project uses a namespace called exercises. You can create the namespace by running `kubectl create namespace exercises`. You can set the namespace as the default namespace by running `kubectl config set-context --current --namespace=exercises` or if you have [kubens](https://github.com/ahmetb/kubectx) installed more conviniently with `kubens exercises`. You can check the current active namespace by checking current context namespace with `kubectl config view` or just by calling `kubens`.

For the PersistentVolume to work you first need to create the local path in the node we are binding it to. We can create the folder `/tmp/kube` in container `k3d-k3s-default-agent-0` with `docker exec k3d-k3s-default-agent-0 mkdir -p /tmp/kube`.

Create persistent volume by applying `kubectl apply -f persistent_volume_manifests`. As PersistentVolumes are often maintained by cluster administrators rather than developers and those are not application specific the definitions are separated from the application manifests. This creates a local persistent volume to path `/tmp/kube` that is used by the log output application.

Deploy with `kubectl apply -f manifests`. This creates deployment, ingress and service resources defined by the yamls in the manifests folder. The service connects the application port to a cluster internal network port and the ingress routes all traffic to this service port. The log output writer and reader share a deployment. The log output writer and reader share a persistent volume, the data written persists between application runs. The log output writer writes a log which the reader reads and outputs. The ping-pong application shares an ingress with the log output reader.

Follow output logs with `kubectl logs -f *insert pod name here*`. You can use `kubectl get pods` to find out the pod name.

You can view the contents of the files being written from http://localhost:8081/. A random string generated on application start and a time stamp is written to the log file every 5 seconds. The endpoint http://localhost:8081/pingpong displays a counter showing how many requests to the endpoint have been made while the application is running. The http://localhost:8081/ endpoint shows the last log output row and the counter for the ping-pong application. The counter value is fetched from the http://pingpongapp-svc:2345/pings endpoint.

You can remove the resources with `kubectl delete -f manifests`.

The cluster can be stopped with `k3d cluster stop` and started with `k3d cluster start`. The cluster can be deleted with `k3d cluster delete`.