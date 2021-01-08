import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import NavBar from "../../components/navbar/navbar";

class Home extends Component {
  state = {
    email: "",
    userdata: {},
    debug: "",
    uploads: [],
    uploadfiles: [],
    currentCourse: "",
    error: false,
    addCourse: false,
    userCourse: "",
    uploading: false,
  };

  componentWillMount() {
    if (
      sessionStorage.getItem("debug") !== undefined &&
      sessionStorage.getItem("userdata") !== undefined &&
      sessionStorage.getItem("email") !== undefined
    ) {
      this.setState({
        email: sessionStorage.getItem("email"),
        userdata: JSON.parse(sessionStorage.getItem("userdata")),
        debug: sessionStorage.getItem("debug"),
        reload: sessionStorage.getItem("reload"),
      });
    }
  }

  onChangeHandler = (event) => {
    this.state.uploads.push({
      file: event.target.files[0],
      course: this.state.currentCourse,
    });
    this.setState({
      uploadfiles: [...this.state.uploadfiles, event.target.files[0].name],
    });
  };

  handleCourseError = (file) => {
    return file;
  };

  handleUpload = (event) => {
    this.state.uploads.map((file) => {
      const data = new FormData();
      data.append("file", file.file);

      if (file.course !== "") {
        let url =
          "http://0.0.0.0:10000/extract?course=" +
          String(file.course) +
          "&email=" +
          String(this.state.email);
        this.setState({
          uploading: true,
        });
        fetch(url, {
          method: "PUT",
          body: data,
        }).then((response) => {
          response.json().then((body) => {
            console.log("API debug code:", body.code, file);
            let url =
              "http://0.0.0.0:10000/integrate?email=" +
              String(this.state.email) +
              "&course=" +
              String(file.course);
            fetch(url, {
              method: "GET",
              dataType: "json",
            })
              .then((res) => res.json())
              .then((data) => {
                sessionStorage.setItem("reload", true);
                this.setState({ uploading: false });
              });
          });
        });
      } else {
        this.setState({
          error: true,
        });
      }
      return 0;
    });
  };

  handleSelection = (event) => {
    this.setState({
      currentCourse: event.target.id,
    });
  };

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

  addCourse = () => {
    this.setState({
      addCourse: !this.state.addCourse,
    });
  };

  handleAddCourse = () => {
    let url =
      "http://0.0.0.0:10000/addcourse?course=" +
      this.state.userCourse +
      "&email=" +
      this.state.email;

    fetch(url, {
      method: "PUT",
      dataType: "json",
    })
      .then((res) => res.json())
      .then((data) => console.log("updated", data.debug))
      .then(sessionStorage.setItem("reload", true));
  };

  handleCourseChange = (event) => {
    this.setState({
      userCourse: event.target.value,
    });
  };

  handleReload = () => {
    console.log("sending api");
    fetch("http://0.0.0.0:10000/getData?email=" + this.state.email, {
      method: "GET",
      dataType: "json",
    })
      .then((res) => res.json())
      .then((data) => {
        sessionStorage.setItem("userdata", JSON.stringify(data));
        this.setState({
          userdata: data,
        });
        sessionStorage.setItem("reload", false);
      });
  };

  render() {
    if (this.state.debug !== "200") {
      return <Redirect to={{ pathname: "/login" }} />;
    }

    let userCourse = null;
    const reload = sessionStorage.getItem("reload");

    if (reload === "true") {
      this.handleReload();
    }

    if (this.state.addCourse) {
      userCourse = (
        <div className="input-group mb-3" style={{ marginTop: "10px" }}>
          <input
            type="text"
            className="form-control"
            placeholder="Course Name"
            aria-label="Course Name"
            aria-describedby="button-addon2"
            onChange={this.handleCourseChange}
          />
          <div className="input-group-append">
            <button
              className="btn btn-outline-secondary"
              type="button"
              id="button-addon2"
              onClick={this.handleAddCourse}
            >
              Add Course
            </button>
          </div>
        </div>
      );
    }

    if (this.state.uploads.length > 0) {
      let filenames = [];
      Array.from(this.state.uploads).forEach((file) =>
        filenames.push(file.file.name)
      );
      var fileList = filenames.map(function (filename) {
        return (
          <li className="list-group-item alert alert-success">{filename}</li>
        );
      });
    }

    if (this.state.userdata.courses.length > 0) {
      let courses = this.state.userdata.courses;
      var courseList = courses.map((course) => {
        if (this.state.currentCourse === course.course_name) {
          return (
            <button
              className="dropdown-item active"
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
            className="dropdown-item "
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

    return (
      <React.Fragment>
        <NavBar debug={this.state.debug} logout={this.handleLogout} />
        <div className="container">
          <div className="row" style={{ marginTop: "10vh" }}>
            <div className="col text-center">
              <h1>
                <b>Welcome {this.state.userdata.username} !</b>
              </h1>
            </div>
          </div>

          <div
            className="row justify-content-center"
            style={{ marginTop: "2vh" }}
          >
            <div className="col-4 text-center">
              <div className="row justify-content-center">
                <h3>
                  <b>Add Documents</b>
                </h3>
              </div>

              <div
                className="row justify-content-center"
                style={{ marginTop: "20px" }}
              >
                <div className="custom-file">
                  <input
                    type="file"
                    className="custom-file-input"
                    name="file"
                    onChange={this.onChangeHandler}
                  />
                  <label className="custom-file-label">Choose file</label>
                </div>

                <button
                  type="button"
                  onClick={this.handleUpload}
                  className="btn btn-primary"
                  style={{ marginTop: "20px" }}
                >
                  Upload Files
                </button>
                <div className="btn-group">
                  <button
                    type="button"
                    className="btn btn-success dropdown-toggle"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                    style={{ marginTop: "20px", marginLeft: "10px" }}
                  >
                    courses
                  </button>
                  <div className="dropdown-menu">
                    {courseList}
                    <div className="dropdown-divider"></div>
                    <button
                      className="dropdown-item"
                      type="button"
                      onClick={this.addCourse}
                    >
                      Add course
                    </button>
                  </div>
                </div>
              </div>

              <div
                className="row justify-content-center"
                style={{ marginTop: "10px" }}
              >
                {userCourse}
              </div>
            </div>

            <div className="col-6 text-center">
              <h3>
                <p>
                  <b> Upload List</b>
                </p>
              </h3>

              <div className="row justify-content-center">
                <div className="col-5">
                  <div className="list-group">
                    {this.state.uploading ? (
                      <div style={{ marginTop: "6vh" }}>
                        <div class="spinner-border text-primary" role="status">
                          <span class="sr-only">Loading...</span>
                        </div>
                      </div>
                    ) : (
                      fileList
                    )}
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

export default Home;
