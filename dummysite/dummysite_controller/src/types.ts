import { type KubernetesObject, V1ObjectMeta } from '@kubernetes/client-node'

export interface Dummysite extends KubernetesObject {
  apiVersion: string
  kind: string
  metadata: V1ObjectMeta & {
    name: string
    uid: string
    namespace: string
  }
  spec: {
    image: string
    website_url: string
  }
}