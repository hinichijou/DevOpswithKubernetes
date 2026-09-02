import { NextResponse } from 'next/server'

import { getAppBroken } from '@/services/test'

// A path to serve as the default health check path
const healthRequest = async (req: Request) => {
  const breakApp = await getAppBroken()
  const message = breakApp ? 'Todo frontend unhealthy.' : 'Todo frontend healthy.'
  const status = breakApp ? 500 : 200

  return new NextResponse(message, { status: status })
}

export { healthRequest as GET }