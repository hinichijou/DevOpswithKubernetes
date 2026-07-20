import { useState, type ChangeEvent } from 'react'

import './InputField.css'

const InputField = () => {
   const [input, setInput] = useState<string>("")
   const [style, setStyle] = useState<string>("input field normal")

  const onInputChange = (e: ChangeEvent<HTMLInputElement >) => {
    let newInput = e.currentTarget.value

    if (newInput.length > 140) {
      newInput = newInput.slice(0, 140)
      setStyle("input field overlimit")
    }
    else if (newInput.length === 140) {
      setStyle("input field overlimit")
    }
    else{
      setStyle("input field normal")
    }

    setInput(newInput)
  }

  return (
    <input
        name="todo_input"
        type="text"
        className={style}
        value = {input}
        placeholder="Enter a new todo (max 140 characters)"
        maxLength={140}
        onChange={onInputChange}
    />
)}

export default InputField
