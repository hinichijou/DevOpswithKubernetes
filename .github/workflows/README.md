## Deployment pipeline

Configration for a pipeline that builds docker images and deploys to Google Cloud when related repository folders receive a push.

The [deploy-on-push.yaml](https://github.com/hinichijou/DevOpswithKubernetes/tree/3.8/.github/workflows/deploy-on-push.yaml) requires that the environment secrets `GKE_PROJECT`, `SERVICE_ACCOUNT` and `WORKLOAD_IDENTITY_PROVIDER` are set.

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

### deploy-on-push.yaml

[The deploy-on-push.yaml](https://github.com/hinichijou/DevOpswithKubernetes/tree/3.8/.github/workflows/deploy-on-push.yaml) defines the GitHub workflow for building the required images and deploying them to our GKE Kubernetes cluster.

The built images are stored to the Google Cloud project Artifact registry repository.

It makes sense to build and upload only the images if there are changes to the related files. For that reason to workflow checks if there are changes to the related folder before triggering the build step. There is a popular GitHub Action [dorny/paths-filter](https://github.com/dorny/paths-filter) that seems to be built just for this purpose so this can be leveraged in our workflow to get a neat solution for monitoring changes in certain folders.

If there are no changes fo the image relevant folder the workflow will search for the latest image built from the branch and uses that. The workflow assumes that I image for the branch exists

The workflow creates a namespace for each deployment based on the branch that gets pushed. The namespace name will be the branch name. The only exception is the main branch which gets deployed to a branch called project.

The workflow dispatch input `deploy_build_all` provides a possibility to skip the changes checks and build and deploy the whole application. The input `deploy_build_necessary` deploys the application while only building images if existing ones are not found, effectively working the same as a manifest change.

Uses the environment secrets `GKE_PROJECT`, `SERVICE_ACCOUNT` and `WORKLOAD_IDENTITY_PROVIDER` that are explained above and `SOPS_AGE_KEY` that is used to decrypt [the encrypted postgres database secret](https://github.com/hinichijou/DevOpswithKubernetes/tree/3.8/todo_app/manifests/enc_secret_postgres.yaml).

### on-delete-branch.yaml
[on-delete-branch.yaml](https://github.com/hinichijou/DevOpswithKubernetes/tree/3.8/.github/workflows/on-delete-branch.yaml) defines a GitHub workflow for deleting the environment with the same name as the deleted branch from the Kubernetes cluster. The workflow basically just calls `kubectl delete namespace -n $NAMESPACE` after authentication.

The workflow dispatch input `delete_deployment` provides a possibility to trigger the namespace deletion workflow for the current branch without the branch being deleted.

The name of the namespace to be deleted will be the name of the deleted branch. The only exception is the main branch which is deployed to a namespace called `project`.

The images built from the branch in artifacts repository are not deleted in the workflow as the branch deletion doesn't necessarily mean that this is desired.

Uses the environment secrets `GKE_PROJECT`, `SERVICE_ACCOUNT` and `WORKLOAD_IDENTITY_PROVIDER` that are explained above.

### Task 3.8
The deletion workflow assumes that there is a running GKE cluster. This means that the [todo app readme](https://github.com/hinichijou/DevOpswithKubernetes/tree/3.8/todo_app/README.md) cluster creation steps should be followed. The deletion workflow does not do anything if there is no existing namespace in the cluster with the same name as the branch being deleted.

Example of a successful deletion workflow on branch deletion: https://github.com/hinichijou/DevOpswithKubernetes/actions/runs/33008690838/job/98309023544
Example of a successful deletion workflow on delete_deployment dispatch input: https://github.com/hinichijou/DevOpswithKubernetes/actions/runs/33008233576/job/98307471845