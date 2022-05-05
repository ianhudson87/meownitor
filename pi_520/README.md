# Meownitor Raspberry Pi

This directory contains the files we created in order to gather data from our sensors and send it to our website.

## Installation Instructions
1. Follow the installation instructions from [this link](https://docs.aws.amazon.com/iot/latest/developerguide/connecting-to-existing-device.html) to set up the Raspberry Pi and the necessary permissions from your AWS account.
  * Ensure you know the paths for the key and cert files
2. Install the necessary python dependencies from requirements.txt using ``pip3 install -r /path/to/requirements.txt``
3. Connect the camera to the pi camera port
4. Wire the BME 280 and MMA 8452Q sensors according to the diagram below
![image](https://user-images.githubusercontent.com/54560896/166551734-72d77cc6-c20f-444b-b33e-dd5c0c0e7dbf.png)

## How to run
To run the necessary files, multiple scripts have to be run at the same time. This can be achieved using screen or the & operator at the end of the command, and we chose the second option.  
**Before you can run these, the aws endpoint needs to be changed in `temp.sh` and `step.sh`. Your key and cert files will not work with the given endpoint**  
`sh step.sh &> step.out &`  
`sh temp.sh &> temp.out &`  
`python3 rpi_cam.py &> vid.out &`  
