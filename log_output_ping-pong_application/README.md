## Log output and ping-pong applications

First run a Kubernetes cluster. In chapter 5 of the course we move back to using a local cluster. For example with [k3d](https://github.com/k3d-io/k3d) you can create a cluster with `k3d cluster create -p 8081:80@loadbalancer --agents 2 --k3s-arg '--disable=traefik@server:0'`. Local port 8081 is opened to port 80 in load balancer. `--disable=traefik@server:0` is required for the gateway api installation. If the cluster already exists it can be started with `k3d cluster start`.

Check with `kubectl cluster-info` that your configuration is pointing to the local cluster. If it is not we can correct this by running `kubectl config get-contexts` to get the name of the context and set it with `kubectl config use-context *context-name*`.

The deployment uses a gateway which dowsn't work in k3d cluster out of the box. Install [Envoy gateway](https://gateway.envoyproxy.io/) with `kubectl apply --server-side -f https://github.com/envoyproxy/gateway/releases/latest/download/install.yaml` and `kubectl -n envoy-gateway-system rollout status deployment/envoy-gateway --timeout=180s`. For the gateway we need to define `gatewayClassName: eg` for [`manifests/gateway.yaml`](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.4/log_output_ping-pong_application/manifests/gateway.yaml) which isn't included in the installation. The contents can however be found from the [project GitHub repository](https://github.com/envoyproxy/gateway/blob/main/examples/kubernetes/quickstart.yaml) and are quite simple. Save the following to file `gatewayclass.yaml` and apply the file with `kubectl apply -f gatewayclass.yaml`:
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

Deploy with `kubectl apply -k .`. This creates the resources defined by the yamls listed in [`kustomization.yaml`](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.4/log_output_ping-pong_application/kustomization.yaml) resources. The services connect the application port to a cluster internal network port. The route resources define how the cluster internal services match to routing paths while the gateway resource defines a point of access to the cluster at which traffic is routed. The ping-pong application and the log output reader have externally exposed routes while the postgres database is not exposed externally. [`The ping-pong application route`](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.4/log_output_ping-pong_application/manifests/route_ping_pong.yaml) defines a route rewriting rule where requests to the `/pingpongs` path are routed to the root path of the ping-pong application.

[`manifests/persistentvolumeclaim_log_output.yaml`](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.4/log_output_ping-pong_application/manifests/persistentvolumeclaim_log_output.yaml) requests a persistent volume resource to be used by the log output reader and writer, the data written persists between application runs. The log output writer and reader share a deployment. The log output writer writes a log which the reader reads and outputs. [`manifests/configmap_log_output.yaml`](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.4/log_output_ping-pong_application/manifests/configmap_log_output.yaml) holds the environment variables for the log output runner and the configMapGenerator in [`kustomization.yaml`](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.4/log_output_ping-pong_application/kustomization.yaml) creates a file resource for the log output runner to use based on the contents of [`assets/information.txt`](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.4/log_output_ping-pong_application/assets/information.txt) if available at deployment time.

The ping-pong application saves the ping counter to a Postgres database with persistent storage which is run as a single replica StatefulSet defined in [`statefulset_postgres.yaml`](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.4/log_output_ping-pong_application/manifests/statefulset_postgres.yaml). The env values required for the configuration of the database can be found in [`configmap_postgres.yaml`](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.4/log_output_ping-pong_application/manifests/configmap_postgres.yaml). The setup also expects a secret file  `secret_postgres.yaml` which is not in version control which has the name `secret-postgres-config` and defines the environment variable `POSTGRES_PASSWORD`. You can refer to the encrypted version of the file [`enc_secret_postgres_config.yaml`](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.4/log_output_ping-pong_application/manifests/enc_secret_postgres_config.yaml) to see what kind of resource is expected.

Follow output logs with `kubectl logs -f *insert pod name here*`. You can use `kubectl get pods` to find out the pod name.

 A random string generated on application start and a time stamp is written to a log file every 5 seconds. The endpoint `http://localhost:8081/pingpong` displays a counter showing how many requests to the endpoint have been made while the application is running. The `http://localhost:8081` endpoint shows the last log output row and the counter for the ping-pong application. The counter value is fetched from the cluster internal endpoint set to environment variable `PINGS_URL`. Also the defined value of the environment variable `MESSAGE` (see [`manifests/configmap_log_output.yaml`](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.4/log_output_ping-pong_application/manifests/configmap_log_output.yaml) and how the env variables are defined in [`manifests/deployment_log_output.yaml`](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.4/log_output_ping-pong_application/manifests/deployment_log_output.yaml)) and the contents of the `information.txt` file (see [`kustomization.yaml`](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.4/log_output_ping-pong_application/kustomization.yaml) configMapGenerator and how the volume is defined in [`manifests/deployment_log_output.yaml`](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.4/log_output_ping-pong_application/manifests/deployment_log_output.yaml)) are displayed if available. The ping-pong application and the log output writer application both have a health check path `/health` and readiness check path `/ready`. [deployment_log_output.yaml](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.4/log_output_ping-pong_application/manifests/deployment_log_output.yaml) and [deployment_ping_pong.yaml](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.4/log_output_ping-pong_application/manifests/deployment_ping_pong.yaml) both define a LivenessProbe and a ReadinessProbe for the containers.

You can remove the application resources with `kubectl delete -k .` and the persistent volume claims with `kubectl delete -f persistent_volume_manifests`. This doesn't delete the postgres persistent volumes which are not directly created by the manifests. You can delete them by finding the names with `kubectl get pvc` and calling delete directly for the persistent volume claims. You can also delete all resources of certain type, for example `kubectl delete --all deployments` would delete all deployment resources in the current namespace. Deleting the whole namespace with `kubectl delete namespace exercise` will also delete all the resources in the namespace.

Because the `log-output-pv` PersistentVolume gets claimed by a specific `log-output-claim` PersistentVolumeClaim deployment, if you remove the resources but want to use the same persistent volume to keep the data stored for a new deployment you should delete the `claimRef` entry from PV specs, so as new PVC can bind to it. This should make the PV Available. This can be done with bash command `kubectl patch pv log-output-pv -p '{"spec":{"claimRef": null}}'`.

The cluster can be stopped with `k3d cluster stop` and started with `k3d cluster start`. The cluster can be deleted with `k3d cluster delete`.

### Task 4.4
Task: Create an AnalysisTemplate for the Ping-pong app that will follow the CPU usage of all containers in the namespace. If the CPU usage rate sum for the namespace increases above a set value (you may choose a good hardcoded value) within 5 minutes, revert the update. Make sure that the application doesn't get updated, if the value is set too low.

[AnalysisTemplate](https://argoproj.github.io/argo-rollouts/architecture/#analysistemplate-and-analysisrun) is a resource which can be used with [Argo Rollouts](https://argoproj.github.io/argo-rollouts/architecture/#rollout-resource) meaning we first have to install the resource. This can be done with:

```
kubectl create namespace argo-rollouts
kubectl apply --server-side -n argo-rollouts -f https://github.com/argoproj/argo-rollouts/releases/latest/download/install.yaml
```

Once we have the resource available we can [convert our deployments to rollouts](https://argoproj.github.io/argo-rollouts/migrating/#convert-deployment-to-rollout). However we can also [refer to the deployment file from the rollout](https://argoproj.github.io/argo-rollouts/migrating/#reference-deployment-from-rollout) which is what I will do since the only change it requires to the deployment files is setting `replicas: 0` and it makes converting back to using a deployment more simple if necessary.

[rollout_ping_pong.yaml](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.4/log_output_ping-pong_application/manifests/rollout_ping_pong.yaml) defines a rollout resource for the ping pong application. The strength of the resource is in the ability of configuring a canary release strategy which isn't defined here outside of assigning the analysis template as the task doesn't require it. When the resource is deployed for the first time all of the pods are created instantly, the defined canary strategy will apply when the rollout resource is updated. Specifically changes to [spec.template field](https://argoproj.github.io/argo-rollouts/#how-does-it-work) will trigger a new rollout.

The AnalysisTemplate resource will also be available after installing Argo Rollouts. [analysistemplate_cpu_usage.yaml](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.4/log_output_ping-pong_application/manifests/analysistemplate_cpu_usage.yaml) defines an analysistemplate resource for keeping track of application total cpu usage which the rollout resource uses. If the sum total of container CPU usage in the namespace is greater than set value within 5 minutes the the update rollout is reverted.

The AnalysisTemplate example in the course material refers to `kube-prometheus-stack` so I will deploy the the `kube-prometheus-stack` using the following commands instead of using the stack introduced in current course material chapter 3.5 to avoid running into any issues not covered in the current course material, see [notes for task 4.3](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.4/monitoring#task-43) for more information.

```
kubectl create namespace prometheus
helm install prometheus-community/kube-prometheus-stack --generate-name --namespace prometheus
```

Find the DNS name for the prometheus service with `kubectl get svc -n prometheus` which looks like `kube-prometheus-stack-*this number changes*-prometheus`. This will need to be set to [analysistemplate_cpu_usage.yaml](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.4/log_output_ping-pong_application/manifests/analysistemplate_cpu_usage.yaml) `prometheus` `address` field.

There might be some room for interpretation in the phrasing of the task but I'm taking it as we measure a five minute interval of the namespace container sum of cpu usage rates and if during that interval the sum raises over the set limit we revert the update. The first issue is finding out all the metrics we have available in the first place. The Prometheus UI has the `Explore metrics` menu, which I searched for `cpu`. While there doesn't seem to be a metric available for container cpu utilization directly there is some promising metrics, namely `node_cpu_seconds_total` and `container_cpu_usage_seconds_total` and some recording rules which serve as examples, namely `node:node_cpu_utilization:ratio_rate5m` and `node_namespace_pod_container:container_cpu_usage_seconds_total:sum_rate5m`. We can see how the rules are written from the Prometheus `Status` -> `Rule health` menu, based on which `node:node_cpu_utilization:ratio_rate5m` = `avg by (cluster, node) (sum without (mode) (rate(node_cpu_seconds_total{job="node-exporter",mode!="idle",mode!="iowait",mode!="steal"}[5m])))` which calculates the node cpu utilization rate for the past 5 minutes by summing the workloads for each core and taking an average of those. Based on the implementation for `node_namespace_pod_container:container_cpu_usage_seconds_total:sum_rate5m` = `sum by (cluster, namespace, pod, container) (rate(container_cpu_usage_seconds_total{image!="",job="kubelet",metrics_path="/metrics/cadvisor"}[5m])) * on (cluster, namespace, pod) group_left (node) topk by (cluster, namespace, pod) (1, max by (cluster, namespace, pod, node) (kube_pod_info{node!=""}))` which calculates the container resource usage rates we can get the namespace cpu usage rate with just `sum(rate(container_cpu_usage_seconds_total{image!="",job="kubelet",metrics_path="/metrics/cadvisor",namespace="exercises"}[5m]))` as `container_cpu_usage_seconds_total` returns a value across all cpu cores. My first thought was that the task was to track how much of the total machine cpu usage rate the deployment takes but since the manifest resource requests for cpu are in cpu cores it makes sense to track the container cpu core usage rate instead of how high can the machine total cpu resource usage rate rise when the deployment is running. `[5m]` defines the time window for the data points used in the analysis, this number can be adjusted if necessary.

The documentation for [analysis](https://argoproj.github.io/argo-rollouts/features/analysis/) shows what kind of options are possible for the AnalysisTemplate. We can set the five minute measurement period with setting a `interval` and a `count`. We can for example take measurements with `interval: 30s` and `count: 7` after `initialDelay: 120s` to avoid the container startup affecting the results and set the cpu limit as a `failureCondition`. Based on Prometheus `Status` -> `Configuration` menu the default data scrape interval is 30s so with a lookback window of `[90s]` we should have at least four data points available to smooth jitter.

After deploying the application we can visualize the rollout with `kubectl argo rollouts get rollout rollout-pingpong --watch`. You will first need to install the argo rollouts kubectl plugin using [these instructions](https://argoproj.github.io/argo-rollouts/installation/#kubectl-plugin-installation) to be able to use the command.

After deploying with `failureCondition: result > 0.02` the application is deployed successfully:
```
NAME                                          KIND         STATUS        AGE    INFO
⟳ rollout-pingpong                            Rollout      ✔ Healthy     5m51s
├──# revision:2
│  ├──⧉ rollout-pingpong-7c9df5d75c           ReplicaSet   ✔ Healthy     5m13s  stable
│  │  └──□ rollout-pingpong-7c9df5d75c-gwz6z  Pod          ✔ Running     13s    ready:1/1
│  └──α rollout-pingpong-7c9df5d75c-2-0       AnalysisRun  ✔ Successful  5m13s  ✔ 7
└──# revision:1
   └──⧉ rollout-pingpong-69c48cc7b5           ReplicaSet   • ScaledDown  5m51s
```

With `kubectl get analysisrun` and `kubectl describe analysisrun` we can see the measured values of the analysisrun:
```
Metric Results:
    Consecutive Success:  7
    Count:                7
    Measurements:
      Finished At:  2026-09-04T16:15:13Z
      Phase:        Successful
      Started At:   2026-09-04T16:15:13Z
      Value:        0.0029391897928807186
      Finished At:  2026-09-04T16:15:43Z
      Phase:        Successful
      Started At:   2026-09-04T16:15:43Z
      Value:        0.002219852451819377
      Finished At:  2026-09-04T16:16:13Z
      Phase:        Successful
      Started At:   2026-09-04T16:16:13Z
      Value:        0.002159328819812076
      Finished At:  2026-09-04T16:16:43Z
      Phase:        Successful
      Started At:   2026-09-04T16:16:43Z
      Value:        0.0024298105403799705
      Finished At:  2026-09-04T16:17:13Z
      Phase:        Successful
      Started At:   2026-09-04T16:17:13Z
      Value:        0.002618472077018705
      Finished At:  2026-09-04T16:17:43Z
      Phase:        Successful
      Started At:   2026-09-04T16:17:43Z
      Value:        0.0023898956318161744
      Finished At:  2026-09-04T16:18:13Z
      Phase:        Successful
      Started At:   2026-09-04T16:18:13Z
      Value:        0.0022153498648237874
```

Based on this we can see that the cpu resource usage is very low and we'll need to set the limit to somewhere around 0.001 to fail the analysis.

With `failureCondition: result > 0.001` the next update deployment fails as expected:
```
NAME                                          KIND         STATUS        AGE    INFO
⟳ rollout-pingpong                            Rollout      ✖ Degraded    3m19s
├──# revision:2
│  ├──⧉ rollout-pingpong-7c9df5d75c           ReplicaSet   • ScaledDown  2m28s  canary
│  └──α rollout-pingpong-7c9df5d75c-2-0       AnalysisRun  ✖ Failed      2m28s  ✖ 1
└──# revision:1
   └──⧉ rollout-pingpong-69c48cc7b5           ReplicaSet   ✔ Healthy     3m19s  stable
      └──□ rollout-pingpong-69c48cc7b5-8m6zm  Pod          ✔ Running     3m19s  ready:1/1

Metric Results:
    Count:   1
    Failed:  1
    Measurements:
      Finished At:  2026-09-04T16:32:47Z
      Phase:        Failed
      Started At:   2026-09-04T16:32:47Z
      Value:        0.0025783212934329773
```
