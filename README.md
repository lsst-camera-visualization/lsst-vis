# Back End 

This directory contains all the function and algorithm that are being used by the server side. In addtion there is a dispatcher file that parse the command from JSON format into specific tasks and perform in python (or any other environment if possible).
### Dispatcher

>We have extended Firefly to allow getting image, table, or JSON (any data in JSON format) from an external process. Whenever server-side Firefly receives an external task request, it checks its properties to find the executable, which is then launched with the JSON task parameters passed from the client.
>
According to [LSST Firefly documentation](https://github.com/lsst/firefly/blob/master/docs/firefly-external-task-launcher.md#server-side-python-task-launcher-interface-with-firefly), we need to have an external task launcher `dispatcher.py` on server side to follow the firefly protocol and do the communication between actual client side and actual requested tasks.

### Other files
The rest of the files are all the actualy backend functions. 
- [ ] Refactor and orangize the code.

### Data Volume in Docker
We also implemented a virtualized environment in [Docker image](https://github.com/lsst-camera-visualization/lsst_firefly). The Docker image is to support portability. Both the backend directory and front directory are attached to Docker container as separate data volumes so that we can modify the code with any immediate change.    
- [ ] Add more detailed documentation on Docker. 
