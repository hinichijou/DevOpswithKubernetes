import { mkdir } from 'fs'
import { stat } from 'fs/promises'

import ns from './networkService'
import { writeImage } from '@/src/utils/web_only_utils'
import { imageFetchUrl, imageDirectoryRootRelative, imagePathRootRelative, imageFetchTimeout } from '../constants'

console.log(`Searching image from path ${imagePathRootRelative()}`)
const stats = await stat(imagePathRootRelative()).catch(() => null)
let lastSaveTime = stats !== null ? stats.mtime.getTime() : 0
let imageLoaded = lastSaveTime !== 0
if(lastSaveTime === 0){
  await new Promise<void>(res => mkdir(imageDirectoryRootRelative(), {'recursive': true}, (err) => res()))
}
const timeSinceLastImageSave = () => Date.now() - lastSaveTime

const getAndWriteImage = async () => {
  const options = {
    headers: {
      'Cache-Control': 'no-store',
    },
  };

  console.log(`Fetching image from url ${imageFetchUrl()}`)

  const saved = await ns.makeRequest(imageFetchUrl(), writeImage, options)

  if(saved){
    lastSaveTime = Date.now()
    imageLoaded = true
    imageFetch()
  }
  else{
    //end the image fetch loop. The image save path is most likely faulty and the image won't be written
  }
}

const imageFetch = () => {
  setTimeout(getAndWriteImage, imageFetchTimeout() - timeSinceLastImageSave())
}

imageFetch()

const checkImage = () : boolean => {
  return imageLoaded
}

export default { checkImage }