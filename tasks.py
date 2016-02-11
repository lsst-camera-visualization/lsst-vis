# import numpy as np
# from astropy.io import fits


# filename = os.getcwd()+"../frontend/images/image.fits"
# filename = "/www/static/images/image.fits"

def tasks(param):
    return ({"result": "success"}, None)

# Simple task calculating average value in a region.
# Boundary assumes the expected format being sent in.
# def average_value(filename, boundary):
    # hdulist = fits.open(filename)
    # x_start, x_end = boundary[0][0], boundary[1][0]
    # y_start, y_end = boundary[0][1], boundary[1][1]
    # data = hdulist[0].data
    # region = data[y_start:y_end, x_start:x_end]
    # avg = np.mean(data)
    # hdulist.close()
    # return avg

# def histogram(boundary):
    # x_start, x_end = boundary[0][0], boundary[1][0]
    # y_start, y_end = boundary[0][1], boundary[1][1]
    # hdulist = fits.open(filename)
    # region = hdulist[0].data[y_start:y_end, x_start:x_end]
