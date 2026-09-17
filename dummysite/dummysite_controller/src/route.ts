import { CustomObjectsApi } from '@kubernetes/client-node'
import { type Dummysite } from './types.js'

const SERVICE_PORT = process.env.SERVICE_PORT || 3000

// While it would make sense to use external template files for the resource
// definitions like in the example app, the Kubernetes client examples seem to always define
// the resources in the source code. For example: https://github.com/kubernetes-client/javascript/blob/main/examples/ingress.js
// Useable examples: https://github.com/kubernetes-client/javascript/blob/bb12131e5ed8d0e3e2a99518abb7f99b86b1b09e/src/test/integration/portForward.ts#L201

// Seems like there isn't similar structure for the gateway api as the core api. Needs to be defined as a custom resource
// Example of custom resource definition: https://github.com/kubernetes-client/python/blob/master/examples/cluster_scoped_custom_object.py
export const createRoute = async (api: CustomObjectsApi, obj: Dummysite) => {
  const route = {
    'apiVersion': 'gateway.networking.k8s.io/v1beta1',
    'kind': 'HTTPRoute',
    'metadata': {
      'name': 'dummysite-route',
      'namespace': `${obj.metadata.namespace}`,
      'ownerReferences': [
        {
          'apiVersion': `${obj.apiVersion}`,
          'uid': `${obj.metadata.uid}`,
          'name': `${obj.metadata.name}`,
          'kind': `${obj.kind}`,
          'controller': true
        }
      ]
    },
    'spec': {
      'parentRefs': [
        {
          'name': 'infra-gateway',
          'namespace': 'infra'
        }
      ],
      'rules': [
        {
          'matches': [
            {
              'path': {
                'type': 'PathPrefix',
                'value': `/${obj.metadata.name}`,
              }
            }
          ],
          'backendRefs': [
            {
              'name': `dummysite-svc-${obj.metadata.name}`,
              'port': SERVICE_PORT
            }
          ],
          'filters': [
            {
              'type': `URLRewrite`,
              'urlRewrite': {
                'path': {
                  'type': 'ReplacePrefixMatch',
                  'replacePrefixMatch': '/'
                }
              }
            }
          ],
        }
      ]
    }
  }

  await api.createNamespacedCustomObject(
    {
      group: 'gateway.networking.k8s.io',
      version: 'v1beta1',
      plural: 'httproutes',
      namespace: obj.metadata.namespace,
      body: route
    }
  )
}