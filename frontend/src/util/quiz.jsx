import React from 'react'
import PropTypes from 'prop-types';

export const QuizContext = React.createContext(null)

export default function QuizProvider ({ children }) {
  const [quizzes, setQuizzes] = React.useState([])
  const [quizCount, setQuizCount] = React.useState(0)

  const store = {
    quizzes: [quizzes, setQuizzes],
    quizCount: [quizCount, setQuizCount]
  }

  return <QuizContext.Provider value={store}>{children}</QuizContext.Provider>
}

QuizProvider.propTypes = {
  children: PropTypes.node,
}
