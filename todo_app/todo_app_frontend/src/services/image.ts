import { mkdir } from 'fs'
import { stat } from 'fs/promises'

import ns from './networkService'
import { writeImage } from '@/src/utils/web_only_utils'
import { imageFetchUrl, dynamicAssetDirectory, imagePathRootRelative, imageFetchTimeout } from '../constants'

console.log(`Searching image from path ${imagePathRootRelative()}`)
//Can't rely on a global variable in server components so needs to be re-fetched on evaluation
const getImageStats = async () => await stat(imagePathRootRelative()).catch(() => null)
const getLastSaveTime = async () => (await getImageStats())?.mtime.getTime() ?? 0
const getImageLoaded = async () => await getLastSaveTime() !== 0

if(await getLastSaveTime() === 0){
  await new Promise<void>(res => mkdir(dynamicAssetDirectory(), {'recursive': true}, (err) => res()))
}
const getTimeSinceLastImageSave = async () => Date.now() - await getLastSaveTime()

const getAndWriteImage = async () => {
  const options = {
    headers: {
      'Cache-Control': 'no-store',
    },
  };

  console.log(`Fetching image from url ${imageFetchUrl()}`)

  const saved = await ns.makeRequest(imageFetchUrl(), writeImage, options)

  //If not saved end the image fetch loop. The image save path is most likely faulty and the image won't be written
  if(saved)
    imageFetch()
}

const imageFetch = async () => {
  setTimeout(getAndWriteImage, imageFetchTimeout() - await getTimeSinceLastImageSave())
}

imageFetch()

const checkImage = async () : Promise<boolean> => {
  return await getImageLoaded()
}

export default { checkImage }