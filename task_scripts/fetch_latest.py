
import task_def

import urllib2
import json

CHECK_IMAGE_PORT = "8099"
CHECK_IMAGE_URI = "http://172.17.0.1:" + CHECK_IMAGE_PORT + "/vis/checkImage"
#CHECK_IMAGE_URI = "http://localhost:" + CHECK_IMAGE_PORT + "/vis/checkImage"

def task(task_params):
	'''
	Fetches the latest image from the Rest API (https://github.com/lsst-camera-visualization/visualization-server).
	@author Joe Pagliuco
	@param task_params - Not used
	@return Returns a dictionary containing the following keys: "uri", "timestamp", "name"
	'''

	try:
		response = urllib2.urlopen(CHECK_IMAGE_URI)
		raw_data = response.read().decode("utf-8")
		json_data = json.loads(raw_data)
		return json_data, None
	except Exception as e:
		return { "error" : e }, None
