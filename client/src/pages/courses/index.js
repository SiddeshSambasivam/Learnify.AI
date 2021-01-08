import React, { Component } from "react";
import Navbar from "../../components/navbar/navbar";
import Graph from "../../components/graph/graph";
import { Redirect } from "react-router-dom";
import "./style.css";

class Courses extends Component {
  state = {
    email: "",
    userdata: {},
    debug: "400",
    width: "",
    height: "",
    currentCourse: "",
    lectures: "",
    currentGraph: {
      nodes: [],
      links: [],
    },
    cache: {},
    showSummary: false,
    summary: "",
  };

  handleSelection = (event) => {
    this.setState({
      currentCourse: event.target.id,
    });
    console.log("course selected");
    for (var tmp in this.state.userdata.courses) {
      if (this.state.userdata.courses[tmp].course_name === event.target.id) {
        const graph = this.state.userdata.courses[tmp].courseGraph;
        this.setState({
          currentGraph: graph,
        });
        break;
      }
    }
  };

  componentWillMount() {
    this.setState({
      email: sessionStorage.getItem("email"),
      userdata: JSON.parse(sessionStorage.getItem("userdata")),
      debug: sessionStorage.getItem("debug"),
      width: window.innerWidth,
      height: window.innerHeight,
    });
    var courses = JSON.parse(sessionStorage.getItem("userdata"))["courses"];

    // Structure of the cache
    // {
    //     'course name':{
    //         "0":<graph>
    //     }
    // }

    var cus = {};
    for (var i in courses) {
      if (!(courses[i].course_name in cus)) {
        cus[courses[i].course_name] = {};
      }

      for (var j in courses[i].lectures) {
        cus[courses[i].course_name][j] = courses[i].lectures[j].graph;
      }
    }

    this.setState({ cache: cus });
  }

  handleLogout = () => {
    this.setState({
      debug: "400",
      userdata: {},
      email: "",
    });
    sessionStorage.setItem("email", "");
    sessionStorage.setItem("userdata", {});
    sessionStorage.setItem("debug", "400");
  };

  handleLecture = (event) => {
    this.setState({
      lectures: event.target.id,
      currentGraph: this.state.cache[this.state.currentCourse][event.target.id],
    });
  };

  handleReload = () => {
    fetch("http://0.0.0.0:10000/getData?email=" + this.state.email, {
      method: "GET",
      dataType: "json",
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("courses");
        sessionStorage.setItem("userdata", JSON.stringify(data));
        this.setState({
          userdata: data,
        });
        sessionStorage.setItem("reload", false);
      });
  };

  handleClose = () => {
    this.setState({
      showSummary: false,
    });
  };

  handleSummary = (id) => {
    this.setState({
      showSummary: true,
    });

    for (var tmp in this.state.userdata.courses) {
      if (
        this.state.userdata.courses[tmp].course_name ===
        this.state.currentCourse
      ) {
        var query = this.state.userdata.courses[tmp]["keywords"][id];
        const summary = (
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h2 className="modal-title">{id}</h2>
              </div>
              <div className="modal-body">
                <p style={{ fontSize: "20px" }}>{query}</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-dismiss="modal"
                  onClick={this.handleClose}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
        this.setState({
          summary: summary,
        });
        break;
      }
    }
  };

  render() {
    if (this.state.debug !== "200") {
      return <Redirect to={{ pathname: "/login" }} />;
    }
    var reload = sessionStorage.getItem("reload");
    if (reload === false) {
      this.handleReload();
    }

    var searchShow = false;
    if (this.state.currentCourse !== "") {
      searchShow = true;
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

      var renderLectures = query.map((lecture) => {
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

    return (
      <React.Fragment>
        <Navbar debug={this.state.debug} logout={this.handleLogout} />
        <div className="container-fluid">
          <div className="row">
            <div className="col-4" style={{ marginTop: "1vh" }}>
              <h1 className="list-group-item list-group-item-primary">
                Courses
              </h1>
              {courseNames}
              <h1
                className="list-group-item list-group-item-warning"
                style={{ marginTop: "5vh" }}
              >
                Lectures
              </h1>
              {renderLectures}
              {searchShow ? (
                <React.Fragment>
                  <h1
                    className="list-group-item list-group-item-success"
                    style={{ marginTop: "8vh" }}
                  >
                    Search Topic
                  </h1>
                  <div class="input-group mb-3">
                    <input
                      type="text"
                      class="form-control"
                      placeholder="Enter topic"
                      aria-label="Recipient's username"
                      aria-describedby="button-addon2"
                    />
                    <div class="input-group-append">
                      <button
                        class="btn btn-outline-secondary"
                        type="button"
                        id="button-addon2"
                      >
                        Search
                      </button>
                    </div>
                  </div>
                  <ul
                    style={{
                      maxHeight: "30vh",
                      marginBottom: "10px",
                      overflow: "scroll",
                      WebkitOverflowScrolling: "touch",
                    }}
                  ></ul>
                </React.Fragment>
              ) : null}
            </div>
            <div className="col-8">
              {this.state.showSummary ? (
                this.state.summary
              ) : (
                <Graph
                  height={this.state.height}
                  width={this.state.width}
                  data={this.state.currentGraph}
                  // data = {data}
                  handleSummary={this.handleSummary}
                />
              )}
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default Courses;
