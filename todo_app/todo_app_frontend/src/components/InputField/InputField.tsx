'use client'

import { Dispatch, SetStateAction, useState, type ChangeEvent } from 'react'

import styles from './InputField.module.css'

type InputFieldProps = {
  states:  Array<[string, Dispatch<SetStateAction<string>>]>
};

const InputField = ({states}:InputFieldProps) => {
  const [input, setInput] = states[0]
  const [style, setStyle] = states[1]

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    let newInput = e.currentTarget.value

    if (newInput.length > 140) {
      newInput = newInput.slice(0, 140)
      setStyle(`${styles.overlimit}`)
    }
    else if (newInput.length === 140) {
      setStyle(`${styles.field} ${styles.overlimit}`)
    }
    else if (newInput.length >= 1){
      setStyle(`${styles.field} ${styles.valid}`)
    }
    else{
      setStyle(`${styles.field}`)
    }

    setInput(newInput)
  }

  return (
    <input
        name="todo_input"
        type="text"
        className={style}
        value = {input}
        placeholder="Enter a new todo (1-140 characters)"
        required={true}
        minLength={1}
        maxLength={140}
        onChange={onInputChange}
    />
)}

export default InputField
