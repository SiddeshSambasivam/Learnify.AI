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

      <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
            <a class="navbar-brand" href="#">Bootstrap Cheatsheet</a>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
              <span class="navbar-toggler-icon"></span>
            </button>
          
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
              <ul class="navbar-nav mr-auto">
                <li class="nav-item active">
                  <a class="nav-link" href="#">Home <span class="sr-only">(current)</span></a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="#">Link</a>
                </li>
                <li class="nav-item dropdown">
                  <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    Dropdown
                  </a>
                  <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                    <a class="dropdown-item" href="#">Action</a>
                    <a class="dropdown-item" href="#">Another action</a>
                    <div class="dropdown-divider"></div>
                    <a class="dropdown-item" href="#">Something else here</a>
                  </div>
                </li>
                <li class="nav-item">
                  <a class="nav-link disabled" href="#" tabindex="-1" aria-disabled="true">Disabled</a>
                </li>
              </ul>
            </div>
          </nav>

          
      <form>
  
       <div class="centered">
       <h1>Node mind</h1>
       </div>

        <h2> NTU EEE: Group 57</h2>
   
      <div class="form-group">
        <label for="exampleInputEmail1">Student ID</label>
        <input type="email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp"/>
        <small id="emailHelp" class="form-text text-muted"> No Spacing Needed </small>
       </div>

       <div class="form-group">
        <label for="exampleInputPassword1">Password</label>
        <input type="password" class="form-control" id="exampleInputPassword1"/>
       </div>
       <div><select>
<option value="Year 4">Year 4</option>
<option value="Year 3">Year 3</option>
<option value="Year 2">Year 2</option>
<option value="Year 2">Year 1</option>
<option selected value="Year of study">Year of study</option>
</select>
</div>
       <div class="form-group form-check">
        <input type="checkbox" class="form-check-input" id="exampleCheck1"/>
        <label class="form-check-label" for="exampleCheck1">Remember Me</label>
       </div>

      <button type="submit" class="btn btn-primary" onClick={this.handleClick}>Submit</button>
    </form>
    </React.Fragment>);
   
    }
    return (<React.Fragment><h1>Do Not Cheat The System</h1></React.Fragment>)
  }

}

export default App;


