import React, { useEffect, useRef } from 'react'
import { Link, useHistory, useParams } from 'react-router-dom'

import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Checkbox from '@material-ui/core/Checkbox'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import { makeStyles } from '@material-ui/core/styles'

import { CardActions } from '@material-ui/core'
const data = require('./config.json')
const port = data.BACKEND_PORT
const api = `http://localhost:${port}/`

// Custom styles
const useStyles = makeStyles((theme) => ({
  title: {
    fontSize: 35,
    width: 600,
    marginLeft: 10
  },
}))

/**
 * coverts image to base64 encoding
 * @param {*} file path to file
 * @returns dataURL for file
 */
function fileToDataUrl (file) {
  const validFileTypes = ['image/jpeg', 'image/png', 'image/jpg']
  const valid = validFileTypes.find(type => type === file.type)
  // Bad data, let's walk away.
  if (!valid) {
    throw Error('provided file is not a png, jpg or jpeg image.')
  }

  const reader = new FileReader()
  const dataUrlPromise = new Promise((resolve, reject) => {
    reader.onerror = reject
    reader.onload = () => resolve(reader.result)
  })
  reader.readAsDataURL(file)
  return dataUrlPromise
}

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
  // Checks if each of the URL parameters are present, then sets the accordingly
  if (text) { questions[index - 1].text = text.trim() }
  if (time) { questions[index - 1].time = time.trim() }
  if (points) { questions[index - 1].points = points.trim() }
  // Check if url is present, then checks the type and sets accordingly
  if (url && 'type' in url) {
    if ('type' in url && url.type === 'url') {
      questions[index - 1].url = {
        type: url.type,
        data: url.data.trim()
      }
    } else {
      questions[index - 1].url = url
    }
  } else {
    // If no url object was provided remove it from the question object
    delete questions[index - 1].url
  }

  // Make the api call
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

  // Sets the new text of the answer
  answers[answerIndex].text = text
  // Stores the answer ID in the solutions array if it is correct, removes it from the array if it has been changed to incorrect
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

  // Save the updated answers and solutions and make the api call
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

  // Exit out of the function if we are at the maximum number of answers
  if (answers.length >= 6) {
    return
  }

  // Create a new answer object, append it to the question object and make the api call
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
 * Removes an answer from the question
 * @param {*} quiz The quiz object the question is to be added to
 * @param {Number} id The ID of the quiz object
 * @param {Number} index The index of the question object in the quiz
 * @param {Number} answerId The id of the answer to remove
 */
async function removeAnswer (quiz, id, index, answerId) {
  const questions = quiz.questions
  const answers = quiz.questions[index].answers
  const solutions = quiz.questions[index].solutions

  // Exit if this means going below the minimum number of answers
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
  const { quizId, questionId } = useParams() // Gets the quiz and question Ids from the url params

  const [quiz, setQuiz] = React.useState({}) // The current quiz
  const [question, setQuestion] = React.useState({}) // The current question
  const [answerCount, setAnswerCount] = React.useState(0) // The count of answers (actually just a cheeky state variable we can use to update ui components)

  const [text, setText] = React.useState('') // Stores the text in the text textfield
  const [time, setTime] = React.useState('') // Stores the text in the time textfield
  const [points, setPoints] = React.useState('') //  Stores the text in the points textfield
  const [url, setUrl] = React.useState({}) // Stores the text in the URL textfield
  const [value, setValue] = React.useState('') // Stores the url to display on the question info page
  const [selectedFile, setSelectedFile] = React.useState('') // stores the selected file from the text input

  const initialRender = useRef(true)

  useEffect(() => {
    // Prevents from running on page load
    if (initialRender.current) {
      initialRender.current = false
    } else {
      // Whenever a new file is loaded, convert it to a base64 image and send it to the backend
      fileToDataUrl(selectedFile)
        .then(r => {
          const image = r
          setUrl({
            type: 'image',
            data: image
          })
          setValue('')
          updateQuestion(quiz, quizId, questionId, text, time, points, url)
          setAnswerCount(answerCount + 1)
        })
    }
  }, [selectedFile])

  const initialRenderB = useRef(true)
  // Get the current quiz object to get the question we are editing
  useEffect(() => {
    getQuiz(quizId)
      .then(r => {
        setQuiz(r)
        setQuestion(r.questions[questionId - 1])

        // Prevent this snippet from running on page load
        if (initialRenderB.current) {
          if (typeof r.questions[questionId - 1].url !== 'undefined') { setUrl(r.questions[questionId - 1].url) }
          initialRenderB.current = false
        }

        if (url.type === 'url') {
          setValue(r.questions[questionId - 1].url.data)
        }
        // Ensure valid quiz and question
        if ('error' in r) { history.push('/404') }
        if (questionId > r.questions.length) { history.push('/404') }
      })
  }, [answerCount])

  // Return to home if not logged in
  if (!localStorage.getItem('token')) {
    history.push('/login')
  }

  // All of the &&s are to prevent errors while waiting for promises to resolve
  return (
    <>
      <br/>
      <Grid container>
        {/* Display the question id  */}
        <Typography variant='h3' gutterBottom>
          Question {questionId}.
        </Typography>
        {/* Create a text field that displays the question text and allows the admin to change it */}
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
            // Send changes to the backend on blur
            updateQuestion(quiz, quizId, questionId, text, time, points, url)
            setAnswerCount(answerCount + 1)
          }}
        />}
      </Grid>
      {/* Display info about the question such as answer type and additional resource */}
      <Typography variant='body1'>
        Type: {'solutions' in question && question.solutions.length === 1 ? 'Single Answer' : 'Multiple Choice'}
      </Typography>
      {'url' in question &&
        <Typography variant='body1'>
          Additional Resource: {question.url.type === 'image' ? 'Image uploaded.' : `Video (${question.url.data})`}
        </Typography>
      }
      <br />
      {/* Text fields to display and change the question time and points */}
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
      {/* Allows the adding of a url to a video or uploading an image */}
      <Card>
        <CardContent>
          <Grid container direction='row'>
            {typeof url !== 'undefined' && 'type' in url && url.type === 'image'
              ? <TextField disabled label='Image Uploaded'/> // If an image has been uploaded, disable the text field
              : <TextField // If nothing has been uploaded or a video url has been added, display and allow changes
                label='Update Question URL'
                value={value}
                onChange={(e) => {
                  setValue(e.target.value)
                  setUrl({
                    type: 'url',
                    data: e.target.value
                  })
                }}
                onBlur={() => {
                  // Send changes to the backend
                  updateQuestion(quiz, quizId, questionId, text, time, points, url)
                  setAnswerCount(answerCount + 1)
                }}
              />
            }
          </Grid>
        </CardContent>
        <CardActions>
          <Button
            variant='contained'
            color='primary'
            onClick={(e) => {
              // Remove url object from question on backend, display change on frontend
              setUrl({})
              setValue('')
              updateQuestion(quiz, quizId, questionId, text, time, points, url)
              setAnswerCount(answerCount + 1)
            }}
          >
            Clear
          </Button>
          <Button
            variant='contained'
            color='primary'
            component='label'
          >
            Add Image
            {/* Handles the uploading of an image */}
            <input
              type='file'
              value = ''
              accept='image/png'
              hidden
              onChange={(e) => { setSelectedFile(e.target.files[0]) }}
            />
          </Button>
        </CardActions>
      </Card>
      <br />

      {/* Answer managment card */}
      <Card>
        {/* Build the table of answers */}
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
              {/* map the answers to table rows */}
              {'answers' in question && question.answers.map(i => (
                <TableRow key={i.id}>
                  <TableCell >
                    <TextField
                      label='Answer Text'
                      defaultValue={i.text}
                      onBlur={(e) => {
                        // Update the answers text on blur (whenever the textfield is unfocused)
                        updateAnswer(quiz, quizId, questionId - 1, i.id, e.target.value, question.solutions.includes(i.id))
                        setAnswerCount(answerCount + 1)
                      }}
                    />
                  </TableCell>
                  <TableCell >
                    <Checkbox
                      defaultChecked={question.solutions.includes(i.id)}
                      onChange={(e) => {
                        // Toggle whether the answer is a correct answer whenever the checkbox is checked or unchecked
                        updateAnswer(quiz, quizId, questionId - 1, i.id, i.text, e.target.checked)
                        setAnswerCount(answerCount - 1)
                      }}
                    />
                  </TableCell>
                  <TableCell >
                    <Button
                      variant='contained'
                      color='secondary'
                      onClick={(e) => {
                        // Allows the removal of an answer
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
              // Append a new answer to the end of the questions answer list
              addAnswer(quiz, quizId, questionId - 1)
              setAnswerCount(answerCount + 1)
            }}
          >
            Add Answer
          </Button>
        </CardActions>
      </Card>
      <br />
      {/* Navigates to the quiz managment page */}
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
