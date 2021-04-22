import React, { useEffect, useRef } from 'react'
import { Link, useHistory, useParams } from 'react-router-dom'

import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import CardActions from '@material-ui/core/CardActions'
import Button from '@material-ui/core/Button'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
const data = require('./config.json')
const port = data.BACKEND_PORT
const api = `http://localhost:${port}/`

/**
 * Makes the api call to get the results from the specified session
 * @param {*} id sessionId to get the results of
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

  const r = await fetch(`${api}admin/session/${id}/results`, options)
  const ret = await r.json()
  return (ret)
}

/**
 * Calculates the top 5 players
 * @param {} results results object
 * @returns top 5 players and their score (percentage questions correct)
 */
function getTopPlayers (results) {
  const ranking = []
  // Add all players to an array in order of the percentage of questions they got correct (descending)
  for (let i = 0; i < results.length; i++) {
    let total = 0
    let count = 0
    // Calculate score
    for (let j = 0; j < results[i].answers.length; j++) {
      if (results[i].answers[j].correct) { total++ }
      count++
    }
    // Create info object
    const obj = {
      name: results[i].name,
      score: total / count
    }

    // Insert in order
    let inserted = false
    let k = 0
    while (inserted === false) {
      if (k >= ranking.length) {
        inserted = true
        ranking.push(obj)
      }
      if (obj.score > ranking[k].score) {
        inserted = true
        ranking.splice(k, 0, obj)
      }
      k++
    }
  }
  // Trim array to the first 5 and return
  ranking.splice(5, ranking.length)
  return (ranking)
}

/**
 * Calculates the percentage of players who got each question correct
 * @param {} results results object
 * @returns array containing the percentage of players who got each questsion correct
 */
function getCorrectness (results) {
  const correctness = []
  // If there is no questions, exit
  if (results.length === 0) { return correctness }

  // for each question, loop through every player and see if they got it correct
  for (let i = 0; i < results[0].answers.length; i++) {
    let total = 0
    let count = 0
    for (let j = 0; j < results.length; j++) {
      if (results[j].answers[i].correct) { total++ }
      count++
    }
    const obj = {
      question: `Question ${i + 1}`,
      '% Correct': ((total / count) * 100).toFixed(2)
    }
    correctness.push(obj)
  }
  return (correctness)
}

/**
 * Calculates the average time taken to answer each question
 * @param {} results results object
 * @returns array containing the average time taken to answer each question
 */
function getAverageTime (results) {
  const time = []
  // If there is no questions, exit
  if (results.length === 0) { return time }

  // for each question, loop through every player and see calculate how long it took to answer
  for (let i = 0; i < results[0].answers.length; i++) {
    let total = 0
    let count = 0
    for (let j = 0; j < results.length; j++) {
      if (results[j].answers[i].answeredAt !== null) {
        total += Number(calculateTime(results[j].answers[i].questionStartedAt, results[j].answers[i].answeredAt))
        count++
      }
    }
    // For each question, create the average time taken to answer in seconds (to 2 decimal places)
    const obj = {
      question: `Question ${i + 1}`,
      'Average Time (s)': (total / count).toFixed(2)
    }
    time.push(obj)
  }
  return (time)
}

/**
 * Calculates how long it took a player to answer a question
 * @param {*} started The time the question started
 * @param {*} answered The time the players last answer was recorded
 * @returns Time taken to answer (seconds)
 */
function calculateTime (started, answered) {
  const start = new Date(started)
  const ans = new Date(answered)
  const difference = Number((ans.getTime() / 1000) - (start.getTime() / 1000)).toFixed(0)

  return difference
}

/**
 * Results component
 * @returns component
 */
function Results () {
  const history = useHistory()
  const { id } = useParams()
  const [results, setResults] = React.useState([])
  const [topPlayers, setTopPlayers] = React.useState([])
  const [correctness, setCorrectness] = React.useState([])
  const [time, setTime] = React.useState([])

  useEffect(() => {
    getResults(id)
      .then(r => {
        setResults(r.results)
      })
  }, [])

  const initialRender = useRef(true)
  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false
    } else {
      setTopPlayers(getTopPlayers(results))
      setCorrectness(getCorrectness(results))
      setTime(getAverageTime(results))
    }
  }, [results])

  if (!localStorage.getItem('token')) {
    history.push('/login')
  }

  return (
    <>
      <br />
      <Card>
        <CardContent>
          <Typography data-test-target='results' variant='h3'>Results</Typography>
          <Typography variant='body1'>Session {id}</Typography> {/* Show the session ID */}
          <br/>
          {/* Graph the correctness per question */}
          <Grid container direction='row' justify='space-around' alignItems='center' >
            <Grid item>
              <BarChart
                width={500}
                height={300}
                data={correctness}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='question' />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey='% Correct' fill='#3D4EAE' />
              </BarChart>
            </Grid>
            {/* Graph the average time taken per question */}
            <Grid item>
              average answer time
              <BarChart
                width={500}
                height={300}
                data={time}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='question' />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey='Average Time (s)' fill='#F50057' />
              </BarChart>
            </Grid>
            <Grid item>
              {/* Built a tabel showing the ranking of the top 5 players and their scores */}
              <TableContainer component={CardContent}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell >Ranking</TableCell>
                      <TableCell >Player</TableCell>
                      <TableCell >% Correct</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topPlayers.map((i, n) => (
                      <TableRow key={n}>
                        <TableCell >{n + 1}</TableCell>
                        <TableCell >{i.name}</TableCell>
                        <TableCell >{(Number(i.score) * 100).toFixed(1)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </CardContent>
        <CardActions>
          {/* Button to return to site home */}
          <Button
            variant='contained'
            color='primary'
            component={Link} to='/'
          >
            Home
          </Button>
        </CardActions>
      </Card>
    </>
  )
}

export default Results
