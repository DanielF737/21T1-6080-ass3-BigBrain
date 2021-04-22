/*
 For a given data structure of a question, produce another
 object that doesn't contain any important meta data (e.g. the answer)
 to return to a 'player'
*/
export const quizQuestionPublicReturn = question => {
  console.log('See question: ', question)
  let obj = {
    text: question.text,
    points: question.points,
    time: question.time,
    answers: question.answers,
    id: question.id,
    sols: question.solutions.length
  }
  if ('url' in question) {obj.url = question.url}
  return obj
}

/*
 For a given data structure of a question, get the IDs of
 the correct answers (minimum 1).
*/
export const quizQuestionGetCorrectAnswers = question => {
  return question.solutions
}

/*
 For a given data structure of a question, get the IDs of
 all of the answers, correct or incorrect.
*/
export const quizQuestionGetAnswers = question => {
  const a = []
  for (let i = 0; i<question.answers.length; i++) {
    a.push(question.answers[i].id)
  }
  return question.answers
}

/*
 For a given data structure of a question, get the duration
 of the question once it starts. (Seconds)
*/
export const quizQuestionGetDuration = question => {
  return question.time
}
