import React, { useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import PropTypes from 'prop-types'
import ReactPlayer from 'react-player'

import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import TextField from '@material-ui/core/TextField'
import Grid from '@material-ui/core/Grid'
import { CardActions } from '@material-ui/core'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import { makeStyles } from '@material-ui/core/styles'
import FormControl from '@material-ui/core/FormControl'

const data = require('./config.json')
const port = data.BACKEND_PORT
const api = `http://localhost:${port}/`
// Custom styles
const useStyles = makeStyles((theme) => ({
  correct: {
    backgroundColor: 'green',
    paddingRight: 5,
    paddingLeft: 5,
    borderRadius: '5px',
    marginTop: 2
  },
  incorrect: {
    backgroundColor: 'red',
    paddingRight: 5,
    paddingLeft: 5,
    borderRadius: '5px',
    marginTop: 2
  },
  answer: {
    paddingRight: 5,
    borderRadius: '5px',
    marginTop: 2
  },
  image: {
    maxWidth: '500px',
    maxHeight: '500px'
  }
}))

/**
 * Makes the api call for the player to join a specified session with a specified name
 * @param {*} id session id of the game to join
 * @param {*} uname provided username
 */
async function joinGame (id, uname) {
  const data = {
    name: uname
  }

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/JSON'
    },
    body: JSON.stringify(data)
  }

  const r = await fetch(`${api}play/join/${id}`, options)
  const ret = await r.json()
  sessionStorage.setItem('playerId', ret.playerId) // Save the player's id in session storage
}

/**
 * Makes the api call to check to see whether the host has started the current game
 * @param {*} playerId ID of the current player
 * @returns status object of the current game
 */
async function checkStarted (playerId) {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/JSON'
    }
  }

  const r = await fetch(`${api}play/${playerId}/status`, options)
  const ret = await r.json()
  return ret
}

/**
 * Makes the api call to get the current question
 * @param {*} playerId ID of the current player
 * @returns question object of the current question
 */
async function checkQuestion (playerId) {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/JSON'
    }
  }

  const r = await fetch(`${api}play/${playerId}/question`, options)
  const ret = await r.json()
  return ret.question
}

/**
 * Makes the api call to get the id's of the correct answers when they become avaliable
 * @param {*} playerId ID of the current player
 * @returns a list of the id's of the correct answers
 */
async function checkAnswers (playerId) {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/JSON'
    }
  }

  const r = await fetch(`${api}play/${playerId}/answer`, options)
  const ret = await r.json()

  return ret.answerIds // returns a list of ids
}

/**
 * Sends the answer selections made by the player to the backend
 * @param {*} playerId ID of the current player
 * @param {*} selected the answer options the player has selected
 */
async function sendAnswer (playerId, selected) {
  // Ensure only valid answer ID's are sent
  for (let i = 0; i < selected.length; i++) {
    if (selected[i] < 0) {
      return
    }
  }
  const data = {
    answerIds: selected
  }

  const options = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/JSON'
    },
    body: JSON.stringify(data)
  }

  await fetch(`${api}play/${playerId}/answer`, options)
}

/**
 * Makes the api call to get the results object of the game once it is finished
 * @param {*} playerId ID of the current player
 * @returns results object
 */
async function checkResults (playerId) {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/JSON'
    }
  }

  const r = await fetch(`${api}play/${playerId}/results`, options)
  const ret = await r.json()

  return ret
}

/**
 * Calculates the time in which a player took to answer a question based on the
 * time the backend has recorded the question starting and the time the backend
 * has recieved the last new answer from the player
 * @param {*} started the time the question started
 * @param {*} answered the time the player answered the question
 * @returns time in seconds
 */
function calculateTime (started, answered) {
  const start = new Date(started)
  const ans = new Date(answered)
  const difference = Number((ans.getTime() / 1000) - (start.getTime() / 1000)).toFixed(0)

  return difference
}

/**
 * The functional component that displays the game to the player
 * @param {*} id the session id of the current game
 * @returns component
 */
function Game ({ id }) {
  const [started, setStarted] = React.useState(false) // Holds a boolean reflecting whether the host has started the game OR the game has ended
  const [question, setQuestion] = React.useState({}) // Stores the current question
  const [sols, setSols] = React.useState([]) // Stores the correct answers for the previous question (only in answer phase)
  const [played, setPlayed] = React.useState(false) // Stores whether a game has started previously (so we can track if we have finished the game)
  const [remaining, setRemaining] = React.useState(0) // stores the remaining time for the current question
  const [selected, setSelected] = React.useState([]) // Stores the answers the player has selected for the current question
  const [results, setResults] = React.useState([]) // Stores the results object once the admin ends the session

  const classes = useStyles()

  // Use effect that triggerrs on game start
  useEffect(() => {
    let playing
    // If the game is active
    if (started === true) {
      // set an interval to poll for the current question every seconds
      playing = window.setInterval(() => {
        checkQuestion(sessionStorage.getItem('playerId'))
          .then(r => {
            // Was having massive issues reading id from state so instead i did local storage. Its not perfect but it works
            // if there is a new question, set the state hook for the question, and clear the state hook for the players answers and correct solutions
            if (typeof r !== 'undefined' && r.id !== Number(sessionStorage.getItem('qId'))) {
              setQuestion(r)
              setSols([])
              setSelected([])
              sessionStorage.setItem('val', -1)
            }

            // Calculate the remaining time on the current question
            if (typeof r !== 'undefined') { // Error trapping if
              const qTime = new Date(r.isoTimeLastQuestionStarted)
              const current = new Date()
              const difference = (Number((Number(r.time)) - ((current.getTime() / 1000) - (qTime.getTime() / 1000))).toFixed(0))
              setRemaining(difference)
              sessionStorage.setItem('qId', r.id)
            }
          })
      }, 1000)
    }
    // Start an interval that checks if the game is active every second
    const starting = window.setInterval(() => {
      checkStarted(sessionStorage.getItem('playerId'))
        .then(r => {
          if (r.started === true) {
            setStarted(true)
            setPlayed(true)
          } else if (typeof r.started === 'undefined') {
            setStarted(false)
          }
        })
    }, 1000)

    // If the game has been played but its not currently active, get the game results and set state
    if (played && !started) {
      clearInterval(starting)
      clearInterval(playing)
      checkResults(sessionStorage.getItem('playerId'))
        .then(r => {
          setResults(r)
          sessionStorage.removeItem('playerId')
          sessionStorage.removeItem('qId')
        })
    }

    // cleanup
    return () => {
      clearInterval(playing)
      clearInterval(starting)
    }
  }, [started])

  // Get answers when timer runs out
  const initialRenderA = useRef(true)
  useEffect(() => {
    // Prevent this from running on page load
    if (initialRenderA.current) {
      initialRenderA.current = false
    } else {
      if (remaining < 0) {
        checkAnswers(sessionStorage.getItem('playerId'))
          .then(r => {
            setSols(r)
          })
      }
    }
  }, [remaining])

  // Submit answer when it is changed
  const initialRenderB = useRef(true)
  useEffect(() => {
    // Prevent this from running on page load
    if (initialRenderB.current) {
      initialRenderB.current = false
    } else {
      sendAnswer(sessionStorage.getItem('playerId'), selected)
    }
  }, [JSON.stringify(selected)])

  return (
    <>
    {/* If the game is active */}
    {started
      ? <Card>
          <Grid container direction='column' justify='space-around' alignItems='center'>
            {/* Show the current question */}
            <Typography variant='h3' gutterBottom>{question.text}</Typography>
            {sols === []
              ? <>yeet</>
              : <>
                    {/* Show the remaining time */}
                  <Typography variant='h4' gutterBottom>{remaining < 0 ? 0 : remaining} seconds remaining</Typography>
                  <br />
                  {/* If there is an additional data object (video url or image), show it */}
                  {'url' in question &&
                    <Grid container direction='row' justify='space-around'>
                      {question.url.type === 'image'
                        ? <img className={classes.image} src={question.url.data} alt='Question Image' />
                        : <ReactPlayer
                            url={question.url.data}
                          />
                      }
                    </Grid>
                  }
                  <br />
                  {/* If there is possible answers avaliable, show them to the player */}
                  {'sols' in question && question.sols > 1 // Display radio button or checkboxes relative to the number of solutions
                    ? <>
                    <FormControl component='fieldset'>
                    {'answers' in question && question.answers.map(i => (
                      <div key={i.id} >
                        {typeof sols !== 'undefined' && sols.length === 0
                          ? <FormControlLabel label={i.text} control={<Checkbox onClick={() => {
                            // When a checkbox is clicked, tell the back end
                            const temp = selected
                            if (temp.includes(i.id)) {
                              temp.splice(temp.indexOf(i.id), 1)
                            } else { temp.push(i.id) }
                            setSelected(temp)
                          }}/>}></FormControlLabel> // Disable the checkboxes while showing the answers
                          : <FormControlLabel disabled className={sols.includes(i.id)
                            ? classes.correct // Change the background color of all the correct answers to green
                            : selected.includes(i.id) ? classes.incorrect : '' // Change the background color to incorrect answers that were selected to red
                          } checked={selected.includes(i.id)} key={i.id} label={i.text} control={<Checkbox/>}/>
                        }
                      </div>
                    ))}
                    </FormControl>
                    </>
                    : <> {/* Radio buttons if its a single answer question */}
                      <RadioGroup value={Number(sessionStorage.getItem('val'))} onChange={(e) => {
                        // set the currently selected radio button, and when a new one is selected tell the backend
                        sessionStorage.setItem('val', e.target.value)
                        setSelected([Number(e.target.value)])
                      }}>
                        {'answers' in question && question.answers.map(i => (
                          <div key={i.id}>
                            {sols.length === 0
                              ? <FormControlLabel value={i.id} label={i.text} control={<Radio/>}/>
                              : <FormControlLabel disabled className={sols.includes(i.id)
                                ? classes.correct // Change the background color of all the correct answers to green
                                : i.id === Number(sessionStorage.getItem('val')) ? classes.incorrect : '' // Change the background color to incorrect answers that were selected to red
                              } key={i.id} value={i.id} label={i.text} control={<Radio/>}/>
                            }
                          </div>
                        ))}
                      </RadioGroup>
                    </>
                  }
                  <br />
                </>
            }
          </Grid>
        </Card>
      : <Card> {/* If a game isnt active */}
        <Grid container direction='column' justify='space-around' alignItems='center'>
          {played
            ? <> {/* If a game has been played and now has ended, show the results screen */}
              <br />
              <Typography variant='h3' gutterBottom>Results:</Typography>
              <br />
              {results.map((i, n) => (
                <div key={n}>
                  {/* For each question, display the time it took to answer and highlight green or red if it was answered correct or incorrect respectively */}
                  <Typography className={i.correct ? classes.correct : classes.incorrect} variant='h5' gutterBottom>
                    {n + 1}.
                    {i.answeredAt !== null
                      ? ` Answered in ${calculateTime(i.questionStartedAt, i.answeredAt)} seconds`
                      : ' Didn\'t answer in time' // If no answer time is present in the object
                    }
                  </Typography>
                </div>
              ))}
            </>
            : <> {/* If a game hasnt been played, show waiting text */}
              <br />
              <Typography variant='h3' gutterBottom>Waiting for host to start quiz...</Typography>
              <br />
            </>
          }
        </Grid>
      </Card>
    }
    <br/>
    </>
  )
}
/**
 * The base component for the player playing page, allowing a player to join the game
 * @returns component
 */
function Play () {
  const { id } = useParams() // Gets the session id from the parameters
  const [playing, setPlaying] = React.useState(false) // Boolean on whether a player id exists (allows rejoin from the same browser)
  const [sessionId, setSessionId] = React.useState('') // Store the session Id in a state variable
  const [uname, setUname] = React.useState('') // Store the entered username in a state variable

  // Handles rejoin, if a playerId exists on component load, skip join screen
  useEffect(() => {
    setSessionId(sesId)
    if (sessionStorage.getItem('playerId')) {
      setPlaying(true)
    } else { setPlaying(false) }
  }, [])

  // Store the session Id
  let sesId = ''
  if (id) { sesId = String(id) }
  return (
    <>
    {/* If no playerId */}
    {playing === false
      ? <>
        <br/>
        <Card>
          <CardContent>
            {/* Show the join game form */}
            <Grid container direction='column' justify='space-around' alignItems='center'>
              <Typography variant='h5' gutterBottom>Join Game</Typography>
              <br/>
              {/* Default value is the sessionId from the URL params */}
              <TextField label='Session Code' type='number' required defaultValue={sesId} onBlur={(e) => { setSessionId(e.target.value) }}/>
              <TextField label='Display Name' required onBlur={(e) => { setUname(e.target.value) }}/>
              <br/>
              <Button
                color='primary'
                variant='contained'
                onClick={() => {
                  // if the fields arent empty, join the session (allows joing of sessions that dont exist yet)
                  if (sessionId !== '' && uname !== '') {
                    joinGame(sessionId, uname)
                    setPlaying(true)
                    window.history.replaceState(null, '', `/play/${sessionId}`)
                  }
                }}
              >
                Join Game
              </Button>
            </Grid>
          </CardContent>
        </Card>
      </>
      : <> {/* Load the game if a playerId is present */}
        <br/>
        <Game id={sessionId}/>
        <Card>
          <CardActions>
            <Button
              color='primary'
              variant='contained'
              onClick={() => {
                sessionStorage.removeItem('playerId')
                sessionStorage.removeItem('qId')
                setPlaying(false)
              }}
            >
              Quit
            </Button>
          </CardActions>
        </Card>
      </>
    }
    </>
  )
}

// Validate the components props
Game.propTypes = {
  id: PropTypes.node,
}

export default Play
