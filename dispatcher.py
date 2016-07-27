import json
import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__))+"/task_scripts")
import tempfile
from tasks import execute_task

import argparse

parser = argparse.ArgumentParser()
parser.add_argument("-d", "--work", dest="workdir", help="work directory")
parser.add_argument("-i", "--in", dest="infile", help="json file with task params")
parser.add_argument("-n", "--name", dest="task", help="task name (no spaces)")
parser.add_argument("-o", "--outdir", dest="outdir", help="directory for the final output file")
parser.add_argument("-s", "--sep", dest="separator", default="___TASK STATUS___", help="separator string, after which task status is written")

# read the parameters
options = parser.parse_args()

taskParams = None
with open(options.infile) as paramfile:
    taskParams = json.load(paramfile)

task_name = options.task

try:
    result, error = execute_task(task_name, taskParams)
except Exception as e:
    result = {"error": str(e)}

echo_debug = "echo "+ json.dumps(result) + " > /www/algorithm/debug_file"
os.system(echo_debug)

# result,error = average_value(taskParams)
# os.system(echo_debug)

(fd, outfile) = tempfile.mkstemp(suffix=".json", prefix=options.task, dir=options.outdir)
f = os.fdopen(fd, "w")

json.dump(result, f)

print(options.separator)
if error:
    status = {"error": error}
    print(json.dumps(status))
    sys.exit(1)
else:
    status = {"outfile": outfile}
    print(json.dumps(status))
