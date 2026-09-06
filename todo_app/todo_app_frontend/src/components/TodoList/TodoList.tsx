import styles from './TodoList.module.css'
import TodoItem from '@/components/TodoItem/TodoItem'
import { fetchTodos } from '@/services/todos'
import ApiProvider from '@/contexts/ApiProvider'
import { publicApiUrl } from '@/src/constants'

async function TodoList () {
  const todos =  await fetchTodos()
  return (
      <div className={styles.div}>
        <ApiProvider publicApiUrl={publicApiUrl()} >
          {todos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} />
          ))}
        </ApiProvider>
      </div>
  )
}

export default TodoList
