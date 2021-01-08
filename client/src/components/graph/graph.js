import React, { Component, createRef } from "react";
import ForceGraph3D from "react-force-graph-3d";
import SpriteText from "three-spritetext";

class Graph extends Component {
  state = { width: this.props.width, height: this.props.height };

  updateDimensions = () => {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  };
  componentDidMount() {
    window.addEventListener("resize", this.updateDimensions);
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }

  handleClick = (node) => {
    if (node) {
      const distance = 250;
      const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

      const sleep = (delay) =>
        new Promise((resolve) => setTimeout(resolve, delay));

      const wait = async (node) => {
        await sleep(3200);
        console.log("Waiting...");
        this.props.handleSummary(node["id"]);
      };

      wait(node);
      this.fgRef.current.cameraPosition(
        { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
        node, // lookAt ({ x, y, z })
        3000 // ms transition duration
      );
    }
  };

  fgRef = createRef();

  render() {
    if (this.props.data) {
      return (
        <React.Fragment>
          <ForceGraph3D
            ref={this.fgRef}
            onNodeClick={this.handleClick}
            height="100vh"
            width={0.667 * this.state.width}
            graphData={this.props.data}
            nodeAutoColorBy="group"
            nodeThreeObject={(node) => {
              const sprite = new SpriteText(node.id);
              sprite.color = node.color;
              sprite.textHeight = 8;
              return sprite;
            }}
          />
        </React.Fragment>
      );
    } else {
      return null;
    }
  }
}

export default Graph;
