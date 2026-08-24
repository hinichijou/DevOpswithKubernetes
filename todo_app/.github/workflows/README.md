[The main.yaml](https://github.com/hinichijou/DevOpswithKubernetes/tree/3.6/todo_app/.github/workflows/main.yaml) defines the GitHub workflow for building the required images and deploying them to our GKE Kubernetes cluster.

The built images are stored to the Google Cloud project Artifact registry repository.

It makes sense to build and upload only the images if there are changes to the related files. For that reason to workflow checks if there are changes to the related folder before triggering the build step. There is a popular GitHub Action [dorny/paths-filter](https://github.com/dorny/paths-filter) that seems to be built just for this purpose so this can be leveraged in our workflow to get a neat solution for monitoring changes in certain folders.

The workflow dispatch input `deploy_all` provides a possibility to skip the changes checks and deploy the whole application.

Uses the environment secrets `GKE_PROJECT`, `SERVICE_ACCOUNT` and `WORKLOAD_IDENTITY_PROVIDER` that are explained in the [configuration readme](https://github.com/hinichijou/DevOpswithKubernetes/tree/3.6/todo_app/.github/README.md) and `SOPS_AGE_KEY` that is used to decrypt [the encrypted postgres database secret](https://github.com/hinichijou/DevOpswithKubernetes/tree/3.6/todo_app/manifests/enc_secret_postgres.yaml).