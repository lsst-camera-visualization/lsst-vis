from astropy.io import fits

# Simple task calculating average value in a region.
# Boundary assumes the expected format being sent in.
def average_value(filename, boundary):
    hdulist = fits.open(filename)
    x_start, x_end = boundary[0][0], boundary[1][0]
    y_start, y_end = boundary[0][1], boundary[1][1]
    data = hdulist[0].data
    region = data[y_start:y_end, x_start:x_end]
    return np.mean(data)

