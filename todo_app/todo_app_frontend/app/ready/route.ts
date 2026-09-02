import { NextResponse } from 'next/server'

import ns from '@/services/networkService'
import { readTextResponse } from '@/src/utils/web_only_utils'
import { backendReadyURL } from '@/src/constants'

// A path to serve as the default ready check path
const readyRequest = async (req: Request) => {
  const data = await ns.makeRequest(backendReadyURL(), readTextResponse)
  if (data) {
    return new NextResponse('Todo frontend ready.', { status: 200 })
  }
  else {
    return new NextResponse('Todo backend not ready.', { status: 503 })
  }
}

export { readyRequest as GET }