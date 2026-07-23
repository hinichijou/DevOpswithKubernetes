import { NextResponse } from 'next/server'

import { localApiUrl } from '@/src/constants'
import ns from '@/services/networkService'
import { readJSONResponse } from '@/src/utils/web_only_utils'

const getOptions = (method: string, body: string) => {
  if(method === "POST"){
    return {method: "POST", headers: { 'Content-Type': 'application/json' }, body: body}
  }
  return {method: "GET"}
}

const proxyRequest = async (preRequest: Request, { params }: { params: Promise<{ path: string[] }> }) => {
  const { path } = await params
  const apiTarget = path.join('/')

  const res = ns.makeRequest(`${localApiUrl}${apiTarget}`, readJSONResponse, getOptions(preRequest.method, await preRequest.text()))

  return NextResponse.json(res)
}

export { proxyRequest as GET, proxyRequest as POST }