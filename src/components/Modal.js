import React from 'react';
import { observable, runInAction } from 'mobx';
import { inject, observer, PropTypes as MobxPropTypes } from 'mobx-react';
import { Link } from "react-router-dom";

import { BeerItem } from './BeerItem';
import { Loader } from './Loader';

import './Modal.scss'

@inject('punkStore') @observer
export class Modal extends React.Component {
  static propTypes = {
    punkStore: MobxPropTypes.objectOrObservableObject,
  };

  @observable error = false;

  componentDidMount() {
    const { punkStore, match } = this.props;
    punkStore.getBeer(match.params.id).then(
      () => {
        punkStore.getSimilarBeers(punkStore.beerDetails.ibu, punkStore.beerDetails.abv, punkStore.beerDetails.ebc)
          .catch(e => {
            // TODO: handle error
            console.error(e);
          })
      },
      e => {
        // TODO: handle error
        runInAction(() => {
          this.error = true;
        });
        console.error(e);
      }
    );
  }

  componentWillUnmount() {
    this.props.punkStore.resetBeerDetails();
    this.props.punkStore.resetSimilarBeers();
  }

  componentWillReceiveProps(nextProps) {
    const { punkStore, match } = this.props;
    if (match.params.id !== nextProps.match.params.id) {
      this.props.punkStore.resetBeerDetails();
      this.props.punkStore.resetSimilarBeers();
      punkStore.getBeer(nextProps.match.params.id).then(
        () => {
          punkStore.getSimilarBeers(punkStore.beerDetails.ibu, punkStore.beerDetails.abv, punkStore.beerDetails.ebc)
            .catch(e => {
              console.error(e);
            })
        },
        e => {
          console.error(e);
        }
      );
    }
  }

  render() {
    const { punkStore, punkStore: { beerDetails } } = this.props;
    return (
      <div className="Overlay">
        <div className="Modal">
          <Link className="Modal-close" to={'/beers'}>close</Link>
          {this.error && <p>:(</p>}
          {punkStore.loadingBeerDetails && <Loader/>}
          {!punkStore.loadingBeerDetails &&
            beerDetails &&
              <div className="Modal-inside">
                <div className="Modal-description">
                  <img className="Modal-image" src={beerDetails.image_url} alt={beerDetails.name}/>
                  <div>
                    <h1 className="Modal-header">{beerDetails.name}</h1>
                    <h2>{beerDetails.tagline}</h2>
                    <div>
                      <p className="Modal-prop"><span>IBU:</span>{beerDetails.ibu}</p>
                      <p className="Modal-prop"><span>ABV:</span>{beerDetails.abv}</p>
                      <p className="Modal-prop"><span>EBC:</span>{beerDetails.ebc}</p>
                    </div>
                    <p className="Modal-descr">{beerDetails.description}</p>
                    <h2 className="Modal-header--h2">Malt:</h2>
                    <ul>
                      {beerDetails.malt.map((malt, i) => <li key={i}>{malt.name}</li>)}
                    </ul>
                    <h2 className="Modal-header--h2">Hops:</h2>
                    <ul>
                      {beerDetails.hops.map((hop, i) => <li key={i}>{hop.name}</li>)}
                    </ul>
                    <h2 className="Modal-header--h2">Yeast:</h2>
                    <ul>
                      {beerDetails.yeast || '-'}
                    </ul>
                  </div>
                </div>
                <h2 className="Modal-header--h2" style={{ margin: '2rem 2rem 1rem' }}>Similar beers:</h2>
                <div className="Modal-similar">
                  {punkStore.similarBeers.map(beer =>
                    <BeerItem key={beer.id} baseUrl={'/beers'} beer={beer} compact/>)
                  }
                  {punkStore.loadingSimilarBeers && <Loader/>}
                </div>
              </div>
          }
        </div>
      </div>
    )
  }
}