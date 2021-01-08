import React, { Component } from "react";
import Navbar from "../../components/navbar/navbar";
import { Redirect } from "react-router-dom";
import Session from "../session";

class ExamPrep extends Component {
  state = {
    email: "",
    userdata: {},
    debug: "400",
    currentCourse: "",
    lectures: null,
    mins: "",
    session: null,
    sessionData: {},
    uploading: false,
  };

  componentWillMount() {
    this.setState({
      email: sessionStorage.getItem("email"),
      userdata: JSON.parse(sessionStorage.getItem("userdata")),
      debug: sessionStorage.getItem("debug"),
    });
  }

  handleLogout = () => {
    this.setState({
      debug: "400",
      userdata: {},
      email: "",
    });
  };

  getCourseKeywords() {
    for (var tmp in this.state.userdata.courses) {
      if (
        this.state.userdata.courses[tmp].course_name ===
        this.state.currentCourse
      ) {
        return this.state.userdata.courses[tmp].keywords;
      }
    }
    return null;
  }

  handleSelection = (event) => {
    this.setState({
      currentCourse: event.target.id,
    });
  };

  handleLecture = (event) => {
    this.setState({
      lectures: event.target.id,
    });
  };

  handleSubmit = () => {
    var keywords = this.getCourseKeywords();
    const session = {
      course: this.state.currentCourse,
      lecture: this.state.lectures,
      duration: this.state.mins,
      keywords: keywords,
    };
    this.setState({
      uploading: true,
    });
    var url =
      "http://0.0.0.0:10000/dynamicGraphs?email=" +
      String(this.state.email) +
      "&course=" +
      String(this.state.currentCourse) +
      "&lecture=" +
      String(this.state.lectures);
    fetch(url, {
      method: "GET",
    })
      .then((res) => res.json())
      .then((data) => {
        this.setState({
          session: session,
          sessionData: data,
        });
      });
  };

  handleChange = (e) => {
    this.setState({
      mins: e.target.value,
    });
  };

  render() {
    if (this.state.debug !== "200") {
      return <Redirect to={{ pathname: "/login" }} />;
    }

    if (this.state.session != null) {
      return (
        <Session
          sessionVars={this.state.session}
          sessionData={this.state.sessionData}
        />
      );
    }

    if (this.state.userdata.courses.length > 0) {
      var courses = this.state.userdata.courses;
      var courseNames = courses.map((course) => {
        if (this.state.currentCourse === course.course_name) {
          return (
            <button
              className="list-group-item list-group-item-action active"
              key={course.course_name}
              type="button"
              id={course.course_name}
              onClick={this.handleSelection}
            >
              {course.course_name}
            </button>
          );
        }
        return (
          <button
            className="list-group-item list-group-item-action"
            key={course.course_name}
            type="button"
            id={course.course_name}
            onClick={this.handleSelection}
          >
            {course.course_name}
          </button>
        );
      });
    }

    if (this.state.currentCourse !== "") {
      var query = [];
      for (var tmp in this.state.userdata.courses) {
        if (
          this.state.userdata.courses[tmp].course_name ===
          this.state.currentCourse
        ) {
          query = this.state.userdata.courses[tmp].lectures;
          break;
        }
      }
      // // this.setState({currentGraph:query[1].graph})
      // console.log('lecture list',query)
      var renderLectures = query.map((lecture) => {
        if (String(lecture.lecture) === this.state.lectures) {
          return (
            <button
              className="dropdown-item active"
              key={String(lecture.lecture) + this.state.currentCourse}
              type="button"
              id={lecture.lecture}
              onClick={this.handleLecture}
            >
              {lecture.lecture}
            </button>
          );
        }

        return (
          <button
            className="dropdown-item"
            key={String(lecture.lecture) + this.state.currentCourse}
            type="button"
            id={lecture.lecture}
            onClick={this.handleLecture}
          >
            {lecture.lecture}
          </button>
        );
      });
    }

    var timeInput = null;
    if (this.state.lectures !== null) {
      timeInput = (
        <React.Fragment>
          {this.state.uploading ? (
            <div style={{ marginTop: "6vh" }}>
              <center>
                <div class="spinner-border text-primary" role="status">
                  <span class="sr-only">Loading...</span>
                </div>
                <p style={{ marginTop: "2vh" }}>
                  We are getting things ready...
                </p>
              </center>
            </div>
          ) : (
            <React.Fragment>
              <div className="form-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter duration in minutes"
                  onChange={this.handleChange}
                />
              </div>
              <center>
                <button
                  type="submit"
                  className="btn btn-primary"
                  onClick={this.handleSubmit}
                >
                  Start
                </button>
              </center>
            </React.Fragment>
          )}
        </React.Fragment>
      );
    }

    const indiv = (
      <React.Fragment>
        <div style={{ marginTop: "3vh", width: "5wh" }}>
          <div className="row" style={{ fontSize: "25px" }}>
            <div className="col">
              <b>Step 1:</b> Select the course
            </div>
          </div>
          <div className="row" style={{ marginTop: "2vh" }}>
            <div className="col" style={{ fontSize: "20px" }}>
              {courseNames}
            </div>
          </div>
          <div className="row" style={{ marginTop: "3vh", fontSize: "25px" }}>
            <div className="col">
              <b>Step 2:</b> Select the Lecture
            </div>
          </div>
          <div className="row" style={{ marginTop: "2vh" }}>
            <div className="col" style={{ fontSize: "20px" }}>
              {renderLectures}
            </div>
          </div>
          <div className="row" style={{ marginTop: "3vh", fontSize: "25px" }}>
            <div className="col">
              <b>Step 3:</b> Fix the study duration
            </div>
          </div>
          <div className="row" style={{ marginTop: "1vh" }}>
            <div className="col" style={{ fontSize: "20px" }}>
              {timeInput}
            </div>
          </div>
        </div>
      </React.Fragment>
    );

    return (
      <React.Fragment>
        <Navbar debug={this.state.debug} logout={this.handleLogout} />
        <div className="container">
          <div
            className="row"
            style={{ marginTop: "8vh", marginBottom: "5vh" }}
          >
            <div className="col text-center">
              <h1>
                <b>Study Session</b>
              </h1>
            </div>
          </div>
          <div className="row">
            <div className="col-6">
              <button
                id="individual"
                type="button"
                className="btn btn-primary btn-lg active"
                style={{ marginRight: "1vh" }}
                onClick={this.handleMode}
              >
                Individual Session
              </button>
              <button
                id="group"
                type="button"
                className="btn btn-lg btn-primary"
                disabled
              >
                Group Session
              </button>

              <div className="row">
                <div className="col">{indiv}</div>
              </div>
            </div>
            <div className="col-6 text-center">
              <h2 style={{ fontWeight: "bold" }}>Past Sessions</h2>
              <li
                className="list-group alert alert-warning"
                style={{ marginTop: "2vh" }}
              >
                Microprocessors Lecture 1
              </li>
              <li
                className="list-group alert alert-warning"
                style={{ marginTop: "1vh" }}
              >
                Semiconductors Lecture 1
              </li>
              <li
                className="list-group alert alert-warning"
                style={{ marginTop: "1vh" }}
              >
                Semiconductors Lecture 3
              </li>
              <li
                className="list-group alert alert-warning"
                style={{ marginTop: "1vh" }}
              >
                Microprocessors Lecture 2
              </li>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default ExamPrep;
