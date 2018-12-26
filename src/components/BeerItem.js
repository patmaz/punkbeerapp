import React from 'react';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { Link } from "react-router-dom";

import { Loader } from './Loader';
import './BeerItem.scss';

@observer
export class BeerItem extends React.Component {
  static propTypes = {
    beer: PropTypes.object,
    baseUrl: PropTypes.string,
    compact: PropTypes.bool,
  };

  @observable imgLoading = true;

  @action
  handleOnLoad = () => {
    this.imgLoading = false;
  };

  render() {
    const { beer, baseUrl, compact } = this.props;
    return (
      <Link to={`${baseUrl}/${beer.id}`} key={beer.id} className={`BeerLink ${compact ? 'BeerLink--compact' : ''}`}>
        <div>
          {this.imgLoading && <Loader/>}
          <img height={this.imgLoading ? 0 : 100} src={beer.image_url} alt={beer.name} onLoad={this.handleOnLoad}/>
          <h1>{beer.name}</h1>
          {!compact && <h2>{beer.tagline}</h2>}
        </div>
      </Link>
    )
  }
}