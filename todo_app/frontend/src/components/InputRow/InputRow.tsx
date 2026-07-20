import './InputRow.css'
import InputField from '../InputField/InputField'
import InputButton from '../InputButton/InputButton'

const InputRow = () => (
    <div>
      <form method="post">
        <p className="input">
          <InputField/>
          <InputButton/>
        </p>
      </form>
    </div>
)

export default InputRow
