import React from 'react';
import { observable, action } from 'mobx';
import { inject, observer, PropTypes as MobxPropTypes } from 'mobx-react';
import { Route, Link } from 'react-router-dom';

import { Loader } from '../components/Loader';
import { Modal } from '../components/Modal';
import { BeerItem } from '../components/BeerItem';
import { Search } from '../components/Search';
import BottomEdgeDetector from 'react-scroll-edge-detector';
import './Main.scss';

@inject('punkStore')
@observer
export class Main extends React.Component {
  static propTypes = {
    punkStore: MobxPropTypes.objectOrObservableObject,
  };

  @observable page = 1;

  componentDidMount() {
    this.props.punkStore.getBeersBatch(this.page).catch(e => {
      // TODO: handle error
      console.error(e);
    });
  }

  componentWillUnmount() {
    this.props.punkStore.resetBeers();
  }

  @action
  handleLoadMore = () => {
    this.page++;
    this.props.punkStore.getBeersBatch(this.page);
  };

  render() {
    const { punkStore } = this.props;
    return (
      <BottomEdgeDetector
        offset={200}
        onBottomReached={this.handleLoadMore}
        blockCb={punkStore.loading || punkStore.allBeersLoaded}
      >
        <Link to="/extra" className={'Extra'}>
          some extra ficzer
        </Link>
        <Search />
        <Route path={`${this.props.match.url}/:id`} component={Modal} />
        <div className={'LinkContainer'}>
          {punkStore.beers.map(beer => (
            <BeerItem
              key={beer.id}
              baseUrl={this.props.match.url}
              beer={beer}
            />
          ))}
        </div>
        {punkStore.loading && <Loader />}
        {punkStore.allBeersLoaded && (
          <p className={'NoMore'}>OMG no more beers</p>
        )}
      </BottomEdgeDetector>
    );
  }
}
