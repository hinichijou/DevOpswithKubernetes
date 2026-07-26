export const apiPath = () => process.env.API_PATH !== undefined ? process.env.API_PATH : '/api'
export const localApiUrl = () => process.env.BACKEND_SERVICE_URL !== undefined ?
  `${process.env.BACKEND_SERVICE_URL}${apiPath()}/` :
  `http://localhost:3001${apiPath()}/`
export const publicApiUrl = () =>  process.env.NEXT_PUBLIC_API_URL !== undefined ?
  `${process.env.NEXT_PUBLIC_API_URL}${apiPath()}/` :
  `http://localhost:3001${apiPath()}/`
export const imageFetchUrl = () => process.env.IMAGE_FETCH_URL !== undefined ?
  `${process.env.IMAGE_FETCH_URL}` :
  'https://picsum.photos/1200'
//This shouldn't really be changed or need to be changed in nextjs but the task was to have all configuration defined by the deployment
const publicDirectory = () => process.env.PUBLIC_DIR_PATH !== undefined ?
  process.env.PUBLIC_DIR_PATH :
  './public'
const imageDirectory = () => process.env.IMAGE_DIR_NAME !== undefined ?
  process.env.IMAGE_DIR_NAME :
  'images'
const imageFile = () => process.env.IMAGE_NAME !== undefined ?
  process.env.IMAGE_NAME :
  'image.jpg'

export const imageDirectoryRootRelative = () => `${publicDirectory()}/${imageDirectory()}`
export const imagePathRootRelative = () => `${imageDirectoryRootRelative()}/${imageFile()}`
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