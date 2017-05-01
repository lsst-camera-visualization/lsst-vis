# How to update from old frontend
Before updating, check out the [README](https://github.com/lsst-camera-visualization/lsst_firefly#lsst-firefly) for deployment if haven't done so.
## Update to latest code
1. Pull the lastest frontend code `git pull origin master`
2. Run the command `npm install`
3. (For developement) run `npm run build`
4. Add a rule to the tomcat server.xml file
```html
    <Context docBase="/path/to/frontend/src/" path="static/" />
```
5. Check out the [lastest backend code](https://github.com/lsst-camera-visualization/backend).
6. Edit the app.prop so that python backend script now points to 
<pre>
    /path/to/backend/<b>src</b>/dispatcher.py
</pre>

## To Run:
1. Restart tomcat server (only if you just updated `server.xml`)
2. Go to **[localhost:8080/static](http://localhost:8080/static)**

# Developer notes
## Extension types:
```
    *.commands.js - Commands to be entered through the terminal
    *.actions.js - Redux action creators
    *.container.js - Redux containers for React components
    *.reducer.js - Redux reducers
```
## Filesystem:
```
    __tests__/ - Test files
    src/ - Source code
        css/ - CSS files
        js/ - JavaScript Files
            actions/ - Redux action creators
            commands/ - Terminal commands
            components/ - React components
            containers/ - Redux containers for React components
            reducers/ - Redux reducers
            util/ - Utility files
            client.js - Application entrance
            store.js - The Redux store
    client.min.js - Minified ES5 code that will run on the browser
    commands.json - Terminal command descriptions
    parameters.json - Terminal parameter descriptions
    index.html - HTML file
```
## How to implement a new command:
1. Add command description into commands.json
2. **Make action creator (*.actions.js)**
3. Add command implementation (/commands)
4. Add command entry to commandDispatcher.js
5. **Implement command in reducer (*.reducer.js)**
   - **Not for backend tasks**

## To remove logger:
Set `bUseLogger` to false in **client.js**.
