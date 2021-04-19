import React from 'react'
import { useHistory, useParams } from 'react-router-dom'

function EditQuiz (props) {
  const history = useHistory()
  const { id } = useParams()

  if (!localStorage.getItem('token')) {
    history.push('/login')
  }

  return (
    <>
      <h1>Edit Quiz ID:{id}</h1>
    </>
  )
}

export default EditQuiz
