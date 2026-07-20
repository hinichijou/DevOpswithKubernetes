import { useContext } from 'react'

import './TodoList.css'
import TodoContext from '../../contexts/TodoContext.ts'
import TodoItem from '../TodoItem/TodoItem.tsx'

const TodoList = () => {
  const todos = useContext(TodoContext)
  const todoElements = []
  for (const todo of todos) {
    todoElements.push(<TodoItem key={todo.id} todo={todo} />)
  }
  return <div>
    {todoElements}
  </div>
}

export default TodoList
