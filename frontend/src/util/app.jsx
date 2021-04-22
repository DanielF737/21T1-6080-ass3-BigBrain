import React from 'react'
import PropTypes from 'prop-types'

export const AppContext = React.createContext(null)

// Provider for the loggedIn state
export default function AppProvider ({ children }) {
  const [loggedIn, setLoggedIn] = React.useState(false)

  const store = {
    loggedIn: [loggedIn, setLoggedIn]
  }

  return <AppContext.Provider value={store}>{children}</AppContext.Provider>
}

AppProvider.propTypes = {
  children: PropTypes.node,
}
