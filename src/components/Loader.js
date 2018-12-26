import React from 'react'

import loader from './logo.svg';
import './Loader.scss'

export class Loader extends React.Component {
  render() {
    return (
      <img src={loader} className="Loader" alt="loading" />
    )
  }
}