import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import NavBar from '../../components/navbar/navbar';
// import Background from '../../components/background/background';
import "./login.css";

class Login extends Component {
  state = {
    email: "",
    password: "",
    userdata:{},
    authError:false,
    debug:''
  };

  handleChange = (e) => {
    this.setState({
      [e.target.id]: e.target.value,
    });
  };

  handleSubmit = (e) => {

    e.preventDefault();

    let url = 'http://0.0.0.0:10000/auth?email='+this.state.email+'&password='+this.state.password;

    fetch(url, {
      method:'GET', dataType: 'json'
    })
    .then(res => res.json())
    .then(data => this.setState({userdata:data}))
    
    this.setState({debug:this.state.userdata.debug})
  
    if(this.state.userdata.debug === '404'){
      this.setState({authError:'User not found'})
    } 
    else if(this.state.userdata.debug === '401'){
      this.setState({authError:'Invalid email/password'})
    } 
  };

  initializeSession = () => {
    sessionStorage.setItem("email", this.state.email);
    sessionStorage.setItem("userdata", JSON.stringify(this.state.userdata));
    sessionStorage.setItem("debug", this.state.userdata.debug);
    sessionStorage.setItem("reload", false);
  }


  render() {
    
    if(this.state.userdata.debug !== '200'){
      return (
        <React.Fragment>
                <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%"
        }}
      >
          {/* <Background /> */}
        <NavBar debug={this.state.userdata.debug} loginpage={true}/>
        <div className="container">
          <div className="row">
            <div className="col">
              <p className="title">
                <b>Learnify.ai</b>
              </p>
              {/* <div className="row">
              </div> */}
            </div>
            
          </div>

          <div className="row screen">
            <div className="col-5">
              <p>
              <h2 style={{"fontWeight":"bold"}}>Magnify, Identify, Simplify</h2>
              <br/>
              <b>Do you want to see which topics in the your lecture notes are connected?</b>
              <br/><br/>
              Learnify.ai helps you to visualize your notes in a knowledge graph 
              and helps you to revise topics based on the amount of study time available for a given course. 
              <br/>
              <br/>
              This would help you prepare more efficiently during examinations as well as better visualize the content they need to study.
              
              </p>
            </div>
            <div className="col-1"></div>
            <div className="col-6 ">
              <font className="login-features">Login</font>

              <form onSubmit={this.handleSubmit} action="">
                <div className="form-group">
                  <label for="email">Email address</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    aria-describedby="emailHelp"
                    onChange={this.handleChange}
                  />
                  <small id="emailHelp" className="form-text text-muted">
                    We'll never share your email with anyone else.
                  </small>
                </div>
                <div className="form-group">
                  <label for="password">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    onChange={this.handleChange}
                  />
                </div>
                <div className="row">
                  <div className="col">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      onClick={this.handleSubmit}
                    >
                      Login
                    </button>
                    <Link to={{ pathname: `/signup` }}>
                      <button
                        onClick={this.handleSignUp}
                        type="submit"
                        className="btn btn-link"
                      >
                        Sign Up
                      </button>
                    </Link>
                  </div>
                  <div className="col"></div>
                </div>
                <br />
                <div className="row">
                  <div className="col-10">
                    <br />
                    {this.state.authError ? (
                      <div class="alert alert-danger" role="alert">
                        {this.state.authError}
                      </div>
                    ) : null}
                  </div>
                </div>

              </form>
            </div>
          </div>
          </div>
          </div>
        </React.Fragment>
      );
    }
    else {
      this.initializeSession()
      return(
        <Redirect
            to={{
            pathname: "/",
          }}
        />
      );
    }
  }
}

export default Login;
