import React from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
  // useHistory
} from 'react-router-dom'
import './App.css'

import Login from './login'
import Register from './register'
import Dashboard from './dashboard'
import EditQuiz from './editQuizz'
import EditQuestion from './editQuestion'
import QuizProvider from './util/quiz'
import EditQuizProvider from './util/editQuiz'

import AppBar from '@material-ui/core/AppBar'
import Container from '@material-ui/core/Container'
import { Avatar } from '@material-ui/core'
import Button from '@material-ui/core/Button'

function App () {
  document.title = 'Big Brain'

  return (
    <Router>
      <div className='pp'>
        <AppBar position='static'>
          <Button
            component={Link} to='/'
            color='inherit'
          >
            <Avatar alt='Site Logo' src='https://icons.iconarchive.com/icons/google/noto-emoji-people-clothing-objects/128/12130-brain-icon.png' />
            Big Brain
          </Button>
        </AppBar>
        <Container maxWidth='lg'>
          <Switch>
            <Route exact path ='/'>
              <QuizProvider>
                <Dashboard />
              </QuizProvider>
            </Route>
            <Route path ='/test'>
              <p>test</p>
            </Route>
            <Route path ='/login'>
              <Login />
            </Route>
            <Route path ='/register'>
              <Register />
            </Route>
            <Route path ='/edit/:quizId/question/:questionId'>
              <EditQuizProvider>
                <EditQuestion/>
              </EditQuizProvider>
            </Route>
            <Route path ='/edit/:id'>
              <EditQuizProvider>
                <EditQuiz/>
              </EditQuizProvider>
            </Route>
          <Route path='*'>
            <h1>404 Page Not Found</h1>
          </Route>
          </Switch>
        </Container>
      </div>
    </Router>
  )
}

export default App
