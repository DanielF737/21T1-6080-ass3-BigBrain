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
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Chip from '@material-ui/core/Chip';

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
  names: {
    marginLeft: '10px',
    marginRight: '10px'
  },
  image: {
    maxWidth: '500px',
    maxHeight: '500px'
  }
}));

async function stopQuiz (id, sessionId) {
  let options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/JSON',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  }
  await fetch(`${api}admin/quiz/${id}/end`, options)

  options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/JSON',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  }

  await fetch(`${api}admin/quiz/${id}`, options)
}

async function advanceQuiz (id) {
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

  if ('results' in ret) {
    return ret.results
  } else {
    return {}
  }
}

function Run () {
  const history = useHistory()
  const { id, sessionId } = useParams()
  const classes = useStyles();

  const [results, setResults] = React.useState({})
  const [quiz, setQuiz] = React.useState({})
  const [modalOpen, setModalOpen] = React.useState(false)

  const handleClose = () => {
    setModalOpen(false)
    history.push('/')
  }

  // Call the api every second to keep up to date on quiz status
  useEffect(() => {
    getQuiz(id)
      .then(r => {
        setQuiz(r)
      })
    const interval = window.setInterval(() => {
      getResults(sessionId)
        .then(r => {
          setResults(r)
        })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  let difference = 0

  // Calculate the difference between the time the question started and the
  if ('questions' in results && results.position >= 0) {
    const time = new Date(results.isoTimeLastQuestionStarted)
    const current = new Date();
    difference = ((results.questions[results.position].time) - ((current.getTime() / 1000) - (time.getTime() / 1000)))
    if (difference < 0) {
      difference = 0
    }
  }
  console.log(results)

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
            Current question: {results.position >= 0 ? `${results.questions[results.position].text} (${results.position + 1}/${results.questions.length})` : 'lobby'}
          </Typography>}
          {'position' in results && results.position >= 0 && <Typography variant='h5'>
            {`Time Remaining: ${difference.toFixed(0)}s`}
          </Typography>}
          {'questions' in results && results.position >= 0 && 'url' in results.questions[results.position] &&
            <>
            <br />
            <Grid container direction="row" justify="space-around">
              {results.questions[results.position].url.type === 'image'
                ? <img className={classes.image} src={results.questions[results.position].url.data} alt="Question Image" />
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
          <Grid container direction="row" justify="space-around">
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
            }}
          >
            Stop Quiz
          </Button>
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
          <Grid container direction="row" justify="center" alignItems="center" >
            <Typography alight='center' variant='h5'>Session {sessionId} Ended</Typography>
          </Grid>
          <Grid container direction="row" justify="center" alignItems="center" >
            <Typography variant='body1'>View results? </Typography>
            <IconButton name='results' color="primary" component={Link} to={`/results/${sessionId}`} >
              <ExitToAppIcon/>
            </IconButton>
          </Grid>
        </div>
      </Modal>
    </>
  )
}

export default Run
