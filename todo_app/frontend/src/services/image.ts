import ns from './networkService.ts'

const checkImage = () => {
  const imageLinkObj = ns.fetchData('api/image', ns.readText)
  const imageLink = imageLinkObj !== null ? imageLinkObj as string : ""

  return imageLink
}

export default { checkImage }