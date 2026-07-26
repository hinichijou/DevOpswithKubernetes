import { createWriteStream } from 'fs'
import { access } from 'fs/promises'
import { pipeline } from 'stream/promises'
import type { ReadableStream as WebReadableStream } from 'node:stream/web';

import { imageDirectoryRootRelative, imagePathRootRelative } from '@/src/constants'

export const writeImage = async (res: Response) => {
  let saved = false
  if(res.body !== null){
    try {
      console.log(`Checking existence of path ${imageDirectoryRootRelative()}`)
      await access(imageDirectoryRootRelative())
      console.log(`Saving image to path ${imagePathRootRelative()}`)
      const writeStream = createWriteStream(imagePathRootRelative())
      await pipeline(res.body as WebReadableStream, writeStream)
      writeStream.end()
      saved = true
    }
    catch (e){
      console.error(`${e}`)
    }
  }

  return saved
}

export const createPostOptions = (bodyObj: object) => {
  return {method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bodyObj)}
}

export const readJSONResponse = (res: Response) => {
  return res.json()
}

export const readTextResponse = async (res: Response) => {
  return res.text()
}