import './TodoItem.css'
import { type Todo } from '@/src/types'

const TodoItem = ({todo}: {todo:Todo}) => (
  <div className='todoitemcontainer'>
    <span className='todoitem'></span>
    <div className='todoitem'>
      <div className='todoitemtext'>
        {todo.title}
      </div>
    </div>
  </div>
)

export default TodoItem
