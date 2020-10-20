import React, { Component } from 'react';
import Particles from 'react-particles-js';


class Background extends Component {
  
    render() {
      return (
        <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%"
        }}
      >
        <Particles id="bubbles" style={{backgroundColor: 'black'}} 
            params={{
                particles: {
                    number: {value: 100,density: {enable: false, value_area:1500}},
                    size: {value: 2,random: true,anim: {speed: 4,size_min: 0.3}},
                    line_linked: {enable: false, opacity:0.02},
                    move:{direction:"right", speed:0.05},
                },
                interactivity: {

                },
                retina_detect: true
             }} 
             height='100vh'/>
    </div>

      );
    }
  }
  
  export default Background;


//   params={{
//     "particles": {
//         "opacity": {
//             "anim": {
//                 "enable": true,
//                 "speed": 1,
//                 "opacity_min": 0.05
//             }
//         }
//     },
//     "interactivity": {
//         "events": {
//             "onclick": {
//                 "enable": true,
//                 "mode": "push"
//             }
//         },
//         "modes": {
//             "push": {
//                 "particles_nb": 1
//             }
//         }
//     },
// }}