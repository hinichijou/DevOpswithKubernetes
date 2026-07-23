import { Dispatch, SetStateAction } from "react"

export const setStateWithTimeout = <T> (setState: Dispatch<SetStateAction<T>>, startValue: T, endValue: T, timeout: number): NodeJS.Timeout => {
  setState(startValue)

  return setTimeout(() => {
    setState(endValue)
  }, timeout)
}

export const clearStateWithTimeout = <T> (setState: Dispatch<SetStateAction<T>>, clearValue: T, timeout: NodeJS.Timeout) => {
  setState(clearValue)
  clearTimeout(timeout)
}

export const createPostOptions = (bodyObj: object) => {
  return {method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bodyObj)}
}

export const readJSONResponse = (res: Response) => {
  return res.json()
}

export const readTextResponse = async (res: Response) => {
  return res.text()
}