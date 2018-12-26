import React from 'react';
import { observable, action, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import axios from 'axios'

import { Loader } from '../components/Loader';
import './Extra.scss';

@observer
export class Extra extends React.Component {
  data = [];
  @observable loading = true;
  @observable error = false;
  recharts = null;

  async componentDidMount() {
    runInAction(() => {
      this.loading = true;
    });
    // code splitting
    this.recharts = await import('recharts');
    this.scrape();
  }

  @action
  scrape = () => {
    axios({
      method: 'post',
      url: 'https://api.codebooyah.com/scrape',
      data: {
        "phrase": 'brewdog beer'
      }
    }).then(
      result => {
        this.data = result.data.data.slice(0, 100)
        this.loading = false;
      },
      err => {
        this.loading = false;
        this.error = true
      }
    );
  };

  render() {
    return (
      <React.Fragment>
        {this.loading && <Loader/>}
        {this.error && <p style={{ textAlign: 'center' }}>Try again after 30 sec</p>}
        {!this.loading && !this.error && this.recharts &&
          <div className="Extra-graphWrapper">
            <p>
              Check words related to Brewdog's beer.
              Data scraping (in rather alpha version) by api.codebooyah.com with node.js under the hood.
            </p>
            <this.recharts.Treemap
              width={320}
              height={400}
              data={this.data}
              dataKey="count"
              ratio={4/3}
              stroke="#fff"
              fill="#FDD171"
            >
              <this.recharts.Tooltip content={<CustomTooltip/>}/>
            </this.recharts.Treemap>
          </div>
        }
      </React.Fragment>
    )
  }
}

class CustomTooltip extends React.Component {
  render() {
    const { active } = this.props;

    if (active) {
      const { payload } = this.props;
      return (
        <div className="custom-tooltip">
          <p className="desc">{`${payload[0].payload.name} : ${payload[0].value}`}</p>
        </div>
      );
    }

    return null;
  }
}