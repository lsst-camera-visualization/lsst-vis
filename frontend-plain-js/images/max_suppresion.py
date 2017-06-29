from scipy.ndimage import filters
from astropy.io import fits
import numpy as np

hdulist = fits.open("image.fits")
data = hdulist[0].data
data_ms = np.copy(data)

# All points with maximum value
m = data.max()
rows, cols = np.where(data>=m)
max_points = [list(elem) for elem in zip(rows, cols)]
new_data = np.zeros(shape=np.shape(data), dtype=np.float32)
for elem in max_points[::len(max_points)//10000]:
    new_data[elem[0],elem[1]] = m
new_hdu = fits.PrimaryHDU(new_data)
new_hdu.writeto("new.fits", clobber=True)
print("# of points with max value: "+ str(np.size(max_points)))

# Non-maximum suppression
tmp = filters.maximum_filter(data_ms,(200,200))
data_ms = data_ms * (data_ms==tmp)
rows, cols = np.where(data_ms>=m)
max_points = [list(elem) for elem in zip(rows, cols)]
new_data = np.zeros(shape=np.shape(data), dtype=np.float32)
for elem in max_points:
    new_data[elem[0],elem[1]] = m
new_hdu = fits.PrimaryHDU(new_data)
new_hdu.writeto("max_sprs.fits", clobber=True)
print("# of points with non-max suppression: "+str(np.size(max_points)))
