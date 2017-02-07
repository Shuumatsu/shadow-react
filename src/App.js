import React, { Component } from 'react'
import logo from './logo.svg'
import ShadowReact from './ShadowReact'

class App extends Component {
  render() {
    return (
      <ShadowReact includes={['App.css']}>
        <div className="ShadowReact demo">
          <div className="App">
            <div className="App-header">
              <img src={logo} className="App-logo" alt="logo" />
              <h2>Welcome to React</h2>
            </div>
            <p className="App-intro">
              To get started, edit <code>src/App.js</code> and save to reload.
            </p>
          </div>
        </div>
      </ShadowReact>
    )
  }
}

export default App
