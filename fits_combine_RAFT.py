from astropy.io import fits
import numpy as np
from glob import glob
import os
import time

# TODO: Plannig to wrap this as a class

PATH = os.getcwd()
# Helper function to get d
def get_subDIR(DIR):
    return [os.path.join(DIR,d) for d in os.listdir(DIR) if os.path.isdir(os.path.join(DIR, d))]

def get_subFITS(DIR, fileExt):
    file_list = [os.path.normcase(f) for f in os.listdir(DIR)]
    return [os.path.join(DIR, f) for f in file_list if os.path.splitext(f)[-1] == fileExt and not f[0]=='.']

# TODO: Right now it's size fixed. Maybe decide by header is better.
def combine_Sensor(sensor_list):
    # TODO: image dimension to be retrived from header
    # Right now assume it's 4072*4000 only for our purpose
    dim_x, dim_y = 4072, 4000
    new_data = np.zeros(shape=(dim_x*3,dim_y*3), dtype = np.float32)
    for elem in sensor_list:
        hdulist = fits.open(elem)
        # TODO: datatype to retrive from header.
        # Right now assume it's floating point.
        sensor_image_data = hdulist[0].data
        # To check: gzip'ed fits always in the form 'eimage_886947091_R01_S00_E000.fits.gz'
        temp_name = elem.split('_')
        X , Y = int(temp_name[-2][1]) , int(temp_name[-2][2])
        new_data[X*dim_x : (X+1)*dim_x , Y*dim_y:(Y+1)*dim_y] = sensor_image_data
        hdulist.close()
    write_Path = os.path.join(PATH,'RAFTS')
    if not os.path.exists(write_Path):
        os.makedirs(write_Path)
    hdu = fits.PrimaryHDU(new_data)
    hdulist = fits.HDUList([hdu])
    hdulist.writeto(os.path.join(write_Path, '%s_CCD_%s.fits' % ((sensor_list[0].split('_')[-1][:4]).upper(), (sensor_list[0].split('_')[-3]).upper())))
    print('Processed Raft %s' % sensor_list[0].split('_')[-3])

# TODO: See comments in the combine_Sensor function
# TODO: still need to fix memory error !
def combine_RAFT(CCD_list):
    # Using fixed X & Y coordinates
    dim_x, dim_y = 4072*3, 4000*3
    # Memmap in numpy.ndarray
    filename = os.path.join(os.path.join(PATH,"RAFTS"), "memmap_temp.data")
    print(filename)
    new_data = np.memmap(filename, mode = 'w+', shape=(dim_x*5,dim_y*5), dtype = np.float32)
    for elem in CCD_list:
        #print(elem)
        HDUList = fits.open(elem)
        CCD_image_data = HDUList[0].data
        temp_name = elem.split('_')
        X, Y = int(temp_name[-1][1]), int(temp_name[-1][2])
        new_data[X*dim_x : (X+1)*dim_x, Y*dim_y : (Y+1)*dim_y] = CCD_image_data
        HDUList.close()
    hdu = fits.PrimaryHDU(new_data)
    hdulist = fits.HDUList([hdu])
    hdulist.writeto(os.path.join(PATH,"FOCAL_PLANE_combined.fits"))
    del new_data
    print('Focal plane FITS combined!')

R_list = get_subDIR(PATH)

# Directories like 'E000' or 'E001' are valid. E at -4 position
R_list = [get_subDIR(d) for d in R_list if 'E' == d[-4]]

# Total number of images to combine
num_image = len(R_list)

# Get all the fits file with '.gz' into a list.
fits_gz_list = [[get_subFITS(sub_dir, '.gz') for sub_dir in elem] for elem in R_list]

#combine_Sensor(fits_gz_list[0][0])

# TODO: Get keywords from header file

# Testing the runnig time
t = time.process_time()
for image in fits_gz_list:
    for raft in image:
        combine_Sensor(raft)
print(str(time.process_time()- t)+' s')


# Not enough memory by this naive implementation, consider using memmap
t = time.process_time()
CCD_list = get_subFITS(os.path.join(PATH,"RAFTS"), '.fits')
combine_RAFT(CCD_list)
print(str(time.process_time()-t)+'s')

###
# Test purpose. Below should be ignored.
'''
hdulist = fits.open(os.path.join(PATH, 'eimage_886947091_R20_S00_E000.fits.gz'))
data = hdulist[0].data
print(data.max())
hdulist.close()
'''

#n = np.arange(100.0) # Sample sequence of floats
#hdu = fits.PrimaryHDU(n)
#hdulist = fits.HDUList([hdu])
#hdulist.writeto('new.fits')
