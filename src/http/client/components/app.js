import React, { Component } from 'react';

class App extends Component {

  render() {
    return (
      <div className = 'Container'>
        {this.props.message}
      </div>
    );
  }

};

export default App;