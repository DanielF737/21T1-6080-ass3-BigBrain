import React from 'react'
import { useHistory } from 'react-router-dom'

import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Link from '@material-ui/core/Link'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import Alert from '@material-ui/lab/Alert'

import { AppContext } from './util/app'
const data = require('./config.json')
const port = data.BACKEND_PORT
const api = `http://localhost:${port}/`

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  form: {
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}))

/**
 *
 * @param {String} email
 * @param {String} password
 * @returns {String}
 */
async function login (email, password) {
  // reutrn errors if missing info
  if (email === '') { return ('Email is blank') }
  if (password === '') { return ('Password is blank') }

  const data = {
    email: email,
    password: password
  }

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/JSON'
    },
    body: JSON.stringify(data)
  }

  const r = await fetch(`${api}admin/auth/login`, options)
  const ret = await r.json()

  // If the API Call returns an error, return the error message
  if ('error' in ret) {
    return (ret.error)
  }

  localStorage.setItem('token', ret.token)
  return ('')
}

/**
 * The login form component
 * @returns component
 */
function Login () {
  const history = useHistory()
  const context = React.useContext(AppContext)
  const [loggedIn, setLoggedIn] = context.loggedIn // store whether we are logged in
  if (localStorage.getItem('token')) {
    history.push('/')
  }
  console.log(loggedIn) // Keep the linter happy
  const classes = useStyles()
  // State hooks to store the value of text fields
  const [email, setEmail] = React.useState('')
  const [pWord, setPWord] = React.useState('')

  // Stores the error message
  const [error, setError] = React.useState('')

  return (
    <Container component='main' maxWidth='xs'>
      <div className={classes.paper}>
        <Typography data-test-target='SignIn' component='h1' variant='h5'>
          Sign in
        </Typography>
        <form className={classes.form} noValidate>
          <br />
          {/* If there is an error show it */}
          {error.length > 0 ? <Alert variant='filled' severity='error'>{error}</Alert> : <></>}
          {/* All of the text fields and their setters */}
          <TextField
            variant='outlined'
            margin='normal'
            required
            fullWidth
            id='email'
            label='Email Address'
            name='email'
            autoComplete='email'
            autoFocus
            onChange={(event) => setEmail(event.target.value)}
          />
          <TextField
            variant='outlined'
            margin='normal'
            required
            fullWidth
            name='password'
            label='Password'
            type='password'
            id='password'
            autoComplete='current-password'
            onChange={(event) => setPWord(event.target.value)}
          />
          <Button
            type='submit'
            fullWidth
            variant='contained'
            color='primary'
            className={classes.submit}
            onClick = {(e) => {
              e.preventDefault()
              // Make the api call, show error if it fails or redirect if it succeeds
              login(email, pWord)
                .then(r => {
                  setError(r)
                  if (r === '') {
                    setLoggedIn(true)
                    history.push('/')
                  }
                })
            }}
          >
            Sign In
          </Button>
          <Grid container>
            <Grid item>
              {/* Link to switch to registration form */}
              <Link name='register' href='/register' variant='body2'>
                {'Don\'t have an account? Sign Up'}
              </Link>
            </Grid>
          </Grid>
        </form>
      </div>
    </Container>
  )
}

export default Login
