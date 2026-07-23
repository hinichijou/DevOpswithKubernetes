import { connection } from 'next/server'
//import Image from 'next/image'

import './MainImage.css'
import imageService from '@/services/image'

async function MainImage () {
  //A way to avoid component prerendering so the image updates during runtime
  await connection()

  const available = imageService.checkImage()
  //Next Image component provides caching functionality if necessary
  return available ? <img src="/images/image.jpg" alt='Random picture' /> : <></>
}

export default MainImage
