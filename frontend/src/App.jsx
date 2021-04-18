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

import { makeStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Toolbar from '@material-ui/core/Toolbar'
import Container from '@material-ui/core/Container'
import Button from '@material-ui/core/Button'

const useStyles = makeStyles((theme) => ({
  navbar: {
    flexGrow: 1,
  },
}))

function signOut () {
  // const history = useHistory()
  if (localStorage.getItem('token')) {
    localStorage.removeItem('token')
    // history.push('/')
  }
}

function App () {
  const classes = useStyles()

  const [value, setValue] = React.useState(location.pathname) // Sets the highlighted tab to the current path
  const handleChange = (e, val) => {
    setValue(val)
  }

  return (
    <Router>
      <div className="pp">
        <AppBar position="static">
          <Toolbar>
            {/* TODO change this to something other than tabs to simplify ui consistancy */}
            <Tabs value={value} onChange={handleChange} className={classes.navbar}>
              <Tab label="Home" value="/" component={Link} to="/"/>
              <Tab label="/test" value="/test" component={Link} to="/test"/>
            </Tabs>
            {/* TODO Make this context sensitive and functional */}
            {localStorage.getItem('token') ? <Button color="inherit" onClick={signOut}>Sign Out</Button> : <></>}
          </Toolbar>
        </AppBar>
        <Container maxWidth="lg">
          <Switch>
            <Route exact path ="/">
              <Dashboard />
            </Route>
            <Route path ="/test">
              <p>test</p>
            </Route>
            <Route path ="/login">
              <Login />
            </Route>
            <Route path ="/register">
              <Register />
            </Route>
          <Route path="*">
            <h1>404 Page Not Found</h1>
          </Route>
          </Switch>
        </Container>
      </div>
    </Router>
  )
}

export default App
