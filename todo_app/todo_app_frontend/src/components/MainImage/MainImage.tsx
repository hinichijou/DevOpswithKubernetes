import { connection } from 'next/server'
//import Image from 'next/image'

import './MainImage.css'
import imageService from '@/services/image'
import { imagePathInternal } from '@/src/constants'

async function MainImage () {
  //A way to avoid component prerendering so the image updates during runtime
  await connection()

  const available = imageService.checkImage()

  const imagePath = imagePathInternal()
  console.log(`Looking image from path ${imagePath}`)
  //Next Image component provides caching functionality if necessary
  return available ? <img src={`${imagePath}`} alt='Random picture' /> : <></>
}

export default MainImage
