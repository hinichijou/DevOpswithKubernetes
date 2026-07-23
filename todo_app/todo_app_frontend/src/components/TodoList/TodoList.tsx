import './TodoList.css'
import TodoItem from '@/components/TodoItem/TodoItem'
import { fetchTodos } from '@/services/todos'

async function TodoList () {
  const todos =  await fetchTodos()
  return (
    <div>
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </div>
  )
}

export default TodoList
