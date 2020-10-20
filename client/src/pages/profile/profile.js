import React, { Component } from 'react';
import NavBar from '../../components/navbar/navbar';
import { Redirect } from 'react-router-dom'

class Profile extends Component {
    state = {
        email:'',
        userdata:{},
        debug:'',
        uploads:[],
        uploadfiles:[]
    }

    componentWillMount(){
        
        if(sessionStorage.getItem("debug") !== undefined && sessionStorage.getItem("userdata") !== undefined && sessionStorage.getItem("email") !== undefined){
            this.setState(
                {
                    email:sessionStorage.getItem("email"),
                    userdata:sessionStorage.getItem("userdata"),
                    debug:sessionStorage.getItem("debug"),
                }
            )
        }
        
        console.log(this.state)
    }

    handleLogout = () => {
        this.setState({
            debug:'400',
            userdata:{},
            email:''
        })
        sessionStorage.setItem('debug', '400')
    }

    render() { 
        if(this.state.debug !== "200"){
            return(<Redirect to={{pathname:'/login'}} />)
        }

        return (
            <React.Fragment>
                <NavBar debug={this.state.debug} logout={this.handleLogout}/>
                <div className="container">
                    My name is _______________! 
                </div>
            </React.Fragment>
        );
    }
}
 
export default Profile;