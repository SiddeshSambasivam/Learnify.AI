import React, { Component } from 'react';
import { Redirect } from 'react-router-dom'
import NavBar from '../../components/navbar/navbar';

class Sample extends Component {
    state = {
        email:'',
        userdata:{},
        debug:'',
        uploads:[],
        uploadfiles:[],
        currentCourse:""
    }

    componentWillMount(){
        
        if(sessionStorage.getItem("debug") !== undefined && sessionStorage.getItem("userdata") !== undefined && sessionStorage.getItem("email") !== undefined){
            this.setState(
                {
                    email:sessionStorage.getItem("email"),
                    userdata: JSON.parse(sessionStorage.getItem("userdata")),
                    debug:sessionStorage.getItem("debug"),
                }
            )
        }
    }

    onChangeHandler=event=>{
        this.state.uploads.push(
            {
                'file':event.target.files[0],
                'course':this.state.currentCourse
            }
        )
        this.setState({uploadfiles:[...this.state.uploadfiles, event.target.files[0].name]})
    }

    handleUpload = (event) => {
        
        this.state.uploads.map(
            (file) => {
                // console.log(file)
                const data = new FormData();
                data.append('file', file);
                fetch('http://0.0.0.0:10000/extract', 
                    {
                        method: 'PUT',
                        body: data,
                    }
                ).then(
                    (response) => {
                        response.json().then((body) => {
                            console.log('API debug code:', file) 
                        });
                    }
                );
            }
        )
    }

    handleSelection = (event) => {
        // console.log('event=> s', event.target.id)
        this.setState(
            {
                currentCourse:event.target.id
            }
        )
    }

    handleLogout = () => {
        this.setState({
            debug:'400',
            userdata:{},
            email:''
        })
        sessionStorage.setItem("email", '')
        sessionStorage.setItem("userdata", {})
        sessionStorage.setItem("debug", '400')
    }

    render() { 

        if(this.state.debug !== "200"){
            return(<Redirect to={{pathname:'/login'}} />)
        }

        if(this.state.uploads.length > 0){
            let filenames = []
            Array.from(this.state.uploads).forEach(file => filenames.push((file.file.name)))
            console.log('fielnames: ', filenames)
            var fileList = filenames.map(function(filename){
                return <li className="list-group-item alert alert-success">{filename}</li>;
            })
            console.log(fileList)
        }

        if(this.state.userdata.courses.length > 0){
            let courses = this.state.userdata.courses
            var courseList = courses.map(
                (course) => {
                    if(this.state.currentCourse === course.course_name){
                        return (
                            <button className="dropdown-item active" 
                            key={course.course_name} type="button" id={course.course_name} onClick={this.handleSelection}>
                                {course.course_name}
                            </button>)                        
                    }
                    return (
                    <button className="dropdown-item " 
                    key={course.course_name} type="button" id={course.course_name} onClick={this.handleSelection}>
                        {course.course_name}
                    </button>)
                }
            )
        }

        return (
            <React.Fragment>
                <NavBar debug={this.state.debug} logout={this.handleLogout}/>
                <div className="container">

                    <div className="row" style={{"marginTop":"10vh"}}>
                        <div className="col text-center">
                            <h1>
                                <b>Welcome {this.state.userdata.username} !</b>
                            </h1>
                        </div>
                    </div>

                    <div className="row justify-content-center" style={{"marginTop":"2vh"}}>

                        <div className="col-4 text-center">

                            <div className="row justify-content-center" >
                                <h3><b>Add Documents</b></h3>
                            </div>

                            <div className="row justify-content-center" style={{"marginTop":"20px"}}>

                                <div className="custom-file">
                                    <input 
                                        type="file"             
                                        className="custom-file-input"
                                        name='file'
                                        onChange={this.onChangeHandler}
                                    />
                                    <label className="custom-file-label">Choose file</label>
                                </div>

                                <button type="button" onClick={this.handleUpload}  className="btn btn-primary" style={{"marginTop":"20px"}}>Upload Files</button>
                                <div className="btn-group">
                                    <button type="button" className="btn btn-success dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" 
                                        aria-expanded="false" style={{"marginTop":"20px", "marginLeft":"10px"}}>
                                        courses
                                    </button>
                                    <div className="dropdown-menu">
                                        {courseList}
                                        <div className="dropdown-divider"></div>
                                        <a className="dropdown-item" href="#">Add course</a>
                                    </div>
                                </div>
                            </div>
    
                        </div>

                        <div className="col-6 text-center">
                            <h3>
                                <p><b> Upload List</b></p>
                            </h3>

                            <div className="row justify-content-center">
                                <div className="col-5">
                                    <div className="list-group">
                                        {fileList}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}
 
export default Sample;