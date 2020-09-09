import "./App.css";
import React, { Component } from 'react';

class App extends Component {
  state = {
    render: false
  }

  handleClick = () => {
    this.setState({render:true})
  }
  render() { 
    if(this.state.render === false){
    return (  <React.Fragment>
      <form>
      <div class="form-group">
        <label for="exampleInputEmail1">Email address</label>
        <input type="email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp"/>
        <small id="emailHelp" class="form-text text-muted">Please share with me your password dumbfck</small>
      </div>
      <div class="form-group">
        <label for="exampleInputPassword1">Password</label>
        <input type="password" class="form-control" id="exampleInputPassword1"/>
      </div>
      <div class="form-group form-check">
        <input type="checkbox" class="form-check-input" id="exampleCheck1"/>
        <label class="form-check-label" for="exampleCheck1">Check me out</label>
      </div>
      <button type="submit" class="btn btn-primary" onClick={this.handleClick}>Submit</button>
    </form>
    </React.Fragment>);
    }
    return (<React.Fragment><h1>Hello world</h1></React.Fragment>)
  }

}
 
export default App;


