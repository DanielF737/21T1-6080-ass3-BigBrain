import React, { useEffect } from 'react'
import { Link, useHistory } from 'react-router-dom'

import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardActions from '@material-ui/core/CardActions'
import Avatar from '@material-ui/core/Avatar'

import { QuizContext } from './util/quiz'
const api = 'http://localhost:5005/'

function signOut () {
  if (localStorage.getItem('token')) {
    localStorage.removeItem('token')
  }
}

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
  return (quizzes)
}

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
    <div>
      {quizzes.map(i => (
        <>
          {/* TODO fix the width */}
          <Card key={i.id}>
            <CardContent>
              <Typography variant="h5" component="h2">
                {/* TODO make this inline */}
                <Avatar alt="Quiz Thumbnail" src={i.thumbnail} />
                {i.name}
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
          <br/>
        </>
      ))}
    </div>
  )
}

// TODO make new quiz button functional
function Dashboard (props) {
  const history = useHistory()
  const context = React.useContext(QuizContext)
  const [quizCount, setQuizCount] = context.quizCount

  if (!localStorage.getItem('token')) {
    history.push('/login')
  }

  return (
    <>
      <br/>
      <Typography variant="h2" component="h2" gutterBottom>
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
