from astropy.io import fits
import numpy as np

def histogram(filename, boundary, bins):
	hdulist = fits.open(filename)
	x_start, x_end = boundary[0][0], boundary[0][1]
	y_start, y_end = boundary[1][0], boundary[1][1]
	#works for single extension?  what about multi extension? convert coord?
	file_data = hdulist[?].data
	print file_data
    # data with in the given region
	region_data = file_data[y_start:y_end, x_start:x_end]
	hist = np.histogram(region_data, bins)
	return hist

if __name__ == "__main__":
    filename = "/home/yutong/firefly/backend/images/imageE2V.fits"
    boundary = [[1, 20], [2, 20]]
    header = histogram(filename, boundary, 5)
    print header
