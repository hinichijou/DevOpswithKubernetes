## Log output and ping-pong applications

First run a Kubernetes cluster. In chapter 5 of the course we move back to using a local cluster. For example with [k3d](https://github.com/k3d-io/k3d) you can create a cluster with `k3d cluster create -p 8081:80@loadbalancer --agents 2 --k3s-arg '--disable=traefik@server:0'`. Local port 8081 is opened to port 80 in load balancer. `--disable=traefik@server:0` is required for the gateway api installation. If the cluster already exists it can be started with `k3d cluster start`.

Check with `kubectl cluster-info` that your configuration is pointing to the local cluster. If it is not we can correct this by running `kubectl config get-contexts` to get the name of the context and set it with `kubectl config use-context *context-name*`.

The deployment uses a gateway which dowsn't work in k3d cluster out of the box. Install [Envoy gateway](https://gateway.envoyproxy.io/) with `kubectl apply --server-side -f https://github.com/envoyproxy/gateway/releases/latest/download/install.yaml` and `kubectl -n envoy-gateway-system rollout status deployment/envoy-gateway --timeout=180s`. For the gateway we need to define `gatewayClassName: eg` for [`manifests/gateway.yaml`](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.1/log_output_ping-pong_application/manifests/gateway.yaml) which isn't included in the installation. The contents can however be found from the [project GitHub repository](https://github.com/envoyproxy/gateway/blob/main/examples/kubernetes/quickstart.yaml) and are quite simple. Save the following to file `gatewayclass.yaml` and apply the file with `kubectl apply -f gatewayclass.yaml`:
```
apiVersion: gateway.networking.k8s.io/v1
kind: GatewayClass
metadata:
  name: eg
spec:
  controllerName: gateway.envoyproxy.io/gatewayclass-controller
```

The project uses a namespace called exercises. You can create the namespace by running `kubectl create namespace exercises`. You can set the namespace as the default namespace by running `kubectl config set-context --current --namespace=exercises` or if you have [kubens](https://github.com/ahmetb/kubectx) installed more conviniently with `kubens exercises`. You can check the current active namespace by checking current context namespace with `kubectl config view` or just by calling `kubens`.

For the PersistentVolume to work you first need to create the local path in the node we are binding it to. We can create the folder `/tmp/kube` in container `k3d-k3s-default-agent-0` with `docker exec k3d-k3s-default-agent-0 mkdir -p /tmp/kube`.

Create a persistent volume with `kubectl apply -f persistent_volume_manifests`. As PersistentVolumes are often maintained by cluster administrators rather than developers and those are not application specific the definitions are separated from the application manifests. Applying creates a local persistent volume to path `/tmp/kube`.

Deploy with `kubectl apply -k .`. This creates the resources defined by the yamls listed in [`kustomization.yaml`](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.1/log_output_ping-pong_application/kustomization.yaml) resources. The services connect the application port to a cluster internal network port. The route resources define how the cluster internal services match to routing paths while the gateway resource defines a point of access to the cluster at which traffic is routed. The ping-pong application and the log output reader have externally exposed routes while the postgres database is not exposed externally. [`The ping-pong application route`](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.1/log_output_ping-pong_application/manifests/route_ping_pong.yaml) defines a route rewriting rule where requests to the `/pingpongs` path are routed to the root path of the ping-pong application.

[`manifests/persistentvolumeclaim_log_output.yaml`](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.1/log_output_ping-pong_application/manifests/persistentvolumeclaim_log_output.yaml) requests a persistent volume resource to be used by the log output reader and writer, the data written persists between application runs. The log output writer and reader share a deployment. The log output writer writes a log which the reader reads and outputs. [`manifests/configmap_log_output.yaml`](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.1/log_output_ping-pong_application/manifests/configmap_log_output.yaml) holds the environment variables for the log output runner and the configMapGenerator in [`kustomization.yaml`](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.1/log_output_ping-pong_application/kustomization.yaml) creates a file resource for the log output runner to use based on the contents of [`assets/information.txt`](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.1/log_output_ping-pong_application/assets/information.txt) if available at deployment time.

The ping-pong application saves the ping counter to a Postgres database with persistent storage which is run as a single replica StatefulSet defined in [`statefulset_postgres.yaml`](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.1/log_output_ping-pong_application/manifests/statefulset_postgres.yaml). The env values required for the configuration of the database can be found in [`configmap_postgres.yaml`](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.1/log_output_ping-pong_application/manifests/configmap_postgres.yaml). The setup also expects a secret file  `secret_postgres.yaml` which is not in version control which has the name `secret-postgres-config` and defines the environment variable `POSTGRES_PASSWORD`. You can refer to the encrypted version of the file [`enc_secret_postgres_config.yaml`](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.1/log_output_ping-pong_application/manifests/enc_secret_postgres_config.yaml) to see what kind of resource is expected.

Follow output logs with `kubectl logs -f *insert pod name here*`. You can use `kubectl get pods` to find out the pod name.

 A random string generated on application start and a time stamp is written to a log file every 5 seconds. The endpoint `http://localhost:8081/pingpong` displays a counter showing how many requests to the endpoint have been made while the application is running. The `http://localhost:8081` endpoint shows the last log output row and the counter for the ping-pong application. The counter value is fetched from the cluster internal endpoint set to environment variable `PINGS_URL`. Also the defined value of the environment variable `MESSAGE` (see [`manifests/configmap_log_output.yaml`](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.1/log_output_ping-pong_application/manifests/configmap_log_output.yaml) and how the env variables are defined in [`manifests/deployment_log_output.yaml`](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.1/log_output_ping-pong_application/manifests/deployment_log_output.yaml)) and the contents of the `information.txt` file (see [`kustomization.yaml`](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.1log_output_ping-pong_application/kustomization.yaml) configMapGenerator and how the volume is defined in [`manifests/deployment_log_output.yaml`](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.1/log_output_ping-pong_application/manifests/deployment_log_output.yaml)) are displayed if available.

You can remove the application resources with `kubectl delete -k .` and the persistent volume claims with `kubectl delete -f persistent_volume_manifests`. This doesn't delete the postgres persistent volumes which are not directly created by the manifests. You can delete them by finding the names with `kubectl get pvc` and calling delete directly for the persistent volume claims. You can also delete all resources of certain type, for example `kubectl delete --all deployments` would delete all deployment resources in the current namespace. Deleting the whole namespace with `kubectl delete namespace exercise`s will also delete all the resources in the namespace.

Because the `log-output-pv` PersistentVolume gets claimed by a specific `log-output-claim` PersistentVolumeClaim deployment, if you remove the resources but want to use the same persistent volume to keep the data stored for a new deployment you should delete the `claimRef` entry from PV specs, so as new PVC can bind to it. This should make the PV Available. This can be done with bash command `kubectl patch pv log-output-pv -p '{"spec":{"claimRef": null}}'`.

The cluster can be stopped with `k3d cluster stop` and started with `k3d cluster start`. The cluster can be deleted with `k3d cluster delete`.

### Task 4.1
Task: Create a ReadinessProbe for the Ping-pong application. It should be ready when it has a connection to the database. Add another ReadinessProbe for Log output application. It should be ready when it can receive data from the Ping-pong application. Test that it works by applying everything but the database statefulset. Adding the database should automatically move the READY states to 2/2 and 1/1 for Log output and Ping-pong respectively.

The ping-pong application and the log output writer application both have a health check path `/health` and readiness check path `/ready`. [deployment_log_output.yaml](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.1/log_output_ping-pong_application/manifests/deployment_log_output.yaml) and [deployment_ping_pong.yaml](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.1/log_output_ping-pong_application/manifests/deployment_ping_pong.yaml) both define a LivenessProbe and a ReadinessProbe for the containers.

```
kubectl get po
NAME                               READY   STATUS    RESTARTS   AGE
logoutput-dep-774684d9dd-vv2sj     1/2     Running   0          57s
pingpongapp-dep-778b459566-676g8   0/1     Running   0          57s

kubectl apply -f manifests/statefulset_postgres.yaml
statefulset.apps/postgres-stset created

kubectl get po
NAME                               READY   STATUS    RESTARTS   AGE
logoutput-dep-774684d9dd-vv2sj     2/2     Running   0          111s
pingpongapp-dep-778b459566-676g8   1/1     Running   0          111s
postgres-stset-0                   1/1     Running   0          17s
postgres-stset-1                   1/1     Running   0          11s
```

