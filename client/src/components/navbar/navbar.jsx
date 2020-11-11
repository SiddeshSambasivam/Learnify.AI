import React, { Component } from "react";
import {Redirect} from 'react-router-dom';


class Navbar extends Component {
  state = {
    signupPage:false,
    loginpage:false,
    debug:'400'
  }
  handlelogout = () => {
    this.props.logout();
  };

  handlelogin = () => {
    this.setState({ 
      signupPage:true
    })
  }

  loggedIn = () => {
    return (
      <React.Fragment>
        <div className="contianer">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <a href="/" className="navbar-brand">
          Learnify.ai
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav mr-auto">
            <li className="nav-item active">
              <a className="nav-link" href="/">
                Home <span className="sr-only">(current)</span>
              </a>
            </li>
            <li className="nav-item active">
              <a className="nav-link" href="/courses">
                  Courses
              <span className="sr-only">(current)</span>
              </a>
            </li>
            <li className="nav-item active">
              <a className="nav-link" href="/study">
                  Study
              <span className="sr-only">(current)</span>
              </a>
            </li>
          </ul>
          <form className="form-inline my-2 my-lg-0">
            <ul className="navbar-nav mr-auto">
            <li className="nav-item active">
              <a className="nav-link" href="/profile">
                <img src={require("./p.png")} alt="img" style={{width:"30px", height:"30px", marginRight:"20px"}}/>
              </a>
              </li>
            </ul>

            <button
              className="btn btn-outline-success my-2 my-sm-0"
              type="submit"
              onClick={this.handlelogout}
            >
              Logout
            </button>
          </form>
        </div>
      </nav>
      </div>
      </React.Fragment>
    );
  };

  loggedOut = () => {
    return (
      <React.Fragment>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <a className="navbar-brand" href="/">
          Learnify.ai
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav mr-auto">
            <li className="nav-item active"></li>
          </ul>

          <form className="form-inline my-2 my-lg-0">
            {this.state.loginpage ? null : <button
              className="btn btn-outline-success my-2 my-sm-0"
              type="submit"
              onClick={this.handlelogin}
            >
              Login
            </button>}
          </form>
        </div>
      </nav>
      </React.Fragment>
    );
  };

  componentWillMount(props){
    if (this.props.loginpage){
      this.setState({loginpage:this.props.loginpage})
    }
    if (this.props.debug){
      this.setState({debug:this.props.debug})
    }
  }

  render() {
    // const auth = this.props.debug;
    // console.log(this.state)
    if (this.state.debug === '200'){
      return <React.Fragment> <this.loggedIn /></React.Fragment>;
    }
    else if(this.state.signupPage === true ){
      return <Redirect to='/login' />;
    }
    
    return <React.Fragment><this.loggedOut /></React.Fragment>;
  }
}

export default Navbar;
