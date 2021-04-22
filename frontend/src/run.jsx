import React, { useEffect } from 'react'
import { Link, useParams, useHistory } from 'react-router-dom'
import ReactPlayer from 'react-player'

import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardActions from '@material-ui/core/CardActions'
import Modal from '@material-ui/core/Modal'
import IconButton from '@material-ui/core/IconButton'
import ExitToAppIcon from '@material-ui/icons/ExitToApp'
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Chip from '@material-ui/core/Chip'

const data = require('./config.json')
const port = data.BACKEND_PORT
const api = `http://localhost:${port}/`

// Custom styles
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
  names: {
    marginLeft: '10px',
    marginRight: '10px'
  },
  image: {
    maxWidth: '500px',
    maxHeight: '500px'
  }
}))

/**
 * Makes the api call to stop the session of a quiz specified by the parameters
 * @param {*} id the id of the quiz we are stopping
 */
async function stopQuiz (id) {
  // Make the api call
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/JSON',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  }
  await fetch(`${api}admin/quiz/${id}/end`, options)
}

/**
 * Makes the api call to advance the current quiz
 * @param {*} id id of quiz we are advancing
 */
async function advanceQuiz (id) {
  // Make the api call
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/JSON',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  }

  await fetch(`${api}admin/quiz/${id}/advance`, options)
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
 * Makes an api call to get the status of the specified quiz session
 * @param {*} id session id of the quiz whos status we want
 * @returns results object
 */
async function getResults (id) {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/JSON',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  }

  const r = await fetch(`${api}admin/session/${id}/status`, options)
  const ret = await r.json()

  // If the object contains the results return them (error trapping code)
  if ('results' in ret) {
    return ret.results
  } else {
    return {}
  }
}

/**
 * Component that manages the control panel for running a quiz
 * @returns component
 */
function Run () {
  const history = useHistory()
  const { id, sessionId } = useParams()
  const classes = useStyles()

  const [results, setResults] = React.useState({}) // stores the status object containing players, questions, and time since last opened
  const [quiz, setQuiz] = React.useState({}) // Stores the current quiz object
  const [modalOpen, setModalOpen] = React.useState(false) // Stores the state for the modal visibility

  // Handles the closing of the modal
  const handleClose = () => {
    setModalOpen(false)
    history.push('/')
  }

  // Call the api every second to keep up to date on quiz status
  useEffect(() => {
    // Get the quiz information
    getQuiz(id)
      .then(r => {
        setQuiz(r)
      })
    // Set up a 1 second loop where we get the current status of the quiz
    const interval = window.setInterval(() => {
      getResults(sessionId)
        .then(r => {
          setResults(r)
        })
    }, 1000)
    return () => clearInterval(interval) // cleanup
  }, [])

  let difference = 0
  // Calculate the difference between the time the question started and the
  if ('questions' in results && results.position >= 0) {
    const time = new Date(results.isoTimeLastQuestionStarted)
    const current = new Date()
    difference = ((results.questions[results.position].time) - ((current.getTime() / 1000) - (time.getTime() / 1000)))
    if (difference < 0) {
      difference = 0
    }
  }

  // If not logged in, send back to the login screen
  if (!localStorage.getItem('token')) {
    history.push('/login')
  }

  return (
    <>
      <br />
      <Card>
        <CardContent>
          <Typography variant='h3'>
            {'name' in quiz && quiz.name} - {sessionId}
          </Typography>
          {'position' in results && <Typography variant='h5'>
            {/* Display the current question when not in the lobby (havent advanced into the game) */}
            Current question: {results.position >= 0 ? `${results.questions[results.position].text} (${results.position + 1}/${results.questions.length})` : 'lobby'}
          </Typography>}
          {'position' in results && results.position >= 0 && <Typography variant='h5'>
            {`Time Remaining: ${difference.toFixed(0)}s`} {/* Display the time remaining on the current question when a question is active */}
          </Typography>}
          {'questions' in results && results.position >= 0 && 'url' in results.questions[results.position] &&
            <>
            <br />
            {/* If the question has a suplementary image or video, display it */}
            <Grid container direction='row' justify='space-around'>
              {results.questions[results.position].url.type === 'image'
                ? <img className={classes.image} src={results.questions[results.position].url.data} alt='Question Image' />
                : <ReactPlayer
                    url={results.questions[results.position].url.data}
                  />
              }
              </Grid>
              <br />
            </>
          }
          <Typography variant='h5'>
            Current players:
          </Typography>
          <br />
          {/* show a list of current players */}
          <Grid container direction='row' justify='space-around'>
              {'players' in results && results.players.map(i => (
                <Chip color='secondary' key={i} label={i} />
              ))}
          </Grid>
        </CardContent>
        <CardActions>
          <Button
            variant='contained'
            color='primary'
            name='stop'
            onClick={() => {
              setModalOpen(true)
              stopQuiz(id)
              // Stop the quiz and open the view results modal
            }}
          >
            Stop Quiz
          </Button>
          {/* When the question timer has completed, allow the admin to advance the quiz, otherwise, disable the button */}
          {'position' in results && results.position + 1 < results.questions.length && (results.position === -1 || results.answerAvailable === true)
            ? <Button
              variant='contained'
              color='primary'
              onClick={() => {
                advanceQuiz(id)
              }}
            >
              Advance Quiz
            </Button>
            : <Button
              disabled
              variant='contained'
              color='primary'
            >
              Advance Quiz
            </Button>}
            {/* Allow returning to the dashboard without stopping the quiz */}
            <Button
              variant='contained'
              color='primary'
              component={Link} to='/'
            >
              Back
            </Button>
        </CardActions>
      </Card>
      <Modal
        open={modalOpen}
        onClose={handleClose}
      >
        <div className={classes.paper}>
          <Grid container direction='row' justify='center' alignItems='center' >
            <Typography alight='center' variant='h5'>Session {sessionId} Ended</Typography>
          </Grid>
          <Grid container direction='row' justify='center' alignItems='center' >
            <Typography data-test-target='view' variant='body1'>View results?</Typography>
            <IconButton aria-label="View Results" name='results' color='primary' component={Link} to={`/results/${sessionId}`} >
              {/* Link to the results page */}
              <ExitToAppIcon/>
            </IconButton>
          </Grid>
        </div>
      </Modal>
    </>
  )
}

export default Run
