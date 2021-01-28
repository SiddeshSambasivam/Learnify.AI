import React, { Component } from "react";
import Graph from "../../components/graph/graph";
import { Redirect } from "react-router-dom";

class Session extends Component {
  state = {
    email: "",
    userdata: {},
    debug: "400",
    width: "",
    height: "",
    sessionVars: this.props.sessionVars,
    currentGraph: {
      nodes: [],
      links: [],
    },
    exit: false,
    sessionData: this.props.sessionData,
    sessionState: {},
    speed: 2.5,
    topics: 3,
    showSummary: false,
    summary: "",
    checkList: [],
  };

  componentWillMount() {
    var topics = Math.floor(
      parseInt(this.props.sessionVars.duration) * this.state.speed
    );
    this.setState({
      email: sessionStorage.getItem("email"),
      userdata: JSON.parse(sessionStorage.getItem("userdata")),
      debug: sessionStorage.getItem("debug"),
      width: window.innerWidth,
      height: window.innerHeight,
      topics: topics,
      // sessionData: dumps, // comment it out after dev
    });

    var data = this.props.sessionData;
    console.log("dumps => ", data, Object.keys(data).length, topics);

    if (topics <= Object.keys(data).length) {
      console.log("selected => ", data[topics]);
      this.setState({
        sessionState: data[String(topics)],
        currentGraph: data[topics].graph,
      });
      console.log("selected => ", data[topics]);
    }

    // make api call with the sessionvars and get the graph
    // each node in the graph should be list in the sidebar
  }

  handleExit() {
    this.setState({
      exit: true,
    });
  }

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
      console.log(
        "Query: ",
        this.state.userdata.courses[tmp].course_name,
        this.props.sessionVars.course
      );

      if (
        this.state.userdata.courses[tmp].course_name ===
        this.props.sessionVars.course
      ) {
        var query = this.state.userdata.courses[tmp]["keywords"][id];
        console.log("Query 1: ", this.state.userdata.courses[tmp], id);
        console.log(
          "Query 2: ",
          this.state.userdata.courses[tmp]["keywords"][id]
        );
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

  reduceContent = () => {
    var val = this.state.topics - 1;
    var data = this.props.sessionData;
    console.log("dumps => ", data, Object.keys(data).length, val);
    if (val <= Object.keys(data).length) {
      console.log("selected => ", data[val]);
      this.setState({
        sessionState: data[String(val)],
        currentGraph: data[val].graph,
        topics: val,
      });
      console.log("selected => ", data[val]);
    }
  };

  addContent = () => {
    var val = this.state.topics + 1;
    var data = this.props.sessionData;
    console.log("dumps => ", data, Object.keys(data).length, val);
    if (val <= Object.keys(data).length) {
      console.log("selected => ", data[val]);
      this.setState({
        sessionState: data[String(val)],
        currentGraph: data[val].graph,
        topics: val,
      });
      console.log("selected => ", data[val]);
    }
  };

  deletenode = (e) => {
    console.log(e.target.id);
    var newNodes = [];
    console.log("before", this.state.currentGraph["nodes"]);
    for (var i in this.state.currentGraph["nodes"]) {
      var ele = this.state.currentGraph["nodes"][i];
      if (ele["id"] !== e.target.id) {
        newNodes.push(this.state.currentGraph["nodes"][i]);
      } else {
        var tmp = this.state.checkList;
        tmp.push(ele["id"]);
        console.log("before checklist", this.state.checkList);
        console.log("After checklist", tmp);
        this.setState({
          checkList: tmp,
        });
      }
    }

    this.setState({
      currentGraph: {
        nodes: newNodes,
        links: this.state.currentGraph["links"],
      },
    });
  };

  render() {
    console.log("Check", this.state.currentGraph["nodes"]);
    if (this.state.debug !== "200") {
      return <Redirect to={{ pathname: "/login" }} />;
    }

    if (this.state.exit === true) {
      return <Redirect to={{ pathname: "/study" }} />;
    }

    if (this.state.sessionState !== {}) {
      var renderNodes = this.state.sessionState.nodesList.map((topic) => {
        console.log(this.state.checkList, topic);
        if (this.state.checkList.includes(topic)) {
          console.log(topic);
          return (
            <li class="list-group-item disabled" id={topic}>
              {topic}
              <button
                className="btn btn-success btn-sm disabled"
                id={topic}
                onClick={this.deletenode}
              >
                completed
              </button>
            </li>
          );
        }
        return (
          <li class="list-group-item" id={topic}>
            {topic}
            <button
              className="btn btn-success btn-sm active"
              id={topic}
              onClick={this.deletenode}
            >
              completed
            </button>
          </li>
        );
      });
    }

    return (
      <React.Fragment>
        <div className="contianer">
          <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <a href="/" className="navbar-brand">
              Learnify.ai
            </a>
            <button
              className="navbar-toggler"
              type="button"
              data-toggle="collapse"
              data-target="#navbarSupportedContent"
              aria-controls="navbarSupportedContent"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            <div
              className="collapse navbar-collapse"
              id="navbarSupportedContent"
            >
              <ul className="navbar-nav mr-auto">
                <li className="nav-item active">
                  <a href="/study" className="navbar-brand">
                    Study Session
                  </a>
                  <span className="sr-only">(current)</span>
                </li>
              </ul>
              <form className="form-inline my-2 my-lg-0">
                <button
                  className="btn btn-outline-danger my-2 my-sm-0"
                  type="submit"
                  onClick={this.handleExit}
                >
                  exit
                </button>
              </form>
            </div>
          </nav>
        </div>

        <div className="container-fluid">
          <div className="row">
            <div className="col-4" style={{ marginTop: "1vh" }}>
              <h1 className="list-group-item list-group-item-primary">
                Topics
              </h1>
              <ul class="list-group">{renderNodes}</ul>
              <h1
                className="list-group-item list-group-item-primary"
                style={{ marginTop: "2vh" }}
              >
                Add topics
              </h1>
              <button
                id="individual"
                type="button"
                className="btn btn-primary btn-lg active"
                style={{ marginRight: "1vh" }}
                onClick={this.addContent}
              >
                Add Topic
              </button>
              <button
                id="group"
                type="button"
                className="btn btn-lg btn-primary"
                onClick={this.reduceContent}
              >
                Delete Topic
              </button>
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

export default Session;
