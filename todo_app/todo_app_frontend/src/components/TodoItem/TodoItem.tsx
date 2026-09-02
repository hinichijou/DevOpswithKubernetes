import styles from './TodoItem.module.css'
import styles_TodoList from '@/components/TodoList/TodoList.module.css'
import { type Todo } from '@/src/types'

const TodoItem = ({todo}: {todo:Todo}) => (
  <div className={styles.todoitemcontainer}>
    <span className={styles.colorstrip}></span>
    <div className={styles.todoitem}>
      <div className={styles.todoitemtext}>
        {todo.title}
      </div>
    </div>
  </div>
)

export default TodoItem
