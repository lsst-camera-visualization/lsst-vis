from astropy.io import fits
import numpy as np
import json
import os.path

def _histogram(filename, region, numBins):
	hdulist = fits.open(filename)
	x_start, x_end = region[0][0], region[0][1]
	y_start, y_end = region[1][0], region[1][1]
	#works for single extension?  what about multi extension? convert coord?
	file_data = hdulist[0].data
	#print file_data
    # data with in the given region
	region_data = file_data[y_start:y_end, x_start:x_end]
	hist = np.histogram(region_data, bins = numBins)
	return hist


def get_json(hist):
	labels = hist[1]
	value = hist[0]
	values = []
	for i in range (0, len(hist[1])-1):
		_bin = {'label' : str(labels[i]) + ' - ' + str(labels[i+1]), 'value' : value[i]}
		values.append(_bin)

	ret = {"title" : filename, "type" : "Discrete Bar", "data" : {"values" : values}}
	#file = open('../../../frontend/data.json', "w")
	#json.dump(ret, file, indent=4)
	#file.close()
	return ret

#	return json.dumps(ret, sort_keys = False)


def histogram(filename, region, numBins):
	get_json(_histogram(filename, region, numBins))

#Testing
if __name__ == "__main__":
    filename = "/home/yutong/firefly/backend/images/imageE2V.fits"
    region = [[1, 20], [2, 20]]
    histogram(filename, region, 10)
