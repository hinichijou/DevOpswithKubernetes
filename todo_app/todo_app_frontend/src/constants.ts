export const apiPath = () => process.env.API_PATH !== undefined ? process.env.API_PATH : ''
export const localApiUrl = () => process.env.BACKEND_SERVICE_URL !== undefined ?
  `${process.env.BACKEND_SERVICE_URL}/` :
  `http://localhost:3001/`
export const backendReadyURL = () => process.env.BACKEND_SERVICE_URL !== undefined &&
  process.env.BACKEND_READY_PATH !== undefined ?
  `${process.env.BACKEND_SERVICE_URL}${process.env.BACKEND_READY_PATH}` :
  `http://localhost:3001/ready`
export const publicApiUrl = () =>  process.env.NEXT_PUBLIC_API_URL !== undefined ?
  `${process.env.NEXT_PUBLIC_API_URL}${apiPath()}/` :
  `http://localhost:3001${apiPath()}/`
export const imageFetchUrl = () => process.env.IMAGE_FETCH_URL !== undefined ?
  `${process.env.IMAGE_FETCH_URL}` :
  'https://picsum.photos/1200'
export const dynamicAssetDirectory = () => process.env.DYN_ASSET_DIR_PATH !== undefined ?
  process.env.DYN_ASSET_DIR_PATH :
  './dynamic'
const imageDirectory = () => process.env.IMAGE_DIR_NAME !== undefined ?
  process.env.IMAGE_DIR_NAME :
  'images'
const imageFile = () => process.env.IMAGE_NAME !== undefined ?
  process.env.IMAGE_NAME :
  'image.jpg'

export const imagePathRootRelative = () => `${dynamicAssetDirectory()}/${imageFile()}`
export const imagePathInternal = () => `${imageDirectory()}/${imageFile()}`

const imageFetchNumber = () => process.env.IMAGE_FETCH_TIMEOUT !== undefined ?
  Number(process.env.IMAGE_FETCH_TIMEOUT) :
  undefined
//imageFetchTimeout is always at least 5 seconds since we are sending requests to external url
export const imageFetchTimeout = () => {
  const to = imageFetchNumber()
  if (to !== undefined && !isNaN(to) && to > 5000){
    return to
  }
  else{
    return 600000
  }
}