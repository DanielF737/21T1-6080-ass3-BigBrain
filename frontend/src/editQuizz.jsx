import React, { useEffect } from 'react'
import { Link, useHistory, useParams } from 'react-router-dom'

import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardActions from '@material-ui/core/CardActions'
import Avatar from '@material-ui/core/Avatar'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import { makeStyles } from '@material-ui/core/styles'

import { EditQuizContext } from './util/editQuiz'
const data = require('./config.json')
const port = data.BACKEND_PORT
const api = `http://localhost:${port}/`

// Custom styles
const useStyles = makeStyles((theme) => ({
  title: {
    fontSize: 40,
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

/**
 * Adds a valid new question to a quiz
 * @param {*} quiz The quiz object the question is to be added to
 * @param {*} id The ID of the quiz object
 */
async function newQuestion (quiz, id) {
  // Create an empty question object with placeholder values
  const newQ = {
    id: quiz.questions.length + 1,
    text: 'New Question',
    time: 10,
    points: 10,
    answers: [
      {
        id: 0,
        text: 'Correct'
      },
      {
        id: 1,
        text: 'Incorrect'
      }
    ],
    solutions: [0]
  }

  // Append the question to the quiz object
  const questions = quiz.questions
  questions.push(newQ)

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
 * Removes a question from the quiz
 * @param {*} quiz The quiz object the question is being removed from
 * @param {*} id The ID of the quiz
 * @param {*} index The index of the question to be removed
 */
async function deleteQuestion (quiz, id, index) {
  const questions = quiz.questions
  questions.splice(index, 1)
  let count = 1

  // Reorder question Ids
  for (let i = 0; i < questions.length; i++) {
    questions[i].id = count
    count++
  }
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
 * Updates the name of the quiz object
 * @param {*} quiz The quiz object the question is being removed from
 * @param {*} id The ID of the quiz
 * @param {*} name The new name of the quiz
 */
async function updateName (quiz, id, name) {
  const data = {
    name: name
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
 * Updates the thumbnail of the quiz object
 * @param {*} quiz The quiz object the question is being removed from
 * @param {*} id The ID of the quiz
 * @param {*} image the path to the image
 */
async function updateThumb (quiz, id, image) {
  const img = await fileToDataUrl(image) // Convert the thumbnail to a data string
  const data = {
    thumbnail: img
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
 * Returns an editable quiz object, allowing changing of name,
 * thumbnail, and editing of questions
 * @returns Editable quiz object
 */
function Quiz () {
  const { id } = useParams() // Get the id from the URL paramater
  const context = React.useContext(EditQuizContext)
  const [quiz, setQuiz] = context.quiz // Stores the current quiz
  const [questionCount, setQuestionCount] = context.questionCount // Stores the current question
  return (
    <>
      {/* For each question, display a card */}
      {'questions' in quiz && quiz.questions.map(i => (
       <div key={i.id}>
        <Card >
          <CardContent>
            {/* Show info such as question text, type (single/multiple choice), and addtional resource if avalaible (video or image) */}
            <Typography variant='h5'>
              {i.id}. {i.text}
            </Typography>
            <Typography variant='body1'>
              Type: {i.solutions.length === 1 ? 'Single Answer' : 'Multiple Choice'} | Answers: {i.answers.length} | Time: {i.time}s | Points: {i.points}
            </Typography>
            {'url' in i &&
              <Typography variant='body1'>
                Additional Resource: {i.url.type === 'image' ? 'Image uploaded.' : `Video (${i.url.data})`}
              </Typography>
            }
          </CardContent>
          <CardActions>
            {/* Button to edit the selected question */}
          <Button
            variant='contained'
            color='primary'
            component={Link} to={`/edit/${id}/question/${i.id}`}
          >
            Edit
          </Button>
          {/* Button to delete the selected question */}
          <Button
            variant='contained'
            color='primary'
            onClick={() => {
              deleteQuestion(quiz, id, i.id - 1)
              setQuestionCount(questionCount + 1)
            }}
          >
            Delete
          </Button>
          <Button
            visibility='hidden'
            onClick={() => {
              setQuiz(quiz)
            }}
          />
          </CardActions>
        </Card>
        <br />
       </div>
      ))}
    </>
  )
}

/**
 * Displays the edit quiz screen for the quiz specified in the URL paramater
 * @returns The edit quiz screen for a specified quiz
 */
function EditQuiz () {
  const history = useHistory()
  const classes = useStyles()
  const context = React.useContext(EditQuizContext)
  const [quiz, setQuiz] = context.quiz // stores the current quiz
  const [questionCount, setQuestionCount] = context.questionCount // stores the number of questions
  const [updated, setUpdated] = React.useState('') // stores changes to the quiz name

  // Re-render whenever the number of questions changes
  const { id } = useParams()
  useEffect(() => {
    getQuiz(id)
      .then(r => {
        setQuiz(r)

        if ('error' in r) {
          history.push('/404')
        }
      })
  }, [questionCount])

  // redirect to home if no auth token
  if (!localStorage.getItem('token')) {
    history.push('/login')
  }

  return (
    <>
      <Card>
        <CardContent>
          <br/>
          <Grid container direction='row' alignItems='center'>
            {/* Show the quiz thumbnail */}
            <Avatar
              aria-text= 'Quiz thumbnail'
              variant='rounded'
              display='inline'
              alt='Quiz Thumbnail'
              src={quiz.thumbnail}
            />
            {/* Display and allow changing of the quiz name */}
            {'name' in quiz && <TextField
              defaultValue={quiz.name}
              InputProps={{
                classes: {
                  input: classes.title,
                },
              }}
              onChange={(e) => {
                setUpdated(e.target.value)
              }}
              onBlur={() => {
                updateName(quiz, id, updated)
                setQuestionCount(questionCount + 1)
              }}
            />}
          </Grid>
          <br />
          <Quiz/>
        </CardContent>
        <CardActions>
          {/* Buttons to update the thumbnail, add a new queston, and return to the menu */}
          <Button
            variant='contained'
            color='primary'
            component='label'
          >
            Update Thumbnail
            <input
              type='file'
              accept='image/png'
              hidden
              onChange={(e) => {
                updateThumb(quiz, id, e.target.files[0])
                setQuestionCount(questionCount - 1)
              }}
            />
          </Button>
          <Button
            variant='contained'
            color='primary'
            onClick={() => {
              newQuestion(quiz, id)
              setQuestionCount(questionCount + 1)
            }}
          >
            Add Question
          </Button>

          <Button
            variant='contained'
            color='primary'
            component={Link} to='/'
          >
            Back
          </Button>
        </CardActions>
      </Card>
    </>
  )
}

export default EditQuiz
