## Todo app

Application that displays a list of todos and a random image from `https://picsum.photos/1200`. Consists of a Next.js + React frontend, a Node.js + Hono backend and a PostgreSQL database which is used by the backend to store the todo data.

First run a Kubernetes cluster. In chapter 4  of the course we use [Google Kubernetes Engine](https://cloud.google.com/kubernetes-engine?hl=en) as a cloud service provider which offers free credits for practice use. After creating an account install [Google Cloud SDK](cloud.google.com/sdk/install) and [gke-gcloud-auth-plugin](https://docs.cloud.google.com/kubernetes-engine/docs/how-to/cluster-access-for-kubectl#install_plugin). Kubernetes Engine API needs to be enabled, this can be done by running `gcloud services enable container.googleapis.com`. The propagation of the API activation may take a few minutes.

After the API is enabled you can create the cluster by running `gcloud container clusters create dwk-cluster --zone=europe-north1-b --cluster-version=1.36 --disk-size=32 --num-nodes=4 --machine-type=e2-small --gateway-api=standard`. The installation will take few minutes.

Check with `kubectl cluster-info` that your configuration is pointing to the remote cluster instead of a local one. If the configuration is still pointing at a local cluster we can correct this by running `gcloud container clusters get-credentials dwk-cluster --zone=europe-north1-b`.

The project uses a namespace called project. You can create the namespace by running `kubectl create namespace project`. You can set the namespace as the default namespace by running `kubectl config set-context --current --namespace=project` or if you have [kubens](https://github.com/ahmetb/kubectx) installed more conviniently with `kubens project`. You can check the current active namespace by checking current context namespace with `kubectl config view` or just by calling `kubens`.

At this point follow the instructions for [task 3.10](https://github.com/hinichijou/DevOpswithKubernetes/tree/3.10/todo_app#task-310---configuration-for-backup-cronjob)

Deploy with `kubectl apply -k .`. This creates the resources defined by the yamls listed in [`kustomization.yaml`](https://github.com/hinichijou/DevOpswithKubernetes/tree/3.10/todo_app/kustomization.yaml) resources. The services define how the used application ports of the frontend and backend applications are connected to cluster internal network ports. The route resources define how the cluster internal services match to routing paths while the gateway resource defines a point of access to the cluster at which traffic is routed. The todo frontend application and the todo backend application have externally exposed routes while the postgres database is not exposed externally. The frontend requests  `/todo` path of the backend service. The todo list get is requested by the frontend directly using the kubernetes cluster internal routing and the post request for a new todo is done from the browser to the backend. [`The backend application route`](https://github.com/hinichijou/DevOpswithKubernetes/tree/3.10/todo_app/manifests/route_backend.yaml) defines a route rewriting rule where requests to the `/api` path are routed to the root path of the backend application.

The address assigned to the gateway will be the way to access the application. You can use `kubectl get gateway` to find out the address. `kubectl describe gateway *insert gateway name here*` can be used to get more detailed information about the gateway. The deployment might take several minutes and the reponses may be 404 and 502 before the application is available. [`healthcheckpolicies.yaml`](https://github.com/hinichijou/DevOpswithKubernetes/tree/3.10/todo_app/manifests/healthcheckpolicies.yaml) defines `/health` as the health check path for the frontend and backend applications, a successful response is required for the gateway to start routing traffic to the service.

Google Kubernetes Engine will automatically provision a persistent disk for persistent volume claims if the storage class is not set in the persistent volume claim which is the strategy we will be using. [`manifests/persistentvolumeclaim_todoapp.yaml`](https://github.com/hinichijou/DevOpswithKubernetes/tree/3.10/todo_app/manifests/persistentvolumeclaim_todoapp.yaml) requests a persistent volume resource to which the todo app uses to save the fetched image.

[`manifests/configmap_todoapp.yaml`](https://github.com/hinichijou/DevOpswithKubernetes/tree/3.10/todo_app/manifests/configmap_todoapp.yaml) holds the environment variables for the todo application frontend and backend. See [backend readme](https://github.com/hinichijou/DevOpswithKubernetes/tree/3.10/todo_app/backend/README.md) and [frontend readme](https://github.com/hinichijou/DevOpswithKubernetes/tree/3.10/todo_app/todo_app_frontend/README.md) for more information on what the meaning of each of the environment variables is.

 The backend saves the todo data to a Postgres database with persistent storage which is run as a single replica StatefulSet defined in [`manifests/statefulset_postgres.yaml`](https://github.com/hinichijou/DevOpswithKubernetes/tree/3.10/todo_app/manifests/statefulset_postgres.yaml). The env values required for the configuration of the database and the connection between backend and database can be found in [`manifests/configmap_postgres.yaml`](https://github.com/hinichijou/DevOpswithKubernetes/tree/3.10/todo_app/manifests/configmap_postgres.yaml). The configMapGenerator in [`kustomization.yaml`](https://github.com/hinichijou/DevOpswithKubernetes/tree/3.10/todo_app/kustomization.yaml) creates a file resource for the database initialization based on the contents of the [`manifests/init_todo_db.sql`](https://github.com/hinichijou/DevOpswithKubernetes/tree/3.10/todo_app/manifests/init_todo_db.sql) file. This file also defines the default todos displayed on the page. If deployed to a local cluster the setup should also contain a secret file  `secret_postgres.yaml` which is not in version control which has the name `secret-postgres-config` and defines the environment variable `POSTGRES_PASSWORD`. You can refer to the encrypted version of the file [`manifests/enc_secret_postgres.yaml`](https://github.com/hinichijou/DevOpswithKubernetes/tree/3.10/todo_app/manifests/enc_secret_postgres.yaml) to see what kind of resource is expected. The encrypted version is decrypted and deployed in the [github deployment workflow](https://github.com/hinichijou/DevOpswithKubernetes/tree/3.10/.github/workflows/main.yaml).

[`manifests/wikipedia_todo_job.yaml`](https://github.com/hinichijou/DevOpswithKubernetes/tree/3.10/todo_app/manifests/wikipedia_todo_job.yaml) defines a CronJob that sends a new todo post request to backend every hour with the content of "Read *random wikipedia link*". The random wikipedia link is obtained by sending a request to https://en.wikipedia.org/wiki/Special:Random. The job uses a Docker image that contains a single shell script, the contents of the image can be found from [`wikipedia_todo_job folder`](https://github.com/hinichijou/DevOpswithKubernetes/tree/3.10/todo_app/wikipedia_todo_job).

You can follow pod output logs with `kubectl logs -f *insert pod name here*`. You can use `kubectl get pods` to find out the pod name.

See the [monitoring folder](https://github.com/hinichijou/DevOpswithKubernetes/tree/3.10/monitoring) and the [monitoring readme](https://github.com/hinichijou/DevOpswithKubernetes/tree/3.10/monitoring/README.md) for instructions on how to run a monitoring setup for the deployment.

You can view the HTML page served from http://**enter gateway ip here**. The frontend fetches a new image from https://picsum.photos/1200 every 10 minutes. The frontend writes the image to persistent storage so it persists between application restarts. Frontend reads said image from the persistent storage and displays it. The backend has a get and post path for todos at `/todos` which is accessable at http://**enter gateway ip here**/api/todos. The frontend has the functionality for displaying the todos and adding a new todo. The Wikipedia todo CronJob is scheduled to post a new todo with a random Wikipedia link every hour.

You can remove the resources applied with the kustomization file with `kubectl delete -k .`. This doesn't delete the postgres persistent volumes which are not directly created in the manifests. You can delete them by finding the names with `kubectl get pvc` and calling delete directly for the persistent volume claims. You can also delete all resources of certain type, for example `kubectl delete --all deployments` would delete all deployment resources in the current namespace.

Delete the cluster with `gcloud container clusters delete dwk-cluster --zone=europe-north1-b` after use to avoid using credits while the cluster is not in use.

### Task 3.10 - Configuration for backup CronJob
Follows the instructions from https://docs.cloud.google.com/kubernetes-engine/docs/how-to/workload-identity

We will save the backups to a Google Cloud Storage bucket. It should be noted that [Uniform bucket-level access must be enabled to grant Workforce Identity Federation or Workload Identity Federation entities access to Cloud Storage resources](https://docs.cloud.google.com/storage/docs/uniform-bucket-level-access). You can create the bucket with `gcloud storage buckets create gs://project-db-backup-bucket --location=europe-north1 --uniform-bucket-level-access` if it does not exist already. If it does already exist it can by updated with `gcloud storage buckets update gs://project-db-backup-bucket --uniform-bucket-level-access`

You can enable Workload Identity Federation for an existing cluster with `gcloud container clusters update dwk-cluster --zone=europe-north1-b --workload-pool=PROJECT_ID.svc.id.goog` or create the cluster with it already enabled with `gcloud container clusters create dwk-cluster --zone=europe-north1-b --cluster-version=1.36 --disk-size=32 --num-nodes=4 --machine-type=e2-small --gateway-api=standard --workload-pool=PROJECT_ID.svc.id.goog`. `PROJECT_ID` needs to be set to match the Google Cloud project ID.

Create a node pool with `gcloud container node-pools create db-backup-pool --cluster=dwk-cluster --location=europe-north1-b --disk-size=30GB --spot --workload-metadata=GKE_METADATA`. The `--workload-metadata=GKE_METADATA` flag configures the node pool to use the GKE metadata server. `--disk-size=30GB` and `--spot` are added just for cost effectiveness, by default the reserved disk size is 100GB which seemed excessive, you can read more about spot VMs here https://docs.cloud.google.com/compute/docs/instances/spot.

A Kubernetes ServiceAccount needs to be created to the same namespace as the job we are authenticating. This can be done with `kubectl create serviceaccount db-backup-sa --namespace project`.

Create an IAM policy that references the KSA. We need to grant permissions to specific Google Cloud resources that the job needs access to. Based on https://docs.cloud.google.com/iam/docs/roles-permissions/storage `roles/storage.objectCreator` seems like a sensible choice. We can create the IAM policy with `gcloud storage buckets add-iam-policy-binding gs://project-db-backup-bucket --role=roles/storage.objectCreator --member=principal://iam.googleapis.com/projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/PROJECT_ID.svc.id.goog/subject/ns/project/sa/db-backup-sa --condition=None`. Again set `PROJECT_ID` value correctly. `PROJECT_NUMBER` can be found by running `gcloud projects list`.

[`manifests/db_backup_job.yaml`](https://github.com/hinichijou/DevOpswithKubernetes/tree/3.10/todo_app/manifests/db_backup_job.yaml) defines a CronJob that takes a backup of the postgres database every 24 hours and saves the result to Google Cloud Storage bucket. The job uses a Docker image that contains a single shell script, the contents of the image can be found from [`db_backup_job folder`](https://github.com/hinichijou/DevOpswithKubernetes/tree/3.10/todo_app/db_backup_job). See [`db_backup_job readme`](https://github.com/hinichijou/DevOpswithKubernetes/tree/3.10/todo_app/db_backup_job/README.md) for more detailed explanation.

Note that after enabling Uniform bucket-level access an IAM role that has access to view and manipulate the files in the storage bucket is required if you want to do anything with the files. I gave myself the storage admin role with `gcloud storage buckets add-iam-policy-binding gs://project-db-backup-bucket --member="user:enteriamaccounthere" --role=roles/storage.admin`.

Note that the unlike the KSA and node pool that are tied to the cluster the IAM policy will still exist after cluster deletion and apply if the service account with the same name is created. This can be revoked with `gcloud storage buckets remove-iam-policy-binding gs://project-db-backup-bucket --member='principal://iam.googleapis.com/projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/PROJECT_ID.svc.id.goog/subject/ns/project/sa/db-backup-sa' --role='roles/storage.objectCreator' --all`.

Example of a successful response logged by the backup job pod:
```
Backup upload successful. Response: {
  "kind": "storage#object",
  "id": "project-db-backup-bucket/project-1787965200-backup.sql/1787965201516128",
  "selfLink": "https://www.googleapis.com/storage/v1/b/project-db-backup-bucket/o/project-1787965200-backup.sql",
  "mediaLink": "https://storage.googleapis.com/download/storage/v1/b/project-db-backup-bucket/o/project-1787965200-backup.sql?generation=1787965201516128&alt=media",
  "name": "project-1787965200-backup.sql",
  "bucket": "project-db-backup-bucket",
  "generation": "1787965201516128",
  "metageneration": "1",
  "contentType": "application/octet-stream",
  "storageClass": "STANDARD",
  "size": "2375",
  "md5Hash": "ghMpBrD/8EgCc3PGa01EkQ==",
  "crc32c": "yFrC0Q==",
  "etag": "COCM1LXRxJYDEAE=",
  "timeCreated": "2026-08-29T01:00:01.522Z",
  "updated": "2026-08-29T01:00:01.522Z",
  "timeStorageClassUpdated": "2026-08-29T01:00:01.522Z",
  "timeFinalized": "2026-08-29T01:00:01.522Z"
}
```