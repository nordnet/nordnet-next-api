import React, { Component } from 'react';
import { greet } from 'js-lib-seed';

export default class App extends Component {
  render() {
    return (
      <p>
        { greet('world') }
      </p>
    );
  }
}
