import React, { useEffect } from 'react'
import {
  Switch,
  Route,
  Link,
  useHistory
} from 'react-router-dom'
import './App.css'

import Login from './login'
import Register from './register'
import Dashboard from './dashboard'
import EditQuiz from './editQuizz'
import EditQuestion from './editQuestion'
import QuizProvider from './util/quiz'
import EditQuizProvider from './util/editQuiz'
import Results from './results'
import Run from './run'
import Play from './play'
import { AppContext } from './util/app'

import AppBar from '@material-ui/core/AppBar'
import Container from '@material-ui/core/Container'
import { Avatar } from '@material-ui/core'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'

/**
 * Deletes the users auth token from the local storage, effectively signing them out
 */
function signOut () {
  if (localStorage.getItem('token')) {
    localStorage.removeItem('token')
  }
}

/**
 * Sites app component, handles routing and navbar
 * @returns component
 */
function App () {
  const history = useHistory()
  const context = React.useContext(AppContext)
  const [loggedIn, setLoggedIn] = context.loggedIn
  document.title = 'Big Brain'

  // Checks whether user is loged in (for context sensitive appbar)
  useEffect(() => {
    setLoggedIn(localStorage.getItem('token'))
  }, [])

  console.log(loggedIn)
  console.log(history)

  return (
    <div className='pp'>
      {/* App navbar */}
      <AppBar position='static'>
        <Grid container direction='row' justify={loggedIn ? 'space-between' : 'flex-start'} alignItems='center'>
          {/* Always show title and logo that doubles as a home buttons */}
          <Button
            component={Link} to='/'
            color='inherit'
            aria-label="Menu Button"
          >
            <Avatar alt='Site Logo' src='https://icons.iconarchive.com/icons/google/noto-emoji-people-clothing-objects/128/12130-brain-icon.png' />
            Big Brain
          </Button>
          {/* If the user is gined in, show the sign out button */}
          {loggedIn &&
            <Button
              color='inherit'
              name='sign-out'
              onClick={() => {
                history.push('/login')
                signOut()
                setLoggedIn(false)
              }}
            >
              Sign Out
            </Button>
          }
        </Grid>
      </AppBar>
      <Container maxWidth='lg'>
        <Switch>
          {/* Manage routes */}
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
            <EditQuestion/>
          </Route>
          <Route path ='/edit/:id'>
            <EditQuizProvider>
              <EditQuiz/>
            </EditQuizProvider>
          </Route>
          <Route path ='/results/:id'>
            <Results />
          </Route>
          <Route path ='/run/:id/:sessionId'>
            <Run />
          </Route>
          <Route path ='/play/:id?'>
            <Play />
          </Route>
        <Route path='*'>
          <h1>404 Page Not Found</h1>
        </Route>
        </Switch>
      </Container>
    </div>
  )
}

export default App
