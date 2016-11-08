import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__))+"/task_scripts")

from task_scripts.chart import task as task_chart
from task_scripts.prescan_chart import task as task_prescan_chart
from task_scripts.averagePixel import task as task_average_pixel
from task_scripts.boundary import task as task_boundary
from task_scripts.fetchLatest import task as task_fetch_latest
from task_scripts.hotPixel import task as task_hot_pixel

# Dictionary mapping task names to functions
_tasks = {} # DO NOT MODIFY THIS LINE (see generate_new_task.sh)
_tasks["chart"] = task_chart
_tasks["prescan_chart"] = task_prescan_chart
_tasks["average"] = task_average_pixel
_tasks["boundary"] = task_boundary
_tasks["fetch_latest"] = task_fetch_latest
_tasks["hot_pixel"] = task_hot_pixel

# Return the parameter without any modification. For test and debug purpose.
def _taskNotFound(param):
    return ({"result": "Test function or wrong function call!"}, None)

# Handler to pass the correct filename and parameters for backend scripts.
def params_handler(task_name, params):
    filename = params['image_url']
    return (filename, params)

def execute_task(task_name, task_params):
    ''' Executes a task (identified by @task_name) with the parameters @task_params
    @author Joe Pagliuco
    @param task_name - The name of the task to be executed
    @param task_params - The parameters to be passed into the task
    @return Returns the result of the executed task, and an error, if necessary
    '''
    task = None

    if task_name in _tasks:
        task = _tasks[task_name]
    else:
        task = _taskNotFound

    # returns result, error
    return task(*(params_handler(task_name, task_params)))












# Debug line
# print average_value([0,0,10,10])
# print hot_pixel(["../frontend/images/image.fits", 2200])
# print(hot_pixel({"filename":"../frontend/images/image.fits", "threshold":"max", "region":{"rect":['1000','1000','2000','2000']}}))
# print(hot_pixel({"filename":"default", "threshold":"max", "region":{'rect':['3000', '3000', '1000', '1000']}}))

### Debug line


# def histogram(boundary):
    # x_start, x_end = boundary[0][0], boundary[1][0]
    # y_start, y_end = boundary[0][1], boundary[1][1]
    # hdulist = fits.open(filename)
    # region = hdulist[0].data[y_start:y_end, x_start:x_end]
