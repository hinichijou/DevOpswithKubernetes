import { mkdir } from 'fs'
import { stat } from 'fs/promises'

import ns from './networkService'
import { writeImage } from '@/src/utils/web_only_utils'
import { imagePath, imageDirectory, imageFetchTimeout } from '../constants'

const stats = await stat(imagePath).catch(() => null)
let lastSaveTime = stats !== null ? stats.mtime.getTime() : 0
let imageLoaded = lastSaveTime !== 0
if(lastSaveTime === 0){
  await new Promise<void>(res => mkdir(imageDirectory, (err) => res()))
}
const timeSinceLastImageSave = () => Date.now() - lastSaveTime

const getAndWriteImage = async () => {
  const options = {
    headers: {
      'Cache-Control': 'no-store',
    },
  };

  const saved = await ns.makeRequest('https://picsum.photos/1200', writeImage, options)

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
  setTimeout(getAndWriteImage, imageFetchTimeout - timeSinceLastImageSave())
}

imageFetch()

const checkImage = () : boolean => {
  return imageLoaded
}

export default { checkImage }