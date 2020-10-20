import React, { Component } from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Login from "./pages/login/login";
import SignUp from "./pages/signup/signup";
import Home from './pages/home/home';
import Graph from './components/graph/graph';
import Background from './components/background/background';
import Profile from './pages/profile/profile';


class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route path='/profile' component={Profile} /> 
          <Route path='/graph' component={Graph} />
          <Route path='/bg' component={Background} />
          <Route path="/login" component={Login} />
          <Route path="/signup" component={SignUp} />
          <Route path='/' component={Home} /> 

        </Switch>
      </BrowserRouter>
    );
  }
}

export default App;
