import { createWriteStream } from 'fs'
import { access, writeFile, unlink } from 'fs/promises'
import { pipeline } from 'stream/promises'
import type { ReadableStream as WebReadableStream } from 'node:stream/web';

import { dynamicAssetDirectory, imagePathRootRelative } from '@/src/constants'

export const writeImage = async (res: Response) => {
  let saved = false
  if(res.body !== null){
    try {
      console.log(`Checking existence of path ${dynamicAssetDirectory()}`)
      await access(dynamicAssetDirectory())
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

export const checkFileOrDirectoryExists = async (path: string, log: boolean = true) => {
  let exists = false
  try {
    if(log)
      console.log(`Checking existence of path ${path}`)

    await access(path)
    exists = true
  }
  catch (e){
    if(log)
      console.error(`${e}`)
  }

  return exists
}

export const deleteFile = async (path: string) => {
  let deleted = false
  try {
    console.log(`Checking existence of path ${path}`)
    await access(path)
    console.log(`Deleting file from path ${path}`)
    await unlink(path)
    deleted = true
  }
  catch (e){
    console.error(`${e}`)
  }

  return deleted
}

export const writeEmptyFile = async (directory_path: string, file_path: string) => {
  let saved = false
  try {
    console.log(`Checking existence of path ${directory_path}`)
    await access(directory_path)
    console.log(`Saving file to path ${file_path}`)
    await writeFile(file_path, "")
    saved = true
  }
  catch (e){
    console.error(`${e}`)
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