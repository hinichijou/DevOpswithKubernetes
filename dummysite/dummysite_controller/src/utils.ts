import { type KubernetesObject } from '@kubernetes/client-node'
import { type Dummysite } from './types.js'

export function assertIsDummySite(obj: KubernetesObject): asserts obj is Dummysite {
  if (!obj.apiVersion || !obj.kind || !obj.metadata || !obj.metadata.name || !obj.metadata.uid) {
    throw new Error(
      `Received object missing values required for valid OwnerReference`
    )
  }

  const ds = obj as Dummysite

  if (!ds.spec || !ds.spec.image || !ds.spec.website_url) {
    throw new Error(
      `Received object missing values required for valid Dummysite`
    )
  }
}