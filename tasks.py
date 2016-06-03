from task_scripts.average_pixel import task as task_average_pixel
from task_scripts.boundary import task as task_boundary
from task_scripts.fetch_latest import task as task_fetch_latest
from task_scripts.hot_pixel import task as task_hot_pixel

# Return the parameter without any modification. For test and debug purpose.
def task_not_found(param):
    return ({"result": "Test function or wrong function call!"}, None)


def execute_task(task_name, task_params):
	'''
	Executes a task (identified by @task_name) with the parameters @task_params
	@author Joe Pagliuco
	@param task_name - The name of the task to be executed
	@param task_params - The parameters to be passed into the task
	@return Returns the result of the executed task, and an error, if necessary
	'''
	task = None
	
	if (task_name == "averasge"):
		task = task_average_pixel
	elif (task_name == "boundary"):
		task = task_boundary # NOTE: THIS TASK DOESN'T ACTUALLY WORK
	elif (task_name == "fetch_latest"):
		task = task_fetch_latest
	elif (task_name == "hot_pixel"):
		task = task_hot_pixel
	else:
		task = task_not_found
	
	return task(task_params) # returns result, error
	











    

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
