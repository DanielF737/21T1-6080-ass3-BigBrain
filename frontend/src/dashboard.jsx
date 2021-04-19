import React, { useEffect } from 'react'
import { Link, useHistory } from 'react-router-dom'

import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardActions from '@material-ui/core/CardActions'
import Avatar from '@material-ui/core/Avatar'
import Grid from '@material-ui/core/Grid';

import { QuizContext } from './util/quiz'
// TODO fix this to use config file across all files
const api = 'http://localhost:5005/'

/**
 * Deletes the users auth token from the local storage, effectively signing them out
 */
function signOut () {
  if (localStorage.getItem('token')) {
    localStorage.removeItem('token')
  }
}

/**
 * Makes the API call to create a new quiz from the currently signed in user
 */
async function newQuiz () {
  const data = {
    name: 'New Empty Quiz'
  }

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/JSON',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(data)
  }

  await fetch(`${api}admin/quiz/new`, options)
}

/**
 * Makes the api call to the specified quiz
 * @param {Number} id The ID of the quiz to delete
 */
async function deleteQuiz (id) {
  const options = {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/JSON',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  }

  await fetch(`${api}admin/quiz/${id}`, options)
}

/**
 * Makes the API call to get the quizzes from the signed in user
 * @returns A list of all quiz objects
 */
async function getQuizzes () {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/JSON',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  }

  let r = await fetch(`${api}admin/quiz`, options)
  const ret = await r.json()
  const quizzes = []
  for (let i = 0; i < ret.quizzes.length; i++) {
    r = await fetch(`${api}admin/quiz/${ret.quizzes[i].id}`, options)
    const out = await r.json()
    out.id = ret.quizzes[i].id
    quizzes.push(out)
  }
  return quizzes
}

/**
 * Totals the time of an array of questions
 * @param {Array} questions An array of question objects to total the time of
 * @returns {Number} The time in seconds that it will take to complete quiz
 */
function quizTime (questions) {
  let total = 0
  for (let i = 0; i < questions.length; i++) {
    total += Number(questions[i].time)
  }
  return total
}

/**
 * Functional component containing a list of all quizes belonging to the current user
 * @returns Component containing list of cards representing each quiz
 */
function Quizzes () {
  const context = React.useContext(QuizContext)
  const [quizzes, setQuizzes] = context.quizzes
  const [quizCount, setQuizCount] = context.quizCount

  useEffect(() => {
    getQuizzes()
      .then(r => {
        setQuizzes(r)
      })
  }, [quizCount])

  return (
    <>
      {quizzes.map(i => (
        <div key={i.id}>
          {/* TODO fix the width */}
          <Card>
            <CardContent>
              <Grid container direction='row' alignItems='center'>
                <Avatar
                  variant='rounded'
                  display='inline'
                  alt='Quiz Thumbnail'
                  src={i.thumbnail}
                />
                <Typography variant='h4'>
                  {i.name}
                </Typography>
              </Grid>
              <Typography variant='body1'>
                Questions: {i.questions.length} | Time: {quizTime(i.questions)}s
              </Typography>
            </CardContent>
            <CardActions>
            <Button
              variant='contained'
              color='primary'
              component={Link} to={`/edit/${i.id}`}
            >
              Edit
            </Button>
            <Button
              variant='contained'
              color='primary'
              onClick={() => {
                deleteQuiz(i.id)
                setQuizCount(quizCount - 1)
              }}
            >
              Delete
            </Button>
            </CardActions>
          </Card>
          <br />
        </div>
      ))}
    </>
  )
}

/**
 * Displays dashboard of a signed in admin user or redirects to login if not signed in
 * @returns The dashboard element for a signed in user
 */
function Dashboard () {
  const history = useHistory()
  const context = React.useContext(QuizContext)
  const [quizCount, setQuizCount] = context.quizCount

  if (!localStorage.getItem('token')) {
    history.push('/login')
  }

  return (
    <>
      <br/>
      <Typography variant='h3' gutterBottom>
        Dashboard
      </Typography>
      <Quizzes />

      <Button
        variant='contained'
        color='primary'
        onClick={() => {
          newQuiz()
          setQuizCount(quizCount + 1)
        }}
      >
        New Quiz
      </Button>

      <Button
        variant='contained'
        color='primary'
        onClick={() => {
          signOut()
          history.push('/login')
        }}
      >
        Sign Out
      </Button>
    </>
  )
}

export default Dashboard
