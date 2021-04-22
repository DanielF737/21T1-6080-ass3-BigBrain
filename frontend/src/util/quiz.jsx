import React from 'react'
import PropTypes from 'prop-types'

export const QuizContext = React.createContext(null)

// Provider for the quizzes
export default function QuizProvider ({ children }) {
  const [quizzes, setQuizzes] = React.useState([])
  const [quizCount, setQuizCount] = React.useState(0)
  const [modalOpen, setModalOpen] = React.useState(false)
  const [modalBody, setModalBody] = React.useState(<></>)
  const [startId, setStartId] = React.useState(0)
  const [stopId, setStopId] = React.useState(0)

  const store = {
    quizzes: [quizzes, setQuizzes],
    quizCount: [quizCount, setQuizCount],
    modalOpen: [modalOpen, setModalOpen],
    modalBody: [modalBody, setModalBody],
    startId: [startId, setStartId],
    stopId: [stopId, setStopId]
  }

  return <QuizContext.Provider value={store}>{children}</QuizContext.Provider>
}

QuizProvider.propTypes = {
  children: PropTypes.node,
}
