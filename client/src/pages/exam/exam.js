import React, { Component } from 'react';
import Navbar from '../../components/navbar/navbar';
import { Redirect } from 'react-router-dom'


class ExamPrep extends Component {

    state = {
        email:'',
        userdata:{},
        debug:'400',
        setSession:false,
    }

    componentWillMount(){
        this.setState({
            setSession:true,
            email:sessionStorage.getItem('email'),
            userdata:sessionStorage.getItem('userdata'),
            debug:sessionStorage.getItem('debug'),
        })
    }

    handleLogout = () => {
        this.setState({
            debug:'400',
            userdata:{},
            email:''
        })
    }

    render() { 
        if(this.state.debug !== "200"){
            return(<Redirect to={{pathname:'/login'}} />)
        }
        if(this.state.setSession === true){
            return (
                <React.Fragment>
                    <Navbar debug={this.state.debug} logout={this.handleLogout} />
                    <div className="container">
                        <div className="row" style={{"marginTop":"15vh", "marginBottom":"5vh"}}>
                            <div className="col text-center">
                                <h1><b>Study Session</b></h1>
                            </div>  
                        </div>
                        <div className="row">
                            <div className="col-6">
                            <button 
                                type="button" class="btn btn-primary btn-lg active" 
                                style={{"marginRight":"1vh"}}
                            >
                                Individual Session
                            </button>
                            <button type="button" class="btn btn-lg btn-primary" disabled>Group Session</button>
                            </div>  
                            <div className="col-6 text-center">
                                <h2 style={{"fontWeight":"bold"}}>Sessions</h2>
                            </div>  
                        </div>
                    </div>
                </React.Fragment>
            )            
        }
        return (
            <React.Fragment>
                <Navbar debug={this.state.debug} logout={this.handleLogout} />

            </React.Fragment>
        )
    }
}
 

export default ExamPrep;