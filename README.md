# lsst-vis
An integration of both frontend and backend code for deploying a LSST visualization server. It needs the use of Firefly as a framework for displaying FITS images.


## Basic coding structure

The whole application is based on the web technology. The application is built on top of [Firefly][3]. To facilitate the use of firefly, we plan to use the [Docker][4] for deployment and development. It creates an clean virtual environment and glues the front end and back end code together.

The image is available on [Docker hub][7] and for interest, please look at the [Dockerfile][8] that created this image. To build your own docker image from the dockerfile, use `docker build -t <tag> .` and excute this command in the same directory of dockerfile.

User can also replicate the procedures in the dockerfiles to deploy this LSST visualization framework on a local machine instead of in a virtualized docker container. Please see the section [installation on local machine](#on-local-machine).

# Installation

## Using Docker Engine
Currently the following instruction assumes Linux/Unix system. The shell script might not be compatible with other types of operating systems. Note that **Docker requires Linux kernel 3.10 or higher** to be able to run. Check [here][9] for dependencies.

1. Follow the instruction on [Docker][4] and download Docker engine based on your OS. Detailed information on Docker is also available on the [documentation page][10].
2. clone this repository and go into it `git clone --recursive https://github.com/lsst-camera-visualization/lsst_firefly.git <your repository> && cd <your repository>`
3. start the Docker virtual machine service (for linux, it is `service docker start` (may require root privilege), for other operating systems, look at the [official documentation][10])
4. run `./install.sh`

Now you can start the server.

### Start and Stop

To run the program/server, `cd <your directory>`(the repository cloned from GIT), and run `./start.sh <port number>`, and go to `http://localhost:<port number>` to see the result

To stop the program, run `./stop.sh &` and it will also stop the docker container for this image.

If you want to login into the docker container to debug interactively, run:
```bash
docker exec -it firefly bash
```
This will drop the user to a bash shell inside the docker virtual machine.

## On local machine
Alternatively, the procedures in the Dockerfile can be reproduced on local machine but the user has to take care of those commands.

1. First build `firefly.war` based on the instruction of [Firefly][3]. Dependencies and commands are also listed on the page. After building `firefly.war`, Oracle Java 8 should exist in the `$PATH` and Tomcat will be able to find it.
2. Check out the lastest version of [front end][1] and [back end][2] code.
3. Deploy [Tomcat 7+][13] on local machine either by package manager or downloading the binary from [Tomcat website][12]. Before starting Tomcat server, we need to modify `$CATALINA_HOME/conf/server.xml` to specify the code directory.
    - If you install Tomcat using package manager, look for the directory where Tomcat configuration file exists. For example, `/etc/tomcat7/server.xml` is the server configuration of `tomcat7` installed by `apt-get` on Ubuntu 14.04.
    - Otherwise you should be aware of where `$CATALINA_HOME` points to. For example, if you use the binary downloaded from Tomcat official website, environmental variable `$CATALINA_HOME` can be set to the directory where tomcat files being extracted and `$CATALINA_HOME/conf/server.xml` is the configuration file.

    You can also change the port 8080 to other ports (port number under 1024 usually requires root privilege).

4. Copy `firefly.war` (built in step 1) to `$CATALINA_HOME/webapps`.
5. Add the following line in the `<Host> ... </Host>` block in  `$CATALINA_HOME/conf/server.xml`:

    ```xml
    <Context docBase="/path/to/your/frontend/code" path="/name of the app" />
    ```
    For instance, if you check out the front end code into `/home/user_name/lsst/frontend`, then the line would be:
    ```xml
    <Context docBase="/home/user_name/lsst/frontend/src" path="/static" />
    ```

6. In order to communicate between front end and back end (python scripts), Firefly needs to know python path and scripts. This is defined in the `app.prop` file. You can provide tomcat with a user defined `app.prop` for Firefly during runtime.

- Edit the last line of this [example file](s_build_Essential/app.prop) or `$CATALINA_HOME/webapps/firefly/WEB-INF/config/app.prop`(if it exisits):
    ```
    python.exe= "/path/to/python /home/user_name/lsst/backend/src/dispatcher.py"
    ```
    - Note: make sure your path to `python` and `dispatch.py` is correct.
    - Look at [documentation from Firefly][14] if you want to change how firefly handles FITS files.

- Then copy this modified `app.prop` into another `firefly` directory. For example, I used `/home/user_name/lsst/server_config/firefly/`, but it could be anywhere as long as it is under a sub-directory `....../firefly/`.
- Modify or create (if it does not exist) `setenv.sh`. Append (note that sub-directory `firefly` does not appear in the `JAVA_OPTS`)

    ```shell
    JAVA_OPTS="-Dserver_config_dir=/home/user_name/lsst/server_config"
    ```
 where the argument inside must be the same as configuration directory (the same directory you just put `app.prop` in).

Now you can start the server.

### Start and Stop

To run the program/server, change direcotry to tomcat scripts by `cd $CATALINA_HOME/bin`. Run `./startup.sh` to start tomcat server. Make sure you have java enviroment before starting.

 - If you install tomcat through package manager, it is likely that tomcat will automatically running in the backend when OS starts. (Otherwise, you can also change the startup file `/etc/init.d/tomcat`.)

To stop, run `./shutdown.sh` (also in `$CATALINA_HOME/bin`). This will stop the tomcat server.

# Issues

Please use [Github Issues][11] for any bug or improvement.

# Currently known issue

+ ~~When killing the docker instance, there will be a defunct java process. The process is defunt at the moment but the zombie process presists. Current work around is restart the docker server (or to retart the machine).~~

[1]: https://github.com/lsst-camera-visualization/frontend
[2]: https://github.com/lsst-camera-visualization/backend
[3]: https://github.com/Caltech-IPAC/firefly
[4]: https://docs.docker.com/engine/installation/
[7]: https://hub.docker.com/r/victorren/ff_server/
[8]: https://github.com/lsst-camera-visualization/lsst_firefly/blob/master/Dockerfile
[9]: https://docs.docker.com/engine/installation/binaries/
[10]: https://docs.docker.com/engine/
[11]: https://github.com/lsst-camera-visualization/lsst_firefly/issues
[12]: https://tomcat.apache.org/download-70.cgi
[13]: https://tomcat.apache.org
[14]: https://github.com/Caltech-IPAC/firefly/blob/dev/docs/server-settings-for-fits-files.md
