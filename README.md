# Back End

This directory contains all the function and algorithm that are being used by the server side. In addtion there is a dispatcher file that parse the command from JSON format into specific tasks and perform in python (or any other environment if possible).

### Dispatcher

>We have extended Firefly to allow getting image, table, or JSON (any data in JSON format) from an external process. Whenever server-side Firefly receives an external task request, it checks its properties to find the executable, which is then launched with the JSON task parameters passed from the client.

According to [LSST Firefly documentation](https://github.com/lsst/firefly/blob/master/docs/firefly-external-task-launcher.md#server-side-python-task-launcher-interface-with-firefly), we need to have an external task launcher `dispatcher.py` on server side to follow the firefly protocol and do the communication between actual client side and actual requested tasks.

### Tasks
All tasks are put in their own separate files in the task_scripts/ directory. The entry point of all tasks a function called task, which takes in one parameter. This function should return a dictionary of necessary results, and an error if necessary.  

In order to create a new task, one must use the script called "generate_new_task.sh", passing in only the name of the new task. This script will create a file in task_scripts/, and add the task function and an empty docstring (fill it out!). In addition, it will add the task to list of executable tasks, so all that is necessary is run this script and write the code.


### Other files
The rest of the files are all the actualy backend functions.
- [ ] Refactor and orangize the code.

### Data Volume in Docker
We also implemented a virtualized environment in [Docker image](https://github.com/lsst-camera-visualization/lsst_firefly). The Docker image is to support portability. Both the backend directory and front directory are attached to Docker container as separate data volumes so that we can modify the code with any immediate change.    
- [ ] Add more detailed documentation on Docker.

### Known Issues
- [ ] Updating the python script might not be effective immediately. Probably due to file I/O issue with docker volume being attached. Both front end and back end code are attached as separate volume. 

### Python Conventions
We follow the conventions according to the [LSST definitions](https://developer.lsst.io/coding/python_style_guide.html#raise-valueerror-message-should-be-used-instead-of-the-deprecated-form).
