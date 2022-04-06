import {React, Component } from 'react';
import {socket} from '../socket';
import images from '../assets/images'

const num_gifs = 6

class IsActive extends Component {
    constructor(props){
      super(props)
      this.state = {
          'isActive': false,
          'gif_index': 0,
      }
    }

    randomize_gif(){
        this.setState({
            'gif_index': Math.floor(Math.random()*num_gifs)
        })
    }

    componentDidMount(){
        // connect to socket
        this.randomize_gif()

        socket.on("connect", () => {
            console.log("hi, i just connected to sock it, but it's over here")
        })

        socket.on("became_active", () => {
            this.randomize_gif()
            this.setState({
              "isActive": true
            })
        })
      
        socket.on("became_not_active", () => {
            this.randomize_gif()
            this.setState({
              "isActive": false
            })
        })
    }

    render(){
        let text = this.state.isActive ? <h1 style={{ color: 'green' }}>active</h1> : <h1 style={{ color: 'red' }}>sleeping or chilling</h1>
        let image = this.state.isActive ? images['active'][this.state.gif_index] : images['sleep'][this.state.gif_index]
        console.log("kitty is:", this.state.isActive)
        
        return(
            <div>
                <div>
                    Your kitty is currently {text}
                </div>
                <div>
                    <img src={image} height={150}/>
                </div>
            </div>

            // {text}
        )
        
    }

}

export default IsActive;