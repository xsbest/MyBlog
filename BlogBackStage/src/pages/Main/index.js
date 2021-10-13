import React from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import Login from '../Login'
import Admin from '../Admin'

import './index.css'
function Main() {
  return (
    <Router>
      <Route path="/login" exact component={Login}></Route>
      <Route path="/" component={Admin}></Route>
    </Router>
  )
}

export default Main