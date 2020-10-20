import React, { Component } from "react";
import "./signup.css";
import { Redirect } from "react-router-dom";
import Navbar from "../../components/navbar/navbar";

class SignUp extends Component {
  state = {
    email: "",
    password: "",
    confirmpassword: "",
    username: "",
    state: false,
    debug:'',
    errorMessage:'',
    err:false,
    redirect:false
  };

  handleChange = (e) => {
    this.setState({
      [e.target.id]: e.target.value,
    });
  };

  handleSubmit = () => {
    if(this.state.debug === "409"){
      this.setState({errorMessage:"Username already exists", err:true})
    }
    else if(this.state.debug === "410"){
      this.setState({errorMessage:"Email already registered", err:true})
    }
    else if(this.state.debug === "200"){
      this.setState({errorMessage:"Signup Successful", redirect:true})
    }
    console.log(this.state)
  }
  handleSignup = (e) => {

    e.preventDefault();
    let at_idx = this.state.email.indexOf('@')
    let debug = ''
    if(this.state.email.slice(at_idx)  === '@gmail.com'){
      if(this.state.password === this.state.confirmpassword){
        let rand = 1 + Math.random() * 999999;
        let user_id = "" + String(rand) ;
        
        let url = 'http://0.0.0.0:10000/signup?email='+this.state.email+'&username='+this.state.username+'&password='+this.state.password+'&user_id='+user_id
        
        fetch(url, {
          method:'PUT', dataType: 'json'
        })
        .then(res => res.json())
        .then((data) => {
          debug = data.debug;
          this.setState({debug:debug})
          this.handleSubmit()
        })
      }
      else{
        // Wrong confirm password
        console.log('wrong password')
      }
    }
  }

  render() {
    if (this.state.state) return <Redirect to="/" />;
    if (this.state.redirect) return <Redirect to="/login" />
    return (
      <React.Fragment>
        <Navbar />
        <div className="container">
          <div className="row ">
            <div className="col text-center">
              <p className="title"><b>WorkTime</b></p>
            </div>
          </div>

          <div className="row screen justify-content-center">
            <div className="col-6">
              <font className="login-features">
                <center>Sign Up</center>
              </font>

              <form onSubmit={this.handleSignup} action="">
                <div className="form-group">
                  <label for="username">Username</label>
                  <input
                    type="name"
                    className="form-control"
                    id="username"
                    onChange={this.handleChange}
                  />
                </div>
                <div className="form-group">
                  <label for="exampleInputEmail1">Email address</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    aria-describedby="emailHelp"
                    onChange={this.handleChange}
                  />
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
                <div className="form-group">
                  <label for="confirmpassword">Confirm Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="confirmpassword"
                    onChange={this.handleChange}
                  />
                </div>
                <div className="row">
                  <div className="col">
                    <button type="submit" className="btn btn-primary">
                      Sign Up
                    </button>
                  </div>
                  
                    {
                      this.state.err ? (
                        <div class="alert alert-danger" role="alert">
                          {this.state.errorMessage}
                        </div>
                      ) : null
                    }
                  
                  <div className="col"></div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default SignUp;
