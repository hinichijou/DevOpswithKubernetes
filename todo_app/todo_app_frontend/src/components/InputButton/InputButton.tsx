import styles from './InputButton.module.css'

const InputButton = () => {
  return <input
      name='todo_submit'
      type='submit'
      className={styles.button}
      value='Send'
  />
}

export default InputButton
