## Deployment pipeline

Configration for a pipeline that builds docker images and deploys to Google Cloud when related repository folders receive a push.

The [main.yaml](https://github.com/hinichijou/DevOpswithKubernetes/tree/3.6/.github/workflows/main.yaml) requires that the environment secrets `GKE_PROJECT`, `SERVICE_ACCOUNT` and `WORKLOAD_IDENTITY_PROVIDER` are set.

`GKE_PROJECT` is the Google Cloud project ID, which you find in the Google Cloud console.

Service account needs to be created with the following commands. `PROJECT_ID` in these commands needs to be set to match the Google Cloud project ID.
```
# Create a service account
gcloud iam service-accounts create "github-actions-sa" --display-name="GitHub Actions SA"

gcloud projects add-iam-policy-binding PROJECT_ID --role="roles/artifactregistry.writer" --member="serviceAccount:github-actions-sa@PROJECT_ID.iam.gserviceaccount.com"

gcloud projects add-iam-policy-binding PROJECT_ID --role="roles/container.developer" --member="serviceAccount:github-actions-sa@PROJECT_ID.iam.gserviceaccount.com"
```

Next, we will create a workload identity pool and OIDC provider. `YOUR_ORG/YOUR_REPO` should match your GitHub user (or organization)/repository:
```
gcloud iam workload-identity-pools create "github-pool" --location="global" --display-name="GitHub Actions Pool"

gcloud iam workload-identity-pools providers create-oidc "github-provider" --location="global" --workload-identity-pool="github-pool" --display-name="GitHub provider" --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" --attribute-condition="assertion.repository=='YOUR_ORG/YOUR_REPO'" --issuer-uri="https://token.actions.githubusercontent.com"
```

Final step is to allow GitHub repo to impersonate the as the service account:
```
gcloud iam service-accounts add-iam-policy-binding github-actions-sa@PROJECT_ID.iam.gserviceaccount.com --role="roles/iam.workloadIdentityUser" --member="principalSet://iam.googleapis.com/projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-pool/attribute.repository/YOUR_ORG/YOUR_REPO"
```
Again set `PROJECT_ID` and `YOUR_ORG/YOUR_REPO` values correctly. `PROJECT_NUMBER` can be found by running `gcloud projects list`.

Value of the `SERVICE_ACCOUNT` environment secret is `github-actions-sa@PROJECT_ID.iam.gserviceaccount.com`.

Value of the `WORKLOAD_IDENTITY_PROVIDER` environment secret is `projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-pool/providers/github-provider`.

### Explanation of the steps

First we created a service account to act as a Google cloud identity for the pipeline as Google Cloud permissions cannot be granted directly to a GitHub identity.

The service account was granted the `artifactregistry.writer` role so it has the permission to push images and `container.developer` role so it can deploy resources.

Next, we created a Workload Identity Pool — a container in Google Cloud that holds trusted external identity sources.

Then we registered GitHub as a trusted OIDC Provider inside that pool, after which GitHub is treated as a approved security token provider. The source repository is checked to match the repository condition set.

The final binding allows the specified repository to impersonate the service account. This makes it so that only the defined repo can use it instead of all other GitHub workflows.

When the pipeline runs GitHub issues a short-lived signed token which Google Cloud verifies and exchanges to a short lived Google Cloud access token. No secrets need to be stored.

### main.yaml

[The main.yaml](https://github.com/hinichijou/DevOpswithKubernetes/tree/3.6/.github/workflows/main.yaml) defines the GitHub workflow for building the required images and deploying them to our GKE Kubernetes cluster.

The built images are stored to the Google Cloud project Artifact registry repository.

It makes sense to build and upload only the images if there are changes to the related files. For that reason to workflow checks if there are changes to the related folder before triggering the build step. There is a popular GitHub Action [dorny/paths-filter](https://github.com/dorny/paths-filter) that seems to be built just for this purpose so this can be leveraged in our workflow to get a neat solution for monitoring changes in certain folders.

The workflow dispatch input `deploy_all` provides a possibility to skip the changes checks and build and deploy the whole application.

Uses the environment secrets `GKE_PROJECT`, `SERVICE_ACCOUNT` and `WORKLOAD_IDENTITY_PROVIDER` that are explained above and `SOPS_AGE_KEY` that is used to decrypt [the encrypted postgres database secret](https://github.com/hinichijou/DevOpswithKubernetes/tree/3.6/todo_app/manifests/enc_secret_postgres.yaml).

### Task 3.6
The deployment workflow assumes that there is a GKE cluster running and that the peristent volume manifests have been applied to the cluster since they are not necessarily managed by the developers and are considered non application specific. This means that the [todo app readme](https://github.com/hinichijou/DevOpswithKubernetes/tree/3.6/todo_app/README.md) should be followed until the `kubectl apply -f persistent_volume_manifests` step.

Example of a successful workflow dispatch triggered full application deployment: https://github.com/hinichijou/DevOpswithKubernetes/actions/runs/32779000648

Examples of a successful automatic deployments triggered by git push: https://github.com/hinichijou/DevOpswithKubernetes/actions/runs/32781621702 and https://github.com/hinichijou/DevOpswithKubernetes/actions/runs/32782539470