import React from 'react'
import PropTypes from 'prop-types';

export const EditQuizContext = React.createContext(null)

export default function EditQuizProvider ({ children }) {
  const [quiz, setQuiz] = React.useState({})
  const [questionCount, setQuestionCount] = React.useState(0)
  const [question, setQuestion] = React.useState({})
  const [answerCount, setAnswerCount] = React.useState(0)

  const store = {
    quiz: [quiz, setQuiz],
    questionCount: [questionCount, setQuestionCount],
    question: [question, setQuestion],
    answerCount: [answerCount, setAnswerCount]
  }

  return <EditQuizContext.Provider value={store}>{children}</EditQuizContext.Provider>
}

EditQuizProvider.propTypes = {
  children: PropTypes.node,
}
