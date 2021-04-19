import React, { useEffect } from 'react'
import { Link, useHistory, useParams } from 'react-router-dom'

import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Checkbox from '@material-ui/core/Checkbox';
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import { makeStyles } from '@material-ui/core/styles'

import { EditQuizContext } from './util/editQuiz'
import { CardActions } from '@material-ui/core'
const api = 'http://localhost:5005/'

const useStyles = makeStyles((theme) => ({
  title: {
    fontSize: 35,
    width: 600,
    marginLeft: 10
  },
}))

/**
 * Multipurpose function for updating simple attributes of question object
 * @param {*} quiz The quiz object the question is to be added to
 * @param {*} id The ID of the quiz object
 * @param {*} index The index of the question object in the quiz
 * @param {*} text The New question text
 * @param {*} time The new question time
 * @param {*} points The New question point value
 * @param {*} url The New question supplementary url
 */
async function updateQuestion (quiz, id, index, text, time, points, url) {
  const questions = quiz.questions
  if (text) { questions[index - 1].text = text.trim() }
  if (time) { questions[index - 1].time = time.trim() }
  if (points) { questions[index - 1].points = points.trim() }
  if (url) { questions[index - 1].url = url.trim() }

  const data = {
    questions: questions
  }

  const options = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/JSON',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(data)
  }

  await fetch(`${api}admin/quiz/${id}`, options)
}

/**
 * Updates the text and correct-ness of an answer in the current question
 * @param {*} quiz The quiz object the question is to be added to
 * @param {Number} id The ID of the quiz object
 * @param {Number} index The index of the question object in the quiz
 * @param {Number} answerIndex The index of the answer being modified
 * @param {String} text The updated answer text
 * @param {Boolean} correct Boolean reflecting whether the new answer is a correct solution
 */
async function updateAnswer (quiz, id, index, answerIndex, text, correct) {
  const questions = quiz.questions
  const answers = quiz.questions[index].answers
  const solutions = quiz.questions[index].solutions

  answers[answerIndex].text = text
  if (correct === true) {
    if (!solutions.includes(answerIndex)) {
      solutions.push(answerIndex)
    }
  } else {
    if (solutions.includes(answerIndex)) {
      const i = solutions.indexOf(answerIndex)
      solutions.splice(i, 1)
    }
  }

  questions[index].answers = answers
  questions[index].solutions = solutions

  const data = {
    questions: questions
  }

  const options = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/JSON',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(data)
  }

  await fetch(`${api}admin/quiz/${id}`, options)
}

/**
 * Adds a new answer to the question
 * @param {*} quiz The quiz object the question is to be added to
 * @param {Number} id The ID of the quiz object
 * @param {Number} index The index of the question object in the quiz
 */
async function addAnswer (quiz, id, index) {
  const questions = quiz.questions
  const answers = quiz.questions[index].answers

  if (answers.length >= 6) {
    return
  }

  const newAnswer = {
    id: answers.length,
    text: 'New answer'
  }

  answers.push(newAnswer)
  questions.answers = answers

  const data = {
    questions: questions
  }

  const options = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/JSON',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(data)
  }

  await fetch(`${api}admin/quiz/${id}`, options)
}

/**
 * Adds a new answer to the question
 * @param {*} quiz The quiz object the question is to be added to
 * @param {Number} id The ID of the quiz object
 * @param {Number} index The index of the question object in the quiz
 * @param {Number} answerId The id of the answer to remove
 */
async function removeAnswer (quiz, id, index, answerId) {
  const questions = quiz.questions
  const answers = quiz.questions[index].answers
  const solutions = quiz.questions[index].solutions

  if (answers.length <= 2) {
    return
  }

  // Remove answer from answers and solution
  answers.splice(answerId, 1)
  if (solutions.includes(answerId)) {
    const i = solutions.indexOf(answerId)
    solutions.splice(i, 1)
  }

  // reorder index of answers
  for (let count = 0; count < answers.length; count++) {
    answers[count].id = count
  }

  questions.answers = answers

  const data = {
    questions: questions
  }

  const options = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/JSON',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(data)
  }

  await fetch(`${api}admin/quiz/${id}`, options)
}

/**
 * Fetches the current quiz object
 * @returns Quiz object
 */
async function getQuiz (id) {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/JSON',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  }

  const r = await fetch(`${api}admin/quiz/${id}`, options)
  const out = await r.json()
  return (out)
}

function EditQuestion () {
  const history = useHistory()
  const classes = useStyles()
  const { quizId, questionId } = useParams()

  const context = React.useContext(EditQuizContext)
  const [quiz, setQuiz] = context.quiz
  const [question, setQuestion] = context.question
  const [answerCount, setAnswerCount] = context.answerCount
  const [text, setText] = React.useState('')
  const [time, setTime] = React.useState('')
  const [points, setPoints] = React.useState('')
  const [url, setUrl] = React.useState('')

  useEffect(() => {
    getQuiz(quizId)
      .then(r => {
        setQuiz(r)
        setQuestion(r.questions[questionId - 1])
        // Ensure valid quiz and question
        if ('error' in r) { history.push('/404') }
        if (questionId > r.questions.length) { history.push('/404') }
      })
  }, [answerCount])

  // Keeping the linter happy while developing this module

  if (!localStorage.getItem('token')) {
    history.push('/login')
  }

  return (
    <>
      <br/>
      <Grid container>
        <Typography variant='h3' gutterBottom>
          Question {questionId}.
        </Typography>
        {'text' in question && <TextField
          InputProps={{
            classes: {
              input: classes.title,
            },
          }}
          defaultValue={question.text}
          onChange={(e) => {
            setText(e.target.value)
          }}
          onBlur={() => {
            updateQuestion(quiz, quizId, questionId, text, time, points, url)
            setAnswerCount(answerCount + 1)
          }}
        />}
      </Grid>
      {'solutions' in question &&
        <Typography variant='body1'>
          Type: {question.solutions.length === 1 ? 'Single Answer' : 'Multiple Choice'}
        </Typography>
      }
      {'url' in question &&
        <Typography variant='body1'>
          URL: {question.url}
        </Typography>
      }
      <br />
      {'text' in question &&
        <>
          <Card>
            <CardContent>
              <Grid container direction='row'>
                <TextField
                  label='Update Question Time (s)'
                  defaultValue={question.time}
                  type='number'
                  onChange={(e) => {
                    setTime(e.target.value)
                  }}
                  onBlur={() => {
                    updateQuestion(quiz, quizId, questionId, text, time, points, url)
                    setAnswerCount(answerCount + 1)
                  }}
                />
              </Grid>
            </CardContent>
          </Card>
          <br />
          <Card>
            <CardContent>
              <Grid container direction='row'>
                <TextField
                  label='Update Question Points'
                  defaultValue={question.points}
                  type='number'
                  onChange={(e) => {
                    setPoints(e.target.value)
                  }}
                  onBlur={() => {
                    updateQuestion(quiz, quizId, questionId, text, time, points, url)
                    setAnswerCount(answerCount + 1)
                  }}
                />
              </Grid>
            </CardContent>
          </Card>
          <br />
        </>
      }
      {/* TODO add way to delete URL */}
      <Card>
        <CardContent>
          <Grid container direction='row'>
            <TextField
              label='Update Question URL'
              onChange={(e) => {
                setUrl(e.target.value)
              }}
              onBlur={() => {
                updateQuestion(quiz, quizId, questionId, text, time, points, url)
                setAnswerCount(answerCount + 1)
              }}
            />
          </Grid>
        </CardContent>
      </Card>
      <br />

      <Card>
        <TableContainer component={CardContent}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell >Answer</TableCell>
                <TableCell >Correct</TableCell>
                <TableCell >Delete?</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* TODO add logic to update question text on blur and add/remove solution on switch */}
              {'answers' in question && question.answers.map(i => (
                <TableRow key={i.id}>
                  <TableCell >
                    <TextField
                      label='Answer Text'
                      defaultValue={i.text}
                      onBlur={(e) => {
                        updateAnswer(quiz, quizId, questionId - 1, i.id, e.target.value, question.solutions.includes(i.id))
                        setAnswerCount(answerCount + 1)
                      }}
                    />
                  </TableCell>
                  <TableCell >
                    <Checkbox
                      defaultChecked={question.solutions.includes(i.id)}
                      onChange={(e) => {
                        updateAnswer(quiz, quizId, questionId - 1, i.id, i.text, e.target.checked)
                        setAnswerCount(answerCount - 1)
                      }}
                    />
                  </TableCell>
                  <TableCell >
                    {/* TODO make sure deletes reflect correctly on page */}
                    <Button
                      variant='contained'
                      color='secondary'
                      onClick={(e) => {
                        removeAnswer(quiz, quizId, questionId - 1, i.id)
                        setAnswerCount(answerCount - 1)
                      }}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <CardActions>
          <Button
            variant='contained'
            color='primary'
            onClick={() => {
              addAnswer(quiz, quizId, questionId - 1)
              setAnswerCount(answerCount + 1)
            }}
          >
            Add Answer
          </Button>
        </CardActions>
      </Card>
      <br />
      <Button
        variant='contained'
        color='primary'
        component={Link} to={`/edit/${quizId}`}
      >
        Back
      </Button>
    </>
  )
}

export default EditQuestion
