import React, { Component } from 'react';
// import ForceGraph3D from '3d-force-graph';
import Navbar from '../navbar/navbar';
import { Redirect } from 'react-router-dom'
import './graph.css'

class Graph extends Component {
    // Change debug and other state variables to be initialized by props

    state = {
        email:'',
        userdata:{},
        debug:'400',
    }

    componentWillMount(){
        this.setState({
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
        return (
            <React.Fragment>
                <Navbar debug={this.state.debug} logout={this.handleLogout} />
                <div className="container-fluid mcon">
                    <div className="row my-row">
                        <div className="col-4 my-col">
                            <div className="row my-row">
                                row 1
                            </div>
                            <div className="row my-row">
                                row 2
                            </div>
                        </div>
                        <div className="col-8 mcol">
                            col 2
                        </div>

                    </div>
                </div>
            </React.Fragment>
        );
    }
}
 

export default Graph;