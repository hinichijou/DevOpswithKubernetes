import { AppsV1Api, V1Deployment } from '@kubernetes/client-node'
import { type Dummysite } from './types.js'

// While it would make sense to use external template files for the resource
// definitions like in the example app, the Kubernetes client examples seem to always define
// the resources in the source code. For example: https://github.com/kubernetes-client/javascript/blob/main/examples/ingress.js
// Useable examples: https://github.com/kubernetes-client/javascript/blob/bb12131e5ed8d0e3e2a99518abb7f99b86b1b09e/src/test/integration/portForward.ts#L201

export const createDeployment = async (api: AppsV1Api, obj: Dummysite) => {
  const deployment = new V1Deployment()
  deployment.metadata = {
    name: `dummysite-dep-${obj.metadata.name}`,
    namespace: obj.metadata.namespace,
    // Required for deletion on source resource deletion. https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.37/#ownerreference-v1-meta
    ownerReferences: [
      {
        apiVersion: obj.apiVersion,
        uid: obj.metadata.uid,
        name: obj.metadata.name,
        kind: obj.kind,
        controller: true,
        // Could add this to enforce "children" first deletion order
        //blockOwnerDeletion: true
      }
    ]
  }
  deployment.spec = {
    replicas: 1,
    selector: {
      matchLabels: {
        app: `dummysite-${obj.metadata.name}`
      }
    },
    template: {
      metadata: {
        labels: {
          app: `dummysite-${obj.metadata.name}`
        }
      },
      spec: {
        containers: [
          {
            name: `dummysite-${obj.metadata.name}`,
            image: obj.spec.image,
            env: [
              {
                name: 'URL',
                value: obj.spec.website_url
              }
            ]
          }
        ],
        securityContext: {
          fsGroup: 1001
        }
      }
    }
  }

  await api.createNamespacedDeployment({ namespace: obj.metadata.namespace, body: deployment })
}