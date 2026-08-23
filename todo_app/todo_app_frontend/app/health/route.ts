import { NextResponse } from 'next/server'

// A path to serve as the default health check path for GKE
const healthRequest = (req: Request) => {
  return new NextResponse('Todo frontend healthy.', { status: 200 })
}

export { healthRequest as GET }