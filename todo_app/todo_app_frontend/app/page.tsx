import MainImage from '@/components/MainImage/MainImage'
import InputRow from '@/components/InputRow/InputRow'
import TodoList from '@/components/TodoList/TodoList'

const App = () => {
  return (
    <>
      <h1>Todo app</h1>
      <div>
        <MainImage/>
        <InputRow/>
      </div>
      <h2>Todos</h2>
      <div>
        <TodoList/>
      </div>
    </>
  )
}

export default App
