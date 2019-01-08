import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom';
import { Provider } from 'mobx-react';

import { Main } from './views/Main';
import { Extra } from './views/Extra';
import { stores } from './stores/PunkStore';
import './App.scss';

class App extends Component {
  componentDidCatch(error, info) {
    console.log(error, info);
    // + some UI consequences :)
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">
            PUNK<span>BEER</span>
          </h1>
          <h2>
            powered by{' '}
            <a
              href="https://punkapi.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              punkapi
            </a>{' '}
            | made by{' '}
            <a
              href="https://codebooyah.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              patmaz
            </a>
          </h2>
        </header>
        <Provider punkStore={stores.punkStore}>
          <Router>
            <Switch>
              <Route path="/extra" component={Extra} />
              <Route path="/beers" component={Main} />
              <Redirect from="/" to="/beers" />
            </Switch>
          </Router>
        </Provider>
      </div>
    );
  }
}

export default App;
