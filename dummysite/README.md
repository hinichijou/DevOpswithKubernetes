## Log output and ping-pong applications

Contains source code for a dummysite application and a custom resource controller listening for dummysite resources. Configurations and instructions for running the application in a Kubernetes cluster can be found from [a separate repository](https://github.com/hinichijou/DevOpswithKubernetesManifests/tree/5.1/dummysite).

* The [dummysite app folder](https://github.com/hinichijou/DevOpswithKubernetes/tree/5.1/dummysite/dummysite_app) contains the source code for a Node.js Hono server that copies the html content of the url configured in an env variable and serves said content in the application root path.

* The [dummysite controller folder](https://github.com/hinichijou/DevOpswithKubernetes/tree/5.1/dummysite/dummysite_controller) contains the source code for a custom Kubernetes resource controller written using the [Kubernetes Client Javascript library](https://github.com/kubernetes-client/javascript).