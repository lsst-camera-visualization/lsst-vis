
import task_def

def task(task_params):
	'''
	Fetches the latest image from the Rest API (https://github.com/lsst-camera-visualization/visualization-server).
	@author Joe Pagliuco
	@param task_params - Not used
	@return Returns a dictionary containing the following keys: "uri", "timestamp", "name"
	'''

	test_dict = { "uri" : "test_uri", "timestamp" : "test_timestamp", "name" : "test_name" };
	return test_dict, None
