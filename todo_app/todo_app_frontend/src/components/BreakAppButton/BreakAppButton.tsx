'use client'

import { useRouter } from 'next/navigation'

import styles from './BreakAppButton.module.css'
import { toggleBreak } from './BreakAppServerAction'


const BreakAppButton = () => {
  const router = useRouter()

  const breakApp = async () => {
    await toggleBreak()
    router.refresh()
  }

  return <div className={styles.div}>
    <button name='break app' className={styles.button} onClick={breakApp}>
      Break the app
    </button>
  </div>
}

export default BreakAppButton
