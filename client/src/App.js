import React, { Component } from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Login from "./pages/login/login";
import SignUp from "./pages/signup/signup";
import Home from './pages/home/home';
import Courses from './pages/courses/courses';
import Profile from './pages/profile/profile';
import ExamPrep from './pages/exam/exam';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route path='/study' component={ExamPrep} />
          <Route path='/profile' component={Profile} /> 
          <Route path='/courses' component={Courses} />
          <Route path="/login" component={Login} />
          <Route path="/signup" component={SignUp} />
          <Route path='/' component={Home} /> 
        </Switch>
      </BrowserRouter>
    );
  }
}

export default App;






