import styles from './AppBrokenBanner.module.css'

const AppBrokenBanner = () => {
  return <div className={styles.div}>
    <p className={styles.maintext}>
      System Failure
    </p>
    <p className={styles.subtext}>
      The todo app is currently unhealthy. Please wait for recovery.
    </p>
  </div>
}

export default AppBrokenBanner
