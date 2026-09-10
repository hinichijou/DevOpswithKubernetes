It is assumed that the [infrastucture_manifests folder](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.7/infrastucture_manifests) resources are applied first. This creates the necessary namespace(s).

Install [ArgoCD](https://argo-cd.readthedocs.io/en/stable/getting_started/) with the following command(s):
```
kubectl apply --server-side -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

Apply manifests with `kubectl apply -k .`.

* [route_argocd.yaml](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.7/services/argocd/manifests/route_argocd.yaml): defines the route resource for accessing the ArgoCD service that is used for managing application deployments.
* [configmap_argocd.yaml](https://github.com/hinichijou/DevOpswithKubernetes/tree/4.7/services/argocd/manifests/configmap_argocd.yaml): see [instructions](https://argo-cd.readthedocs.io/en/stable/operator-manual/ingress/#gateway-api-example). Uses `server.insecure: "true"` to allow http traffic, for remote use this could be ok also but we would need to enforce https on gateway level in that case. Other option would be to enforce https on gateway level and use self-signed certificates for local testing. Exposing with a LoadBalancer instead would allow a direct https connction from browser.