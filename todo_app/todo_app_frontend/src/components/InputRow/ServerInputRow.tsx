//The only purpose of this component is to fetch the request url defined by a runtime environment variable
//for the client object making the post request. The only seems to be unpleasant solutions for runtime
//client side environment variables in next.js
import { publicApiUrl } from '@/src/constants'
import InputRow from '@/components/InputRow/InputRow'

const ServerInputRow = () => (
  <InputRow apiUrl={publicApiUrl()} />
)

export default ServerInputRow