import { CoreV1Api, V1Service } from '@kubernetes/client-node'
import { type Dummysite } from './types.js'

const APP_PORT = process.env.APP_PORT || 3000
const SERVICE_PORT = process.env.SERVICE_PORT || 3000

// While it would make sense to use external template files for the resource
// definitions like in the example app, the Kubernetes client examples seem to always define
// the resources in the source code. For example: https://github.com/kubernetes-client/javascript/blob/main/examples/ingress.js
// Useable examples: https://github.com/kubernetes-client/javascript/blob/bb12131e5ed8d0e3e2a99518abb7f99b86b1b09e/src/test/integration/portForward.ts#L201

export const createService = async (api: CoreV1Api, obj: Dummysite) => {
  const service = new V1Service()
  service.metadata = {
    name: `dummysite-svc-${obj.metadata.name}`,
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
  service.spec = {
    type: 'ClusterIP',
    selector: {
      app: `dummysite-${obj.metadata.name}`
    },
    ports: [
      {
        port: APP_PORT,
        protocol: 'TCP',
        targetPort: SERVICE_PORT
      }
    ]
  }

  await api.createNamespacedService({ namespace: obj.metadata.namespace, body: service })
}