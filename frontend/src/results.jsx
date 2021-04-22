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
const api = 'http://localhost:5005/'

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

function getTopPlayers (results) {
  const ranking = []
  for (let i = 0; i < results.length; i++) {
    let total = 0
    let count = 0
    for (let j = 0; j < results[i].answers.length; j++) {
      if (results[i].answers[j].correct) { total++ }
      count++
    }
    const obj = {
      name: results[i].name,
      score: total / count
    }

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
  ranking.splice(5, ranking.length)
  return (ranking)
}

function getCorrectness (results) {
  const correctness = []
  if (results.length === 0) { return correctness }

  for (let i = 0; i < results[0].answers.length; i++) {
    let total = 0
    let count = 0
    for (let j = 0; j < results.length; j++) {
      if (results[j].answers[i].correct) { total++ }
      count++
    }
    const obj = {
      question: `Question ${i + 1}`,
      '% Correct': (total / count) * 100
    }
    correctness.push(obj)
  }
  console.log(correctness)
  return (correctness)
}

function getAverageTime (results) {
  const time = []
  if (results.length === 0) { return time }

  for (let i = 0; i < results[0].answers.length; i++) {
    let total = 0
    let count = 0
    for (let j = 0; j < results.length; j++) {
      if (results[j].answers[i].answeredAt !== null) {
        total += Number(calculateTime(results[j].answers[i].questionStartedAt, results[j].answers[i].answeredAt))
        console.log(total)
        count++
      }
    }
    console.log()
    const obj = {
      question: `Question ${i + 1}`,
      'Average Time (s)': (total / count).toFixed(2)
    }
    time.push(obj)
  }
  console.log(time)
  return (time)
}

function calculateTime (started, answered) {
  const start = new Date(started)
  const ans = new Date(answered)
  const difference = Number((ans.getTime() / 1000) - (start.getTime() / 1000)).toFixed(0)

  return difference
}

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

  const initialRender = useRef(true);
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

  console.log(results)
  console.log(topPlayers)
  console.log(correctness)
  console.log(time)

  return (
    <>
      <br />
      <Card>
        <CardContent>
          <Typography variant='h3'>Results For Session {id}</Typography>
          <br/>
          <Grid container direction="row" justify="space-around" alignItems="center" >
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
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="question" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="% Correct" fill="#3D4EAE" />
              </BarChart>
            </Grid>
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
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="question" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey='Average Time (s)' fill="#F50057" />
              </BarChart>
            </Grid>
            <Grid item>
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
