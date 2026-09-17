## Dummysite controller

A custom Kubernetes resource controller written using the [Kubernetes Client Javascript library](https://github.com/kubernetes-client/javascript).

Meant to be used inside a Kubernetes cluster. Creates a k8s informer that listens for `add` events for `/apis/stable.dwk/v1/dummysites` i.e. created [dummysite resources](https://github.com/hinichijou/DevOpswithKubernetesManifests/tree/5.1/dummysite/infrastructure/base/manifests/resourcedefinition_dummysite.yaml).

Creates a [deployment](https://github.com/hinichijou/DevOpswithKubernetesManifests/tree/5.1/dummysite/dummysite_controller/src/deployment.ts), [service](https://github.com/hinichijou/DevOpswithKubernetesManifests/tree/5.1/dummysite/dummysite_controller/src/service.ts) and a [route](https://github.com/hinichijou/DevOpswithKubernetesManifests/tree/5.1/dummysite/dummysite_controller/src/route.ts) resource for each dummysite resource received from an `add` event. The resources are set a `ownerReference` which references the creating custom resource, when the custom resource is deleted also the created "child" resources are deleted. Produces logs for each received `add`, `update`, `delete` and `error` event, but only the `add` event contains any functionality outside of the logging.

Install with `npm install`