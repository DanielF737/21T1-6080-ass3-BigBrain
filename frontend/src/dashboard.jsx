import React from 'react'
import { useHistory } from 'react-router-dom'

// import { makeStyles } from '@material-ui/core/styles'

// const useStyles = makeStyles((theme) => ({
//   navbar: {
//     flexGrow: 1,
//   },
// }))

function Dashboard (props) {
  // const classes = useStyles()
  const history = useHistory()

  if (!localStorage.getItem('token')) {
    history.push('/login')
  }

  return (
    <h1>Home</h1>
  )
}

export default Dashboard
