import { connection } from 'next/server'
//import Image from 'next/image'

import styles from './MainImage.module.css'
import imageService from '@/services/image'
import { imagePathInternal, publicUrl } from '@/src/constants'

async function MainImage () {
  //A way to avoid component prerendering so the image updates during runtime
  await connection()

  const available = await imageService.checkImage()

  const imagePath = publicUrl() + imagePathInternal()
  console.log(`Looking image from path ${imagePath}`)
  //Next Image component provides caching functionality if necessary
  return available ? <img src={`${imagePath}`} className={styles.img} alt='Random picture' /> : <></>
}

export default MainImage
