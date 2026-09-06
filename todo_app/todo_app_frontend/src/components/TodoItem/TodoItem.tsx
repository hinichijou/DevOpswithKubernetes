'use client'

import { useState } from 'react'

import styles from './TodoItem.module.css'
import { type Todo } from '@/src/types'
import MarkDoneButton from '@/components/MarkDoneButton/MarkDoneButton'

const TodoItem = ({todo}: {todo:Todo}) => {
  const uIState = useState(todo.done)

  return <div className={styles.todoitemcontainer}>
    <span className={uIState[0] ? styles.colorstrip_done : styles.colorstrip_undone}></span>
    <div className={uIState[0] ? styles.todoitem_done : styles.todoitem_undone}>
      <div className={uIState[0] ? styles.todoitemtext_done : styles.todoitemtext}>
        {todo.title}
      </div>
      <div className={styles.markdonecontainer}>
        <MarkDoneButton id={todo.id} uIState={uIState} />
      </div>
    </div>
  </div>
}

export default TodoItem
