from astropy.io import fits
import numpy as np
import os
import sys, traceback
from ccdHeaderInfo import get_Header_Info
from commonFunctions import getCoord, convert_slice
# import argparse

def construct_CCD(filename):
    try:
        with fits.open(filename) as fits_object:
            hdulist = [elem for elem in fits_object if elem.__class__.__name__ == 'ImageHDU']
            header_info = get_Header_Info(filename)
            return _construct_CCD(hdulist, header_info, os.path.splitext(filename)[0])
    except Exception as e:
        print("Error constructing FITS.\nException: "+str(e)+"\n")
        traceback.print_exc(file=sys.stdout)
        return ["Error constructing the single extension FITS file (CCD level)."]

def _construct_CCD(hdulist, headers, filename):
    SEG_DATASIZE = headers['SEG_DATASIZE']
    SEG_SIZE = headers['SEG_SIZE']

    # Traverse the amplifier headers
    new_data = np.zeros(shape=(headers['DATASIZE']['y'], headers['DATASIZE']['x']), dtype=np.float32)
    for amps_row in headers['BOUNDARY']:
        for amp in amps_row:
            hdu = hdulist[amp['index']]
            data_sec = getCoord((hdu.header)['DATASEC'])
            det_sec = getCoord((hdu.header)['DETSEC'])
            data_slice_x = convert_slice(data_sec['start_X'], data_sec['end_X'])
            data_slice_y = convert_slice(data_sec['start_Y'], data_sec['end_Y'])
            slice_x = convert_slice(det_sec['start_X'], det_sec['end_X'])
            slice_y = convert_slice(det_sec['start_Y'], det_sec['end_Y'])
            new_data[slice_y, slice_x] = (hdu.data)[data_slice_y, data_slice_x]
    new_hdu = fits.PrimaryHDU(new_data)
    new_hdulist = fits.HDUList([new_hdu])
    new_hdulist.writeto(filename+"_mosaicked_trimmed"+".fits", clobber=True)

    new_data = np.zeros(shape=(headers['DETSIZE']['y'], headers['DETSIZE']['x']), dtype=np.float32)
    for amps_row in headers['BOUNDARY_OVERSCAN']:
        for amp in amps_row:
            data_slice_x = slice(SEG_SIZE['x']-1, None, -1) if amp['reverse_slice']['x'] else slice(0, SEG_SIZE['x'])
            data_slice_y = slice(SEG_SIZE['y']-1, None, -1) if amp['reverse_slice']['y'] else slice(0, SEG_SIZE['y'])
            start_X = (amp['x']//SEG_SIZE['x'])*SEG_SIZE['x']
            start_Y = (amp['y']//SEG_SIZE['y'])*SEG_SIZE['y']
            slice_x = slice(start_X, start_X+SEG_SIZE['x'])
            slice_y = slice(start_Y, start_Y+SEG_SIZE['y'])
            new_data[slice_y, slice_x] = (hdulist[amp['index']].data)[data_slice_y, data_slice_x]
    new_hdu = fits.PrimaryHDU(new_data)
    new_hdulist = fits.HDUList([new_hdu])
    new_hdulist.writeto(filename+"_mosaicked_untrimmed"+".fits", clobber=True)
    return ["Created single-extension FITS file."]


'''
parser = argparse.ArgumentParser(description='Construct the CCD level single extension FITS based on a multi-extension FITS file.')
parser.add_argument("Filename", type = str, help='Filename of the input fits file.')
parser.add_argument("-on", "--overscan_ON", action='store_true', help = "Output a FITS file with overscan area displayed in the image.")
parser.add_argument("-off", "--overscan_OFF", action='store_true', help = "Output a FITS file without overscan area.")
parser.add_argument("--noJSON", action='store_false', help = "Do not create a json describing the region.")
'''

# FITS = "imageE2V.fits"
def get_boundary(filename):
    header_info = get_Header_Info(filename)
    json_string = generate_json(filename, header_info)
    return json_string

if __name__ == "__main__":
    filename = "/home/wei/backend/images/imageE2V.fits"
    # print(get_Header_Info(filename))
    print(construct_CCD(filename))
# print(json_string)
# FITS = sys.argv[1]
# for i in range(9):
#     generate_fits(FITS, get_Header_Info(FITS))

# NOTE:
# 1. Display header only
# 2. generate a a single extention FITS file based on multi-extention version
# 3. generate json object that describes the boundaries of each amplifier
# 4. Implement command line like usage
# 5. __class__.__name__ (IMPORTANT!)
# 6. Inclusive or exclusive boundary; 0 or 1 based index
# 7. What information should we kept when generating the single extention file.
