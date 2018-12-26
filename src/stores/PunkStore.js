import { observable, action } from 'mobx';
import axios from 'axios';
import sortBy from 'lodash/sortBy';

class BeerModel {
  id = null;
  name = null;
  tagline = null;
  image_url = null;
  ibu = null;
  abv = null;
  ebc = null;
  description = null;
  malt = [];
  hops = [];
  yeast = null;
  constructor(props) {
    this.id = props.id;
    this.name = props.name;
    this.tagline = props.tagline;
    this.image_url = props.image_url;
    this.ibu = props.ibu;
    this.abv = props.abv;
    this.ebc = props.ebc;
    this.description = props.description;
    this.malt = props.ingredients ? props.ingredients.malt : [];
    this.hops = props.ingredients ? props.ingredients.hops : [];
    this.yeast = props.ingredients ? props.ingredients.yeast : null;
  }
}

class ShortBeerModel {
  id = null;
  name = null;
  tagline = null;
  image_url = null;

  constructor(props) {
    this.id = props.id;
    this.name = props.name;
    this.tagline = props.tagline;
    this.image_url = props.image_url;
  }
}

class SearchBeerModel {
  id = null;
  name = null;

  constructor(props) {
    this.id = props.id;
    this.name = props.name;
  }
}

class PunkStore {
  @observable beers = observable.array();
  @observable similarBeers = observable.array();
  @observable searchResults = observable.array();
  @observable allBeersLoaded = false;
  @observable beerDetails = null;
  @observable loading = false;
  @observable loadingBeerDetails = false;
  @observable loadingSimilarBeers = false;
  @observable loadingSearchResults = false;

  PATH = 'https://api.punkapi.com/v2/beers';
  PAGE_PARAM = '?page=';
  PER_PAGE_PARAM = '&per_page=';

  @action
  getBeersBatch = async (page, perPage = 30) => {
    this.loading = true;
    try {
      const result = await axios.get(`${this.PATH}${this.PAGE_PARAM}${page}${this.PER_PAGE_PARAM}${perPage}`);
      if (result.data.length === 0) {
        this.allBeersLoaded = true;
      }
      this.beers.push(...result.data.map(beer => new ShortBeerModel(beer)));
      this.loading = false;
      return result;
    } catch (e) {
      this.loading = false;
      throw e;
    }
  };

  @action
  resetBeers = () => {
    this.beers.clear();
    this.allBeersLoaded = false;
  };

  @action
  getBeer = async (id) => {
    this.loadingBeerDetails = true;
    try {
      const result = await axios.get(`${this.PATH}/${id}`);
      this.loadingBeerDetails = false;
      this.beerDetails = new BeerModel(result.data[0]);
      return result;
    } catch (e) {
      this.loadingBeerDetails = false;
      throw e;
    }
  };

  @action
  resetBeerDetails = () => {
    this.beerDetails = null;
  };

  @action
  getSimilarBeers = (ibu, abv, ebc) => {
    this.loadingSimilarBeers = true;
    // less efficient, but more accurate than combining all params in one request
    return axios.all([
      axios.get(`${this.PATH}?ibu_gt=${Math.ceil(ibu)}`), // go hopheads!
      axios.get(`${this.PATH}?abv_gt=${Math.floor(abv)}`), // the lighter, the better :)
      axios.get(`${this.PATH}?ebc_gt=${Math.ceil(ebc)}`),
    ]).then(axios.spread((ibuRes, abvRes, ebcRes) => {
      // TODO: additional filters - it is possible to sometimes get 2-3 the same items
      this.similarBeers.push(
        new ShortBeerModel(sortBy(ibuRes.data, d => d.ibu).filter(b => b.id !== this.beerDetails.id)[0]),
        new ShortBeerModel(sortBy(abvRes.data, d => d.abv).filter(b => b.id !== this.beerDetails.id)[0]),
        new ShortBeerModel(sortBy(ebcRes.data, d => d.ebc).filter(b => b.id !== this.beerDetails.id)[0])
      );
      this.loadingSimilarBeers = false;
    })).catch(e => {
      this.loadingSimilarBeers = false;
      throw e;
    });
  };

  @action
  resetSimilarBeers = () => {
    this.similarBeers.clear();
  };

  @action
  search = async phrase => {
    const url = `${this.PATH}?beer_name=${phrase}`;
    this.loadingSearchResults = true;
    try {
      const result = await axios.get(url);
      this.searchResults.replace(
        result.data.map(r => new SearchBeerModel(r))
      );
      this.loadingSearchResults = false;
      return result;
    } catch (e) {
      this.loadingSearchResults = false;
      throw e;
    }
  };

  @action
  resetSearchResults = () => {
    this.searchResults.clear();
  }
}

export const stores = {
  punkStore: new PunkStore(),
};