## Infrastructure manifests

Manifests that provide cross-app infrastructure. Applied this way a single gateway can serve multiple namespaces, for example namespace argocd which deploys to namespaces exercises and project which are accessed externally by different routes. [Related Kubernetes documentation](https://gateway-api.sigs.k8s.io/guides/user-guides/multiple-ns/).

Deploy with `kubectl apply -k .`.

* [gateway.yaml](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.7/infrastructure_manifests/manifests/gateway.yaml): defines the gateway resource for cluster service access.
* [namespaces.yaml](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.7/infrastructure_manifests/manifests/namespaces.yaml): defines all of the project namespaces and a rule if the namespace is allowed to attach routes to the gateway.

You can a namespace as the default namespace by running `kubectl config set-context --current --namespace=namespace-name` or if you have [kubens](https://github.com/ahmetb/kubectx) installed more conviniently with `kubens namespace-name`. You can check the current active namespace by checking current context namespace with `kubectl config view` or just by calling `kubens`.