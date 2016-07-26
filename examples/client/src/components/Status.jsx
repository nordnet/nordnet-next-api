import React from 'react';
import { get, setConfig } from 'nordnet-next-api';

class Status extends React.Component {

  componentDidMount() {
    get('/next/2/')
      .then(({ data }) => this.setState({ status: data }));
  }

  render() {
    if (!this.state || !this.state.status) {
      return <div></div>;
    }

    const status = this.state.status;
    const timestamp = new Date(status.timestamp);

    return (
      <div>
        <h2>nExt API status</h2>
        <div>timestamp: { `${timestamp}` }</div>
        <div>valid_version: { `${status.valid_version}` }</div>
        <div>system_running: { `${status.system_running}` }</div>
        <div>message: { status.message }</div>
      </div>
    );
  }
}

export default Status;
