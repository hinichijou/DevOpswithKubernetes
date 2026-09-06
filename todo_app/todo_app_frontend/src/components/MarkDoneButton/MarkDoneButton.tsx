'use client'

import { useState, Dispatch, SetStateAction, useContext } from 'react'

import styles from './MarkDoneButton.module.css'
import { setStateWithTimeout, clearStateWithTimeout } from '@/src/utils/client_safe_utils'
import { setDone } from '@/services/todos'
import { ApiContext } from '@/contexts/ApiProvider'


const MarkDoneButton = ({id, uIState}: {id: string, uIState: [boolean, Dispatch<SetStateAction<boolean>>]}) => {
  const apiUrl = useContext(ApiContext)
  const [markDoneInProgress, setMarkDoneInProgress] = useState(false)

  const markDone = async () => {
    if (markDoneInProgress)
      return

    const timeout = setStateWithTimeout(setMarkDoneInProgress, true, false, 5000)

    //Change the UI state instantly for responsiveness
    const startUIState = !uIState[0]
    uIState[1](startUIState)
    const success = await setDone(apiUrl, id, !uIState[0])

    if (!success)
      uIState[1](!startUIState)

    clearStateWithTimeout<boolean>(setMarkDoneInProgress, false, timeout)
  }

  if (!uIState[0]) {
    return <button name='mark done' className={styles.button} onClick={markDone}>
        Mark Done
      </button>
  }

  return <div className={styles.text}>
    Done
  </div>
}

export default MarkDoneButton
