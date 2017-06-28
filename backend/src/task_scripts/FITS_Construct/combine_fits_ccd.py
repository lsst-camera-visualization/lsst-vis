from astropy.io import fits
from copy import deepcopy
import numpy as np
import sys
# import os
# import json
# import argparse

# ======================================================================
# Combine a multi-extension FITS file into a single-extension FITS file.
# FireFly needs this format.
# See http://docs.astropy.org/en/stable/io/fits/api/files.html for
# astropy function documentation.
#
# Invocation: generate_fits(filename, header)
#  filename (input)  is the FITS file locator.
#  header   (output) is the new combined header.
# Calling sequence:
#   generate_fits
#     construct_CCD (twice)
#       getCoord (twice)
#
#   get_boundary    <-- Who calls this?
#     get_Header_Info
#       getCoord
#       getDim
#         getCoord
#
# All other functions are local.
# ======================================================================

#===============
def getCoord(s):
#===============
# Parse the header DETSEC or DATASEC, converting the boundary coordincates from
# strings to values.  String format is: [start_X:end_X,start_Y:end_Y] .
#                     For example: [2049:4096,1:2048] .
# Return a list of the 4 numerical values.
    # Split x from y.
    coord_list = s.split(',')
    # Split start_x from end_x, removing the left square bracket.
    coord_list[0] = coord_list[0].split('[')[1].split(':')
    # Split start_y from end_y, removing the right square bracket.
    coord_list[1] = coord_list[1].split(']')[0].split(':')
    # Convert to ints: [[start_X, end_X], [start_Y, end_Y]]
    coord_list = [[int(value) for value in elem] for elem in coord_list]
    return coord_list

#=============
def getDim(l):
#=============
# Get dimension information from a region.
    return [abs(elem[1]-elem[0])+1 for elem in l]    # <=== Bug fix (abs value needed)

#=============================
def construct_CCD_Header(imgHDUs):
    # Create a single-extension FITS header from the segment HDUs.
#=============================

    # Scan over all segment (amplifier) headers.  
    # The image size is given by the maximum X and Y values found.
    X_max, Y_max = 0, 0
    for elem in imgHDUs:
        # header['DETSEC'] is the pixel (x,y) location of the image part (not overscan) of
        # a particular segmant.  getCoords converts from string to ints.
        # If start_X < end_X, the pixel readout order is backward (decreasing X).  Y is similar.
        temp_DETSEC = getCoord(elem.header['DETSEC'])
        temp_max    = [max(temp) for temp in temp_DETSEC]
        X_max       = temp_max[0] if (X_max < temp_max[0]) else X_max
        Y_max       = temp_max[1] if (Y_max < temp_max[1]) else Y_max

    # Every amplifier segment is the same size, so use the first one.
    # Caculate X,Y dimensions and the first and last X and Y pixels
    # without overscan using DATASEC.
    # Caculate X,Y dimensions with overscan using NAXIS.
    seg0_header     = imgHDUs[0].header
    seg_DATASEC     = getCoord(seg0_header['DATASEC'])
    X_f        = min(seg_DATASEC[0])
    X_l        = max(seg_DATASEC[0])
    Y_f        = min(seg_DATASEC[1])
    Y_l        = max(seg_DATASEC[1])
    seg_X      = seg0_header['NAXIS1']
    seg_Y      = seg0_header['NAXIS2']

    # Number of segments (amplifiers) in the X and Y directions.
    num_X = X_max//(X_l-X_f+1)
    num_Y = Y_max//(Y_l-Y_f+1)
    # Sanity Check.  The image size should be an integral # of segment sizes.
    if (X_max%(X_l-X_f+1) != 0) or (Y_max%(Y_l-Y_f+1) != 0):     # <== Bug fix: or, rather than and
        raise ValueError("Incorrect Segment Dimension.")

    return {'SIMPLE':       'T',
            'BITPIX':       32,
            'Extend':       'F',
            'NUM_AMPS':     [num_X, num_Y],             # # amps in X and Y.
            'SIZE':         [num_X*seg_X, num_Y*seg_Y], # Image X,Y size  with   overscan.
            'DETSIZE':      [X_max, Y_max],             # Image X,Y size without overscan.
            'SEG_SIZE':     [seg_X, seg_Y],             # Amp   X,Y size  with   overscan.
            'SEG_DATA_PIX': [[X_f,X_l], [Y_f,Y_l]]      # Amp   X,Y pixels without overscan.
           }

#=============================================
def construct_CCD(filename, overscan):
    # Called by generate_fits.  Creates a single-extension FITS file.
    # filename (input)  The multi-extension FITS file
    # overscan (input)  Whether or not to keep overscan pixels.
    # Important segment header keywords:
    #   NAXIS1  Size of X data, including overscan.
    #   NAXIS2  Size of Y data, including overscan
    #   DETSIZE Size of the entire image (with overscan), coded as'[1:Xmax,1:Ymax]'.
    #   DATASEC Where in the segment data the no overscan pixels are: '[Xfirst:Xlast,Yfirst:Ylast]'
    #   DETSEC  Where in the no overscan image the segmant's pixels go.'[X1:X2,Y1:Y2]'
    #    Note: If X2 < X1, we need to scan the segment backwards (ditto for Y).
    #   BIASSEC Where the postscan pixels are (between Xlast+1 and NAXIS1).
#=============================================

    hdulist = fits.open(filename)
    imgHDUs = [elem for elem in hdulist if elem.__class__.__name__ == 'ImageHDU']

    # Make a filename for the new FITS file by adding '_trimmed' or '_untrimmed'
    # to the original name.
    trim  = '_trimmed' if not overscan else '_untrimmed'
    index = filename.find('.')
    filename_gen = filename[:index]+trim+filename[index:]
    
    # Initialize new_header.
    new_header = construct_CCD_Header(imgHDUs)

    # Initialize the new_data HDU.
    # We need this to calculate each segment's X and Y sequence number.
    seg_X_size_without_os = getDim(new_header['SEG_DATA_PIX'][0])
    seg_Y_size_without_os = getDim(new_header['SEG_DATA_PIX'][1])

    for elem in imgHDUs:
        if overscan:
            seg_X_size = new_header['SEG_SIZE'][0]
            seg_Y_size = new_header['SEG_SIZE'][1]
            image_size = new_header['SIZE']
            X_f        = 1
            X_l        = seg_X_size
            Y_f        = 1
            Y_l        = seg_Y_size
        else:
            seg_X_size = seg_X_size_without_os
            seg_Y_size = seg_Y_size_without_os
            image_size = new_header['DETSIZE']
            X_f        = new_header['SEG_DATA_PIX'][0][0]
            X_l        = new_header['SEG_DATA_PIX'][0][1]
            Y_f        = new_header['SEG_DATA_PIX'][1][0]
            Y_l        = new_header['SEG_DATA_PIX'][1][1]

        # Make the new (empty) data array.
        new_data = np.zeros(shape=(image_size[0],image_size[1]), dtype = np.float32)

        # Calculate the location of this  segment's data in the combined image.
        # Use the segment's location in the no-overscan image to calculate
        # the X and Y sequence numbers (ie, amplifier positions): 0 to 7 and 0 to 1.
        image_coords = getCoord(elem.header['DETSEC'])
        X_seq = (image_coords[0][0]-1) // seg_X_size_without_os
        Y_seq = (image_coords[1][0]-1) // seg_Y_size_without_os
        # Scan backwards if the data is in reverse order.
        X_dir  = -1 if image_coords[0][0]>image_coords[0][1] else 1
        Y_dir  = -1 if image_coords[1][0]>image_coords[1][1] else 1
        # First X and Y coordinates of this segment's contribution to the combined image.
        X1 = seg_X_size * X_seq if X_dir > 0 else seg_X_size * (X_seq+1) -1
        Y1 = seg_Y_size * Y_seq if Y_dir > 0 else seg_Y_size * (Y_seq+1) -1

        # Copy the segment's data to new_data.
        new_data[X1::X_dir, Y1::Y_dir] = elem.data[X_f:X_l, Y_f:Y_l]

    hdulist.close()

    # Make a new HDU for the combined FITS file.
    # ---------------------------------------------
    # I think we also need to construct the header.
    # ---------------------------------------------
    new_hdu     = fits.PrimaryHDU(new_data)
    new_hdulist = fits.HDUList([new_hdu])
    new_hdulist.writeto(filename_gen, clobber=True)

#=====================================================
def _generate_json_helper(filename, overscan, header):
#=====================================================
    num_X, num_Y = header['NUM_X'], header['NUM_Y']
    namps = num_X*num_Y
    if not overscan:
        trim = '_trimmed'
        DIM_SIZE = header['DETSIZE']
    else:
        trim = '_untrimmed'
        DIM_SIZE = header['SIZE']

    SEG_DIM_SIZE = [DIM_SIZE[0]//num_X, DIM_SIZE[1]//num_Y]
    SEG_DATA_SIZE = header['SEG_DATA_SIZE']

    index = filename.find('.')
    filename_gen = filename[:index]+trim+filename[index:]

    SEG_DATA_BOUNDARY = [[[[0,0],[0,0]] for x in range(num_X)] for y in range(num_Y)]
    SEG_BOUNDARY = [[[[0,0],[0,0]] for x in range(num_X)] for y in range(num_Y)]

    hdulist = fits.open(filename)
    for i in range(1,namps+1):
        temp_header = hdulist[i].header
        temp_DETSEC = getCoord(temp_header['DETSEC'])
        coord_X = (temp_DETSEC[0][0]-1)//SEG_DATA_SIZE[0]
        coord_Y = (temp_DETSEC[1][0]-1)//SEG_DATA_SIZE[1]

        SEG_BOUNDARY[coord_Y][coord_X] = ([[SEG_DATA_SIZE[0]*coord_X+1, SEG_DATA_SIZE[0]*(coord_X+1)], [SEG_DATA_SIZE[1]*(coord_Y)+1, SEG_DATA_SIZE[1]*(coord_Y+1)]]) if not overscan else ([[SEG_DIM_SIZE[0]*coord_X+1, SEG_DIM_SIZE[0]*(coord_X+1)], [SEG_DIM_SIZE[1]*coord_Y+1, SEG_DIM_SIZE[1]*(coord_Y+1)]])

        temp_BIASSEC = getDim(getCoord(temp_header['BIASSEC']))

        # Calculate offsets in a hacky way
        (offset_X, BIAS_X) = (getCoord(temp_header['DATASEC'])[0][0]-1, temp_BIASSEC[0]) if (temp_DETSEC[0][0]<temp_DETSEC[0][1]) else (temp_BIASSEC[0], getCoord(temp_header['DATASEC'])[0][0]-1)

        (offset_Y, BIAS_Y) = (getCoord(temp_header['DATASEC'])[1][0]-1, SEG_DIM_SIZE[1]-temp_BIASSEC[1]) if temp_DETSEC[1][0]<temp_DETSEC[1][1] else (SEG_DIM_SIZE[1]-temp_BIASSEC[1], getCoord(temp_header['DATASEC'])[1][0]-1)

        SEG_DATA_BOUNDARY[coord_Y][coord_X] = deepcopy(SEG_BOUNDARY[coord_Y][coord_X]) if not overscan else [[SEG_DIM_SIZE[0]*coord_X+1+offset_X, SEG_DIM_SIZE[0]*(coord_X+1)-BIAS_X], [SEG_DIM_SIZE[1]*coord_Y+1+offset_Y, SEG_DIM_SIZE[1]*(coord_Y+1)-BIAS_Y]]

    hdulist.close()
    return {'filename':filename_gen, 'DIM_SIZE':DIM_SIZE, 'overscan':overscan, 'SEG_DIM_SIZE':SEG_DIM_SIZE, 'SEG_DATA_SIZE':SEG_DATA_SIZE, 'SEG_BOUNDARY':SEG_BOUNDARY, 'SEG_DATA_BOUNDARY':SEG_DATA_BOUNDARY}

#===================================
def generate_json(filename, header):
# Generate JSON files with and without the overscan area.
#===================================
    on  = _generate_json_helper(filename, True,  header)
    off = _generate_json_helper(filename, False, header)
    return {'WITHOUT_OSCN':off, 'WITH_OSCN':on}

#===================================
def generate_fits(filename, header):
#===================================
    construct_CCD(filename, False, header)
    construct_CCD(filename, True,  header)

'''
parser = argparse.ArgumentParser(description='Construct the CCD level single extension FITS based on a multi-extension FITS file.')
parser.add_argument("Filename", type = str, help='Filename of the input fits file.')
parser.add_argument("-on", "--overscan_ON", action='store_true', help = "Output a FITS file with overscan area displayed in the image.")
parser.add_argument("-off", "--overscan_OFF", action='store_true', help = "Output a FITS file without overscan area.")
parser.add_argument("--noJSON", action='store_false', help = "Do not create a json describing the region.")
'''

# FITS = "imageE2V.fits"
#==========================
def get_boundary(filename):
    # Who calls this?
#==========================
    header_info = get_Header_Info(filename)
    json_string = generate_json(filename, header_info)
    return json_string

# print(json_string)
# FITS = sys.argv[1]
# for i in range(9):
#     generate_fits(FITS, get_Header_Info(FITS))

# TODO:
# 1. Display header only
# 2. generate a a single extention FITS file based on multi-extention version
# 3. generate json object that describes the boundaries of each amplifier
# 4. Implement command line like usage
# 5. __class__.__name__ (IMPORTANT!)
# 6. Inclusive or exclusive boundary; 0 or 1 based index
# 7. What information should we kept when generating the single extention file.
