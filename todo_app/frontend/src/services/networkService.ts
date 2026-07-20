import { useEffect, useState } from 'react'

const request = async (url: string, options: RequestInit = {}) => {
  const req = new Request(url, options)
  const res = await fetch(req)

  return res
}

// const waitResponse = (url: string) => {
//   useEffect(() => {
//     async function startWait() {
//       await request(url)
//     }

//     startWait();
//   }, [url])
// }

const fetchData = (url: string, readFunction: Function) : Object | null => {
  const [data, setData] = useState<Object | null>(null)
    useEffect(() => {
      if (url) {
        let ignore = false
        async function startFetch() {
          const res = await request(url)
          if (!ignore && res.ok) {
            const received = await readFunction(res)
            setData(received)
          }
          else
          {
            if (!res.ok){
              console.error(`Response unsuccessful with status ${res.status}`)
            }
            else{
              const ign = res.body ? res.text() : ""
              console.info(`Response ${ign} ignored as the request has been already fulfilled.`)
            }

          }
        }

        startFetch();

        return () => {
          ignore = true;
        };
      }
    }, [url])
    return data
}

const readJSON = (res: Response) => {
    return res.json()
}

const readText = async (res: Response) => {
    return res.text()
}

export default { fetchData, readJSON, readText }