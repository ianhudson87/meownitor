/* App.js */
import React, {Component} from 'react'
import LineChartTemplate from './Components/LineChartTemplate';

class App extends Component {
  constructor(props){
    super(props)
    this.state = {
      "data": null
    }
  }

  componentDidMount(){
    fetch("/api") // looks at the "proxy" field in the package.json to know the address/port
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
  }

	render() {
		return (
      <LineChartTemplate data={this.state.data}/>
		);
	}
}
export default App;