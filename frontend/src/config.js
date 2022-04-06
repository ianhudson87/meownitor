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

export {ENDPOINT}