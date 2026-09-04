## Monitoring setup

Monitoring stack using Prometheus, Loki, Alloy (k8s-monitoring) and Grafana.

Install [Helm](https://helm.sh/docs/intro/install/).

Register repositories for Prometheus and Grafana to Helm:
```
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update
```

Run a Kubernetes cluster if you aren't running one already. For example with k3d you can run `k3d cluster create -p 8081:80@loadbalancer --agents 2`. Local port 8081 is opened to port 80 in load balancer.

Create a namespace for the monitoring resources with `kubectl create namespace monitoring`.

The [`values folder`](https://github.com/hinichijou/DevOpswithKubernetes/tree/2.10/monitoring/values) contains configuration files for each of the components.

Install the monitoring components by running the following in the values folder. The dependency order needs to be followed: Alloy needs Loki running and Grafana needs both Prometheus and Loki available:
```
helm upgrade --install prom prometheus-community/prometheus \
  --namespace monitoring \
  --create-namespace \
  --values prom-values.yaml

helm upgrade --install loki grafana/loki \
  --namespace monitoring \
  --values loki-values.yaml

helm upgrade --install k8smon grafana/k8s-monitoring \
  --namespace monitoring \
  --values k8smon-values.yaml

helm upgrade --install grafana grafana/grafana \
  --namespace monitoring \
  --values grafana-values.yaml
```

You can use the following commands to confirm everything is running correctly:
```
helm list --namespace monitoring
kubectl get svc --namespace monitoring
kubectl get pods --namespace monitoring
```

You can port forward Grafana to localhost port 3000 with `kubectl port-forward --namespace monitoring svc/grafana 3000:80`. The monitoring UI should now be available at http://localhost:3000. Use the default credentials admin/admin to log in.

You can for example query log messages by namespace by setting Loki as datasource and making the query `{namespace="default"}`.

You can remove almost anything with `helm delete [name]` with the name found using the command `helm list --namespace monitoring`. Custom resource definitions are left and have to be manually removed if the need arises. The definitions don't do anything by themselves, so leaving them does no harm.

The cluster can be stopped with `k3d cluster stop` and started with `k3d cluster start`. The cluster can be deleted with `k3d cluster delete`.

### Task 4.3
Task: Ok, we started up Prometheus in Chapter 3, but we have barely scratched the surface. Let's do a single hands-on query to learn more. Start now Prometheus with Helm, and use port-forward to access the GUI website. This time, we will do the port forwarding through the service. You can get the name of the service with `kubectl -n monitoring get svc` and set up port forwarding with `kubectl port-forward svc/prom-prometheus-server -n monitoring 9090:80`. And now accessing http://localhost:9090 will allow us to write queries. Write a query that shows the number of pods created by StatefulSets in prometheus namespace. For the above setup the Value should be 3 different pods. Query for "kube_pod_info" should have the required fields to filter through. See [documentation](https://prometheus.io/docs/prometheus/latest/querying/basics/) for help with querying.

Lets start by installing Prometheus and Grafana like in the task instruction with the configuration from chapter 3.5:

```
helm upgrade --install prom prometheus-community/prometheus \
  --namespace monitoring \
  --create-namespace \
  --values prom-values.yaml

helm upgrade --install grafana grafana/grafana \
  --namespace monitoring \
  --values grafana-values.yaml
```

This made the task seem like a trick question since I couldn't find any StatefulSets running `kube_pod_info` query and neither is there a namespace called prometheus created. However looking at the [course material GitHub](https://github.com/kubernetes-hy/kubernetes-hy.github.io/blob/master/data/part-2/5-monitoring.md) the installation instructions are completely different which makes me think that the task has not been updated to the latest version of the course or then there is some mixup in the material that should be displayed for chapter 3.5. I tried following these instuctions instead:

```
kubectl create namespace prometheus
helm install prometheus-community/kube-prometheus-stack --generate-name --namespace prometheus
```

then finding the pod name and port-forwarding:

```
kubectl -n prometheus get pods
kubectl -n prometheus port-forward prometheus-kube-prometheus-stack-1788-prometheus-0 9090:9090
```

In this case I can find two pods with the query `kube_pod_info{created_by_kind="StatefulSet", namespace="prometheus"}`. The task says there should be three but this could be a change in the default configuration or there might be a slight change to the configuration somewhere in the GitHub material but I believe my answer is correct with the information I have.

![Image of the query results](https://github.com/hinichijou/DevOpswithKubernetes/blob/4.3/monitoring/prometheus_query.png?raw=true)
