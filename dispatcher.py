import json
import os
from optparse import OptionParser
import sys
import tempfile
from tasks import tasks
import numpy as np
from astropy.io import fits

# def tasks(param):
#     return {'result': 'success'}, None

# Simple task calculating average value in a region.
# Boundary assumes the expected format being sent in.
def average_value(boundary):
    filename = "/www/static/images/image.fits"
    x_start, x_end = boundary[0], boundary[2]
    y_start, y_end = boundary[1], boundary[3]
    hdulist = fits.open(filename)
    region = hdulist[0].data[y_start:y_end, x_start:x_end]
    avg = str(np.mean(region))
    hdulist.close()
    return {"result":avg},None

def boundary(filename):
    return {"overscan_off":{"filename":"imageE2V_trimmed.fits","X_Y_dim_full":[4096,4004],"overscan":False,"X_Y_seg":[512,2002],"X_Y_seg_data":[512,2002],"data_seg_regions":[[[[3584,2002],[4096,4004]],[[3072,2002],[3584,4004]],[[2560,2002],[3072,4004]],[[2048,2002],[2560,4004]],[[1536,2002],[2048,4004]],[[1024,2002],[1536,4004]],[[512,2002],[1024,4004]],[[0,2002],[512,4004]]],[[[3584,0],[4096,2002]],[[3072,0],[3584,2002]],[[2560,0],[3072,2002]],[[2048,0],[2560,2002]],[[1536,0],[2048,2002]],[[1024,0],[1536,2002]],[[512,0],[1024,2002]],[[0,0],[512,2002]]]],"overscan_regions":None},"overscan_on":{"filename":"imageE2V_untrimmed.fits","X_Y_dim_full":[4352,4096],"overscan":True,"X_Y_seg":[544,2048],"X_Y_seg_data":[512,2002],"data_seg_regions":[[[[3818,2094],[4330,4096]],[[3274,2094],[3786,4096]],[[2730,2094],[3242,4096]],[[2186,2094],[2698,4096]],[[1642,2094],[2154,4096]],[[1098,2094],[1610,4096]],[[554,2094],[1066,4096]],[[10,2094],[522,4096]]],[[[3830,0],[4342,2002]],[[3286,0],[3798,2002]],[[2742,0],[3254,2002]],[[2198,0],[2710,2002]],[[1654,0],[2166,2002]],[[1110,0],[1622,2002]],[[566,0],[1078,2002]],[[22,0],[534,2002]]]],"overscan_regions":[[[[3808,2048],[4352,4096]],[[3264,2048],[3808,4096]],[[2720,2048],[3264,4096]],[[2176,2048],[2720,4096]],[[1632,2048],[2176,4096]],[[1088,2048],[1632,4096]],[[544,2048],[1088,4096]],[[0,2048],[544,4096]]],[[[3808,0],[4352,2048]],[[3264,0],[3808,2048]],[[2720,0],[3264,2048]],[[2176,0],[2720,2048]],[[1632,0],[2176,2048]],[[1088,0],[1632,2048]],[[544,0],[1088,2048]],[[0,0],[544,2048]]]]}}

os.system("echo here > /www/algorithm/log3")

usage = "usage: %prog [options]"
parser = OptionParser(usage=usage)


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

# result, error = tasks(taskParams)
# result,error = average_value(taskParams)
result, error = boundary(taskParams)

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
