import * as k8s from '@kubernetes/client-node'

import { createDeployment } from './deployment.js'
import { createService } from './service.js'
import { createRoute } from './route.js'
import { assertIsDummySite } from './utils.js'

const kc = new k8s.KubeConfig()
process.env.NODE_ENV === 'development' ? kc.loadFromDefault() : kc.loadFromCluster()

const customApi = kc.makeApiClient(k8s.CustomObjectsApi)
const appsApi = kc.makeApiClient(k8s.AppsV1Api)
const coreApi = kc.makeApiClient(k8s.CoreV1Api)

// Informer example: https://github.com/kubernetes-client/javascript/blob/bb12131e5ed8d0e3e2a99518abb7f99b86b1b09e/examples/typescript/informer/informer.ts
// Couldn't find custom resource examples for Javascript but, while not directly copy-pasteable,
// the Python documentation had good examples: https://github.com/kubernetes-client/python/blob/master/examples/namespaced_custom_object.py
const listFn = () => customApi.listClusterCustomObject(
  {
    group: 'stable.dwk',
    version:'v1',
    plural: 'dummysites'
  }
)
const informer = k8s.makeInformer(kc, `/apis/stable.dwk/v1/dummysites`, listFn)

informer.on('add', async (obj: k8s.KubernetesObject) => {
    // The object should have a namespace populated by the API server or otherwise it is not namespace scoped
    const name = obj.metadata!.name
    const namespace = obj.metadata!.namespace
    console.log(`Added: ${name} to namespace ${namespace}`)

    // If assertion fails we can consider this object faulty
    try {
      // Asserts has all required fields for defining a DummySite
      assertIsDummySite(obj)
    }
    catch (e) {
      console.log(`${e}`)
      return
    }

    try {
      await createDeployment(appsApi, obj)
    }
    catch (e) {
      console.log(`${e}`)
      return
    }

    console.log(`Created deployment for: ${obj.metadata.name} to namespace ${namespace}`)

    try {
      await createService(coreApi, obj)
    }
    catch (e) {
      console.log(`${e}`)
      return
    }

    console.log(`Created service for: ${obj.metadata.name} to namespace ${namespace}`)

    try {
      await createRoute(customApi, obj)
    }
    catch (e) {
      console.log(`${e}`)
      return
    }

    console.log(`Created route for: ${obj.metadata.name} to namespace ${namespace}. Available at path /${obj.metadata.name}`)
})

informer.on('update', (obj: k8s.KubernetesObject) => {
    console.log(`Updated: ${obj.metadata!.name} in namespace ${obj.metadata!.namespace}`)
})

informer.on('delete', (obj: k8s.KubernetesObject) => {
    console.log(`Deleted: ${obj.metadata!.name} from namespace ${obj.metadata!.namespace}`)
})

informer.on('error', (err: k8s.KubernetesObject) => {
    console.error(err)
    // Restart informer after 5sec
    setTimeout(() => {
        informer.start()
    }, 5000)
})

informer.start()