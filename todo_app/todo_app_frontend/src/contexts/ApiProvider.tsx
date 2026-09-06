'use client'

import { createContext } from 'react'

export const ApiContext = createContext('')

//Since this is a client component we need to pass publicApiUrl from a server component
export default function ApiProvider({ publicApiUrl, children, }:
  { publicApiUrl: string, children: React.ReactNode }) {
  //If requiring object as value: needs to be wrapped to useMemo. See https://react.dev/reference/react/useContext#optimizing-re-renders-when-passing-objects-and-functions
  return <ApiContext.Provider value={publicApiUrl}>{children}</ApiContext.Provider>
}