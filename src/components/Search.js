import React from 'react';
import { observable, action } from 'mobx';
import { inject, observer, PropTypes as MobxPropTypes } from 'mobx-react';
import { Link } from "react-router-dom";
import debounce from 'lodash/debounce';

import { Loader } from './Loader';

import './Search.scss';

@inject('punkStore') @observer
export class Search extends React.Component {
  static propTypes = {
    punkStore: MobxPropTypes.objectOrObservableObject,
  };

  @observable onFocus = false;
  @observable searchPhrase = '';

  @action
  handleSearch = async () => {
    const { punkStore } = this.props;
    if (this.searchPhrase.length === 0) {
      punkStore.resetSearchResults();
      return;
    }
    const phrase = this.searchPhrase.trim().split(' ').join('+');
    punkStore.search(phrase).then(
      () => {},
      e => {
        // TODO: handle error
        console.error(e);
      }
    );
  };

  debouncedHandleSearch = debounce(this.handleSearch, 500);

  @action
  handleSearchChange = e => {
    this.searchPhrase = e.target.value;
    this.debouncedHandleSearch();
  };

  @action
  toggleFocus = () => {
    setTimeout(
      () => {
        this.onFocus = !this.onFocus
      },
      500
    )
  };

  render() {
    // TODO: maybe some empty state for no results
    const { punkStore } = this.props;
    return (
      <div className="Search">
        <input
          className="Search-input"
          onChange={this.handleSearchChange}
          onFocus={this.toggleFocus}
          onBlur={this.toggleFocus}
          placeholder="search"
          type="text"
        />
        {this.onFocus && <div className="Search-results">
          {punkStore.loadingSearchResults && <Loader/>}
          {!punkStore.loadingSearchResults &&
            punkStore.searchResults.map(r =>
              <Link className="Search-item" key={r.id} to={`beers/${r.id}`}>{r.name}</Link>)
          }
        </div>}
      </div>
    )
  }
}