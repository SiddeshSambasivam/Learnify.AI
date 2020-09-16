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


