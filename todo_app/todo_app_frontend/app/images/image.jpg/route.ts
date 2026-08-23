import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'

import { imagePathRootRelative } from '@/src/constants'

// The motivation for the route is to serve a dynamic image asset during runtime as next js treats public
// folder as runtime static. The main ways to handle this seem to be this or using a cloud asset provider.
const imageRequest = async (req: Request) => {
  try {
    console.log(`Reading image from path ${imagePathRootRelative()}`)
    const fileBuffer = await readFile(imagePathRootRelative())
    return new NextResponse(
      fileBuffer,
      {
        status: 200,
        headers: {
          'Content-Type': 'image/jpg'
        }
      }
    )
  }
  catch (e){
    const error = `${e}`
    console.error(`${error}`)
    return new NextResponse(error, { status: 404 })
  }
}

export { imageRequest as GET }