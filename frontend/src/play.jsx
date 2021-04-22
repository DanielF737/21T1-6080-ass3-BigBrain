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

const api = 'http://localhost:5005/'
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
  sessionStorage.setItem('playerId', ret.playerId)
}

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

async function checkAnswers (playerId) {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/JSON'
    }
  }

  const r = await fetch(`${api}play/${playerId}/answer`, options)
  const ret = await r.json()

  return ret.answerIds
}

async function sendAnswer (playerId, selected) {
  for (let i = 0; i < selected.length; i++) {
    if (selected[i] < 0) {
      console.log('dumpin')
      return
    }
  }

  const data = {
    answerIds: selected
  }

  console.log(data)
  const options = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/JSON'
    },
    body: JSON.stringify(data)
  }

  console.log('sendin')
  await fetch(`${api}play/${playerId}/answer`, options)
}

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

function calculateTime (started, answered) {
  const start = new Date(started)
  const ans = new Date(answered)
  const difference = Number((ans.getTime() / 1000) - (start.getTime() / 1000)).toFixed(0)

  return difference
}

function Game ({ id }) {
  const [started, setStarted] = React.useState(false)
  const [question, setQuestion] = React.useState({})
  const [sols, setSols] = React.useState([])
  const [played, setPlayed] = React.useState(false)
  const [remaining, setRemaining] = React.useState(0)
  const [selected, setSelected] = React.useState([])
  const [results, setResults] = React.useState([])

  const classes = useStyles()

  useEffect(() => {
    let playing
    if (started === true) {
      playing = window.setInterval(() => {
        checkQuestion(sessionStorage.getItem('playerId'))
          .then(r => {
            // Was having massive issues reading id from state so instead i did local storage. Its not perfect but it works
            if (typeof r !== 'undefined' && r.id !== Number(sessionStorage.getItem('qId'))) {
              console.log('here2')
              setQuestion(r)
              setSols([])
              setSelected([])
              sessionStorage.setItem('val', -1)
            }

            if (typeof r !== 'undefined') {
              const qTime = new Date(r.isoTimeLastQuestionStarted)
              const current = new Date()
              const difference = (Number((Number(r.time)) - ((current.getTime() / 1000) - (qTime.getTime() / 1000))).toFixed(0))
              setRemaining(difference)
              sessionStorage.setItem('qId', r.id)
            }
          })
      }, 1000)
    }
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

    if (played) {
      // pass
      // TODO show game results
      // once the game ends, started is set back to false but we know that we've played by the played state
      if (started === false) {
        clearInterval(starting)
        clearInterval(playing)
        console.log('game ended')
        checkResults(sessionStorage.getItem('playerId'))
          .then(r => {
            setResults(r)
            sessionStorage.removeItem('playerId')
            sessionStorage.removeItem('qId')
          })
      }
    }

    return () => {
      clearInterval(playing)
      clearInterval(starting)
    }
  }, [started])

  // Get answers when timer runs out
  const initialRenderA = useRef(true)
  useEffect(() => {
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
    console.log('selected has been changes')
    if (initialRenderB.current) {
      initialRenderB.current = false
    } else {
      sendAnswer(sessionStorage.getItem('playerId'), selected)
    }
  }, [JSON.stringify(selected)])

  return (
    <>
    {started
      ? <Card>
          <Grid container direction='column' justify='space-around' alignItems='center'>
            <Typography variant='h3' gutterBottom>{question.text}</Typography>
            {sols === []
              ? <>yeet {console.log(sols)}</>
              : <>
                  <Typography variant='h4' gutterBottom>{remaining < 0 ? 0 : remaining} seconds remaining</Typography>
                  <br />
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
                  {'sols' in question && question.sols > 1
                    ? <>
                    <FormControl component='fieldset'>
                    {'answers' in question && question.answers.map(i => (
                      <div key={i.id} >
                        {typeof sols !== 'undefined' && sols.length === 0
                          ? <FormControlLabel label={i.text} control={<Checkbox onClick={() => {
                            console.log(selected)
                            console.log(i.id)
                            const temp = selected
                            if (temp.includes(i.id)) {
                              temp.splice(temp.indexOf(i.id), 1)
                            } else { temp.push(i.id) }
                            setSelected(temp)
                            console.log(selected)
                          }}/>}></FormControlLabel>
                          : <FormControlLabel disabled className={sols.includes(i.id)
                            ? classes.correct
                            : selected.includes(i.id) ? classes.incorrect : ''
                          } checked={selected.includes(i.id)} key={i.id} label={i.text} control={<Checkbox/>}/>
                        }
                      </div>
                    ))}
                    </FormControl>
                    </>
                    : <>
                      <RadioGroup value={Number(sessionStorage.getItem('val'))} onChange={(e) => {
                        console.log(Number(e.target.value))
                        sessionStorage.setItem('val', e.target.value)
                        setSelected([Number(e.target.value)])
                      }}>
                        {'answers' in question && question.answers.map(i => (
                          <div key={i.id}>
                            {sols.length === 0
                              ? <FormControlLabel value={i.id} label={i.text} control={<Radio/>}/>
                              : <FormControlLabel disabled className={sols.includes(i.id)
                                ? classes.correct
                                : i.id === Number(sessionStorage.getItem('val')) ? classes.incorrect : ''
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
      : <Card>
        <Grid container direction='column' justify='space-around' alignItems='center'>
          {played
            ? <>
              <br />
              <Typography variant='h3' gutterBottom>Results:</Typography>
              <br />
              {results.map((i, n) => (
                <div key={n}>
                  <Typography className={i.correct ? classes.correct : classes.incorrect} variant='h5' gutterBottom>
                    {n}.
                    {i.answeredAt !== null
                      ? ` Answered in: ${calculateTime(i.questionStartedAt, i.answeredAt)} seconds`
                      : ' Didn\'t answer in time.'
                    }
                  </Typography>
                  {console.log(i)}
                </div>
              ))}
            </>
            : <>
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

function Play () {
  const { id } = useParams()
  const [playing, setPlaying] = React.useState(false)
  const [sessionId, setSessionId] = React.useState('')
  const [uname, setUname] = React.useState('')

  useEffect(() => {
    setSessionId(sesId)
    if (sessionStorage.getItem('playerId')) {
      setPlaying(true)
    } else { setPlaying(false) }
  }, [])

  let sesId = ''
  if (id) { sesId = String(id) }
  return (
    <>
    {playing === false
      ? <>
        <br/>
        <Card>
          <CardContent>
            <Grid container direction='column' justify='space-around' alignItems='center'>
              <Typography variant='h5' gutterBottom>Join Game</Typography>
              <br/>
              <TextField label='Session Code' type='number' required defaultValue={sesId} onBlur={(e) => { setSessionId(e.target.value) }}/>
              <TextField label='Display Name' required onBlur={(e) => { setUname(e.target.value) }}/>
              <br/>
              <Button
                color='primary'
                variant='contained'
                onClick={() => {
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
      : <>
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

Game.propTypes = {
  id: PropTypes.node,
}

export default Play
