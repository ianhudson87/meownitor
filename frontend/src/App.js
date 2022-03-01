/* App.js */
import React, {Component} from 'react';
import LineChartTemplate from './Components/LineChartTemplate'
import io from "socket.io-client";
import { LineChart } from 'recharts';

console.log("node_env:", process.env.NODE_ENV)

let ENDPOINT
switch(process.env.NODE_ENV) {
  case 'production':
    ENDPOINT = 'http://ec2-52-204-45-92.compute-1.amazonaws.com:8080';
    break;
  case 'development':
  default:
    ENDPOINT = 'http://localhost:8080';
}

class App extends Component {
  constructor(props){
    super(props)
    this.state = {
      "data": null,
      "steps": null,
      "steps_history": [],
      "isActive": false,
    }
  }

  addData(){
    let current_data = this.state.data
    current_data.push({
      name: 'Page A',
      uv: 500,
      pv: 300,
      amt: 300,
    },)
    this.setState({
      "data": current_data
    })
    // console.log(this.state.data)
  }

  getSteps(){
    fetch(`${ENDPOINT}/data/steps`)
    .then(res => res.json())
    .then(
        (results) => {
          // console.log(results)
          results.data.sort((a, b) => {
            switch(parseInt(a.sort) < parseInt(b.sort)){
              case true:
                return -1
              case false:
              default:
                return 1
            }
            // oldest first
            // return a.sort < str(b.sort)
          })
          console.log(results.data)
          this.setState({
            "steps": results.data[results.data.length-1].payload,
            "steps_history": results.data.map((item) => {
              return ({
                name: item.sort,
                steps: item.payload,
              })
            })
          })
          console.log(this.state)
        },
        (error) => {
          console.log(error)
        }
    )
  }

  componentDidMount(){
    // connect to socket
    this.getSteps()
    const socket = io(ENDPOINT);

    socket.on("connect", () => {
      console.log("hi, i just connected to sock it")
    })

    socket.on("became_active", () => {
      this.setState({
        "isActive": true
      })
    })

    socket.on("became_not_active", () => {
      this.setState({
        "isActive": false
      })
    })

    // get steps

    // get request for data
    fetch(`${ENDPOINT}/data/test/checkthisout`)
    .then(res => res.json())
    .then(
        (results) => {
          this.setState({
            "data": results.data
          })
          console.log(results)
        },
        (error) => {
          console.log(error)
        }
    )

    setInterval(() => {
      // this.addData()
      this.getSteps()
      /*
          Run any function or setState here
      */
    }, 60000);
  }

  

	render() {
		return (
      <div>
        <LineChartTemplate key={this.state.data} data={this.state.data} data_key={"pv"}/>
        <LineChartTemplate key={this.state.steps_history} data={this.state.steps_history} data_key={"steps"}/>
        Your kitty has taken {this.state.steps} steps!
        <div>
        Your kitty is currently {this.state.isActive ? <h1 style={{ color: 'green' }}>active</h1> : <h1 style={{ color: 'red' }}>sleeping or something</h1>}
        </div>
      </div>
		);
	}
}
export default App;