import { join } from 'path'

export const localApiUrl = `${process.env.NEXT_PUBLIC_BACKEND_SERVICE_URL}/api/`
export const publicApiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/`

const publicDirectory = process.env.IMAGEPATH !== undefined ? process.env.IMAGEPATH : ""
export const imageDirectory = join(publicDirectory, 'images')
export const imagePath = join(imageDirectory, 'image.jpg')

export const imageFetchTimeout = 600000