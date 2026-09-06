import MainImage from '@/components/MainImage/MainImage'
import InputRow from '@/components/InputRow/InputRow'
import TodoList from '@/components/TodoList/TodoList'
import BreakAppButton from '@/components/BreakAppButton/BreakAppButton'
import AppBrokenBanner from '@/src/components/AppBrokenBanner/AppBrokenBanner'
import { getAppBroken } from '@/services/test'
import ApiProvider from '@/contexts/ApiProvider'
import { publicApiUrl } from '@/src/constants'

async function App () {
  const healthy = !await getAppBroken()

  if (healthy) {
    return (
      <>
        <h1>Todo app</h1>
        <div>
          <MainImage/>
          <ApiProvider publicApiUrl={publicApiUrl()} >
            <InputRow/>
          </ApiProvider>
        </div>
        <h2>Todos</h2>
        <div>
          <TodoList/>
        </div>
        <div>
          <BreakAppButton/>
        </div>
      </>
    )
  }
  else {
    return (
      <>
        <AppBrokenBanner/>
      </>
    )
  }
}

export default App
