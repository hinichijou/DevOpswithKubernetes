'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import styles from './InputRow.module.css'
import styles_InputField from '@/components/InputField/InputField.module.css'
import InputField from '@/components/InputField/InputField'
import InputButton from '@/components/InputButton/InputButton'
import { setStateWithTimeout, clearStateWithTimeout } from '@/src/utils/client_safe_utils'
import { createTodo } from '@/services/todos'

const InputRow = ({apiUrl}: {apiUrl: string}) => {
  const router = useRouter()

  //useActionState could be useful here as well
  const [addTodoInProgress, setAddTodoInProgress] = useState(false)
  const inputState =  useState<string>("")
  const styleState = useState<string>(`${styles_InputField.field}`)

  const submitTodo = async (e: React.SubmitEvent) => {
    e.preventDefault()

    if (addTodoInProgress)
      return

    const form = e.target
    const formData = new FormData(form)
    const todoValue = formData.get("todo_input")

    const timeout = setStateWithTimeout(setAddTodoInProgress, true, false, 5000)

    if (todoValue !== null){
      const newTodo = await createTodo(apiUrl, {title: todoValue.toString()})
      if (newTodo !== null) {
        inputState[1]("")
        styleState[1](`${styles_InputField.field}`)
        router.refresh()
      }
    }

    clearStateWithTimeout<boolean>(setAddTodoInProgress, false, timeout)
  }

  return <div>
    <form onSubmit={submitTodo}>
      <p className={styles.input}>
        <InputField states={Array(inputState, styleState)}/>
        <InputButton/>
      </p>
    </form>
  </div>
}

export default InputRow
