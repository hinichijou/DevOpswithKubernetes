const request = async (url: string, options: RequestInit = {}) => {
  const req = new Request(url, options)
  const res = await fetch(req)

  return res
}

const makeRequest = async (url: string, readFunction: Function, options: RequestInit = {}) : Promise<Object | null> => {
  let data = null

  if (url) {
    let res = undefined
    try{
      res = await request(url, options)
    }
    catch (e){
      console.error(`${e}`)
    }

    if (res !== undefined && res.ok) {
      const received = await readFunction(res)
      data = received
    }
    else if (res && !res.ok)
    {
      console.error(`Response unsuccessful with status ${res.status}`)
    }
  }
  return data
}

export default { makeRequest }