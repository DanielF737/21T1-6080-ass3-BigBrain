import React, { useEffect, useRef } from 'react'
import { Link, useHistory } from 'react-router-dom'

import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardActions from '@material-ui/core/CardActions'
import Avatar from '@material-ui/core/Avatar'
import Grid from '@material-ui/core/Grid'
import Modal from '@material-ui/core/Modal'
import IconButton from '@material-ui/core/IconButton'
import FileCopyIcon from '@material-ui/icons/FileCopy'
import { makeStyles } from '@material-ui/core/styles'

import { QuizContext } from './util/quiz'
// TODO fix this to use config file across all files
const api = 'http://localhost:5005/'

const useStyles = makeStyles((theme) => ({
  paper: {
    position: 'absolute',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
  },
  run: {
    position: 'absolute',
    width: 800,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
  }
}))

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

    if (out.active !== null) {
      r = await fetch(`${api}admin/session/${out.active}/status`, options)
      const res = await r.json()
      console.log(res)
      out.results = res.results
    }

    quizzes.push(out)
    console.log(out)
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
 * Makes the api call to start a quiz session, opens a modal contaning the
 * session id and a link to the play url
 * @param {Number} id the id of the quiz to start
 */
async function startQuiz (id) {
  let options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/JSON',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  }

  let r = await fetch(`${api}admin/quiz/${id}/start`, options)
  let ret = await r.json()

  options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/JSON',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  }

  r = await fetch(`${api}admin/quiz/${id}`, options)
  ret = await r.json()

  return (ret.active)
}

/**
 * Functional component containing a list of all quizes belonging to the current user
 * @returns Component containing list of cards representing each quiz
 */
function Quizzes () {
  const context = React.useContext(QuizContext)
  const classes = useStyles()
  const [quizzes, setQuizzes] = context.quizzes
  const [quizCount, setQuizCount] = context.quizCount
  const [modalOpen, setModalOpen] = context.modalOpen
  const [modalBody, setModalBody] = context.modalBody
  const [startId, setStartId] = context.startId

  const handleClose = () => {
    setModalOpen(false)
  }

  useEffect(() => {
    if (localStorage.getItem('token')) {
      getQuizzes()
        .then(r => {
          setQuizzes(r)
        })
    }
  }, [quizCount])

  const initialRender = useRef(true)

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false
    } else if (startId === -1) {
      // pass
    } else {
      startQuiz(startId)
        .then(r => {
          setModalBody(r)
        })
        .then(setStartId(-1))
    }
  }, [startId])

  return (
    <>
      {quizzes.map(i => (
        <div key={i.id}>
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
            {i.active === null
              ? <Button
                variant='contained'
                color='primary'
                name='start'
                onClick={() => {
                  setModalOpen(true)
                  setStartId(i.id)
                  setQuizCount(quizCount - 1)
                }}
              >
                Start Quiz
              </Button>
              : <Button
                variant='contained'
                color='primary'
                name='open'
                component={Link}
                to={`/run/${i.id}/${i.active}`}
              >
                Run Quiz
              </Button>
            }
            </CardActions>
          </Card>
          <br />
        </div>
      ))}
      <Modal
        open={modalOpen}
        onClose={handleClose}
      >
        <div className={classes.paper}>
          <Grid container direction='row' justify='center' alignItems='center' >
            <Typography alight='center' variant='h5'>Session ID: {modalBody}</Typography>
          </Grid>
          <Grid container direction='row' justify='center' alignItems='center' >
            <Typography data-test-target='link' variant='body1'>Copy session link:</Typography>
            <IconButton color='primary' name='copy' component='button' onClick={() => {
              navigator.clipboard.writeText(`${window.location.href}play/${modalBody}`)
              handleClose()
            }}>
              <FileCopyIcon/>
            </IconButton>
          </Grid>
        </div>
      </Modal>
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

  console.log(history)
  if (!localStorage.getItem('token')) {
    history.push('/login')
  }

  return (
    <>
      <br/>
      <Card>
        <CardContent>
          <Typography data-test-target='DashboardText' variant='h3' gutterBottom>
            Dashboard
          </Typography>
          <Quizzes />
        </CardContent>
        <CardActions>
          <Button
            variant='contained'
            color='primary'
            name='new'
            onClick={() => {
              newQuiz()
              setQuizCount(quizCount + 1)
            }}
          >
            New Quiz
          </Button>
        </CardActions>
      </Card>
    </>
  )
}

export default Dashboard
