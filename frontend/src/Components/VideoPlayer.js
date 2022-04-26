/* VIdeoPlayer.js */
import React, {Component} from 'react';
import AWS from 'aws-sdk'
import ReactHlsPlayer from 'react-hls-player'
import stream_options from '../secrets/secrets'
import {socket} from '../socket'

const streamName = 'catcam';
const playbackMode = 'LIVE'    

class VideoPlayer extends Component {
    constructor(props){
        super(props)
        this.state = {
            streamURL: ""
        }
        this.setStreamURL = this.setStreamURL.bind(this)
    }

    setStreamURL(){
        // Step 1: Configure SDK Clients
        var kinesisVideo = new AWS.KinesisVideo(stream_options);
        var kinesisVideoArchivedContent = new AWS.KinesisVideoArchivedMedia(stream_options);

        console.log('Fetching data endpoint');
        kinesisVideo.getDataEndpoint({
            StreamName: streamName,
            APIName: "GET_HLS_STREAMING_SESSION_URL"
            }, (err, response) => {
                if (err) { return console.error(err); }
                console.log('Data endpoint: ' + response.DataEndpoint);
                kinesisVideoArchivedContent.endpoint = new AWS.Endpoint(response.DataEndpoint);

                kinesisVideoArchivedContent.getHLSStreamingSessionURL({
                    StreamName: streamName,
                    PlaybackMode: playbackMode,
                    HLSFragmentSelector: {
                        FragmentSelectorType: 'SERVER_TIMESTAMP',
                        TimestampRange: playbackMode === "LIVE" ? undefined : {
                            StartTimestamp: new Date(),
                            EndTimestamp: new Date()
                            }
                        },
                        ContainerFormat: 'FRAGMENTED_MP4',
                        DiscontinuityMode: 'NEVER',
                        DisplayFragmentTimestamp: 'NEVER',
                        MaxMediaPlaylistFragmentResults: 5,
                        Expires: 300
                    }, (err, response) => {
                        if (err) { return console.error(err); }
                        // streamURL = response.HLSStreamingSessionURL
                        this.setState({streamURL: response.HLSStreamingSessionURL})
                        console.log('HLS Streaming Session URL: ' + response.HLSStreamingSessionURL);
                        socket.emit('set_stream_url', {
                            'url': response.HLSStreamingSessionURL,
                        })
                    }
                )
            }
        )
    }

    componentDidMount(){
        this.setStreamURL()
    }

    render() {
        console.log("streamurl", this.state.streamURL)
        return(
            <div>
            {/* <ReactHlsPlayer
                src={this.state.streamURL}
                autoPlay={true}
                controls={true}
                width="80%"
                height="auto"
            /> */}
            <img width={640} height={480} src="http://172.27.62.203:8000/stream.mjpg" style={{
                transform: 'rotate(180deg)'
            }}/>
            {/* <img width={640} height={480} src="https://media.istockphoto.com/photos/cat-world-picture-id1311993425?b=1&k=20&m=1311993425&s=170667a&w=0&h=vFvrS09vrSeKH_u2XZVmjuKeFiIEjTkwr9KQdyOfqvg="
                style={{
                    padding: "10px",
                    backgroundColor: "blue",
                    transform: 'rotate(90deg)'
                }}
            /> */}
            
            </div>
        )
	}
}
export default VideoPlayer;