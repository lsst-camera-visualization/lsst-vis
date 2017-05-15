#!/bin/bash

function display_usage() {
	echo -e "\nUsage: $0 taskName\n"
}

if [[ ( $1 == "--help") ||  $1 == "-h" ]]
then
	display_usage
	exit 0
fi

TASKNAME=$1
FILENAME="src/task_scripts/$TASKNAME.py"
TASKS_FILENAME="src/tasks.py"

cat > ${FILENAME} << EOL



def task(filename, taskParams):
	'''
	@author
	@param task_params -
	@return
	'''


EOL


# Add this task to backend/tasks.py
sed -i '1 i from task_scripts.'$TASKNAME' import task as task_'$TASKNAME'' $TASKS_FILENAME
sed -i '/_tasks = {}/ a _tasks["'$TASKNAME'"] = task_'$TASKNAME'' $TASKS_FILENAME
