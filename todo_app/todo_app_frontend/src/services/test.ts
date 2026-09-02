import { writeEmptyFile, checkFileOrDirectoryExists, deleteFile } from '@/src/utils/web_only_utils'
import { dynamicAssetDirectory } from '../constants'

const unhealthyDirectoryPath = () => dynamicAssetDirectory()
const unhealthyFilePath = () => `${dynamicAssetDirectory()}/unhealthy`
// 4.2 add a flag that can be used to cause the application health check to fail
// Writes a file because after testing it seems that global variables aren't reliable outside of dev
export const toggleBreakApp = async () => {
  const exists = await checkFileOrDirectoryExists(unhealthyFilePath())
  if(exists){
    console.log("Delete unhealthy file")
    await deleteFile(unhealthyFilePath())
  }
  else {
    console.log("Create unhealthy file")
    await writeEmptyFile(unhealthyDirectoryPath(), unhealthyFilePath())
  }
}

export const getAppBroken = async () => {
  return await checkFileOrDirectoryExists(unhealthyFilePath(), false)
}
