import {React, Component } from 'react';
import {socket} from '../socket';
import GaugeChart from 'react-gauge-chart'

const minTemp = 10
const maxTemp = 40
const minHumidity = 15
const maxHumidity = 35
const minPressure = 900
const maxPressure = 1100

class AirQuality extends Component {
    constructor(props){
      super(props)
      this.state = {
          'temp': 50,
          'humidity': 0,
          'pressure': 0,
      }
    }

    componentDidMount(){
        socket.on("send_air_quality", (data)=>{
            console.log("here")
            console.log(data)
            this.setState({
                'temp': data.temp,
                'humidity': data.humidity,
                'pressure': data.pressure,
            })
        })
    }

    render(){
        return(
            <div>
            <GaugeChart id="gauge-chart-temp"
                nrOfLevels={maxTemp - minTemp}
                arcsLength={[0.40, 0.4, 0.2]}
                animate={false}
                colors={['#3355FF', '#5BE12C', '#EA4228']}
                percent={(this.state.temp - minTemp) / (maxTemp - minTemp)}
                formatTextValue = {value => this.state.temp.toFixed(2) + "C"}
                arcPadding={0.02}
            />
            <GaugeChart id="gauge-chart-humidity"
                nrOfLevels={maxHumidity - minHumidity}
                arcsLength={[0.3, 0.4, 0.3]}
                animate={false}
                colors={['#5BE12C', '#F5CD19', '#EA4228']}
                percent={(this.state.humidity - minHumidity) / (maxHumidity - minHumidity)}
                formatTextValue = {value => this.state.humidity.toFixed(2) + "%"}
                arcPadding={0.02}
            />
            <GaugeChart id="gauge-chart-pressure"
                nrOfLevels={maxPressure - minPressure}
                arcsLength={[0.3, 0.45, 0.25]}
                animate={false}
                colors={['#5BE12C', '#F5CD19', '#EA4228']}
                percent={(this.state.pressure - minPressure) / (maxPressure - minPressure)}
                formatTextValue = {value => this.state.pressure.toFixed(2) + "hPA"}
                arcPadding={0.02}
            />
            </div>
        )
    }

}

export default AirQuality;