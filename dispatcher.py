import json
import os
from optparse import OptionParser
import sys
import tempfile
import tasks



usage = "usage: %prog [options]"
parser = OptionParser(usage=usage)

# TODO: Consider swithcing to argparse since optparse is deprecated.

# add parameter readings
parser.add_option("-d", "--work", dest="workdir",
                  help="work directory", metavar="DIR")
parser.add_option("-i", "--in", dest="infile",
                  help="json file with task params", metavar="FILE")
parser.add_option("-n", "--name", dest="task",
                  help="task name (no spaces)", metavar="TASK")
parser.add_option("-o", "--outdir", dest="outdir",
                  help="directory for the final output file", metavar="DIR")
parser.add_option("-s", "--sep", dest="separator", default='___TASK STATUS___',
                  help="separator string, after which task status is written",
                  metavar="STR")


# read the paremeters
(options, args) = parser.parse_args()
taskParams = None
with open(options.infile) as paramfile:
    taskParams = json.load(paramfile)


task_name = options.task

echo_debug = "echo "+ str(task_name) + " > /www/algorithm/debug_file"
os.system(echo_debug)

if (task_name == "average"):
    task = tasks.average_value
elif (task_name == "boundary"):
    task = tasks.boundary
else:
    task = tasks.tasks_test


result, error = task(taskParams)

# result,error = average_value(taskParams)
# os.system(echo_debug)

(fd, outfile) = tempfile.mkstemp(suffix=".json",
                                 prefix=options.task,
                                 dir=options.outdir)
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
