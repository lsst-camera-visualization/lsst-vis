from astropy.io import fits
from copy import deepcopy
import numpy as np
import json
import argparse

# Convert the boundary coordincates from string(as in the header) to values.
# Assume to be a rectangular region (2-dimensional)
# Return value: list containing X and Y boundaries(in list form).
#               [[start_X, end_X], [start_Y, end_Y]]
def getCoord(s):
    coord_list = s.split(',')
    coord_list[0] = coord_list[0].split('[')[1].split(':')
    coord_list[1] = coord_list[1].split(']')[0].split(':')
    coord_list = [[int(value) for value in elem] for elem in coord_list]
    return coord_list


# Get dimension information from a region.
def getDim(l):
    return [elem[1]-elem[0]+1 for elem in l]

# Get a section size based on dimension
def getSIZE(d):
    return [[1,elem] for elem in d]

def get_Header_Info(filename): # Get Header information
    # Get total dimension.
    hdulist = fits.open(filename)
    imgHDUs = [elem for elem in hdulist if elem.__class__.__name__ == 'ImageHDU']
    X_max, Y_max = 0, 0
    for elem in imgHDUs:
        temp_DETSEC = getCoord(elem.header['DETSEC'])
        temp_max = [max(temp) for temp in temp_DETSEC]
        X_max = temp_max[0] if (X_max < temp_max[0]) else X_max
        Y_max = temp_max[1] if (Y_max < temp_max[1]) else Y_max
    seg_header = imgHDUs[0].header

    # Caculate dimension based on DATASEC (considering overscan)
    seg_DATASEC_DIM = getDim(getCoord(seg_header['DATASEC']))
    seg_data_X, seg_data_Y = seg_DATASEC_DIM[0], seg_DATASEC_DIM[1]

    # Get segment number based on actual dimension (regardless of overscan)
    seg_X, seg_Y = seg_header['NAXIS1'], seg_header['NAXIS2']

    # Sanity Check
    if (X_max%seg_data_X!=0) and (Y_max%seg_data_Y!=0):
        raise ValueError("Incorrect Segment Dimension.")
    num_X, num_Y = X_max//seg_data_X, Y_max//seg_data_Y
    namps = num_X*num_Y
    hdulist.close()
    return {'DETSIZE':[X_max, Y_max], 'NUM_AMPS':namps, 'SEG_SIZE':[seg_X, seg_Y], 'SIZE':[num_X*seg_X, num_Y*seg_Y], 'SEG_DATA_SIZE':[seg_data_X, seg_data_Y], 'NUM_X':num_X, 'NUM_Y':num_Y}

def construct_CCD(filename, overscan, header):
    hdulist = fits.open(filename)
    imgHDUs = [elem for elem in hdulist if elem.__class__.__name__ == 'ImageHDU']
    trim  = '_trimmed' if not overscan else '_untrimmed'
    index = filename.find('.')
    filename_gen = filename[:index]+trim+filename[index:]
    total_dim = header['DETSIZE'] if not overscan else header['SIZE']
    new_data = np.zeros(shape=(total_dim[1],total_dim[0]), dtype = np.float32)
    SEG_DATA_SIZE = header['SEG_DATA_SIZE']
    SEG_SIZE = header['SEG_SIZE']
    for elem in imgHDUs:
        temp_DETSEC = getCoord(elem.header['DETSEC'])
        temp_DATASEC = getCoord(elem.header['DATASEC'])
        temp_DETSEC = [[temp[0]-1,temp[1]-1] for temp in temp_DETSEC]
        direction_X = -1 if temp_DETSEC[0][0]>temp_DETSEC[0][1] else 1
        direction_Y = -1 if temp_DETSEC[1][0]>temp_DETSEC[1][1] else 1
        temp_DATASEC = [[min(temp)-1, max(temp)] for temp in temp_DATASEC] # TODO: check if 'DATASEC' in the header always follows increasing order.
        if overscan:
            if direction_X == 1:
                temp_DETSEC[0] = [(temp_DETSEC[0][0]//SEG_DATA_SIZE[0])*SEG_SIZE[0], (temp_DETSEC[0][0]//SEG_DATA_SIZE[0]+1)*SEG_SIZE[0]-1]
            elif direction_X == -1:
                temp_DETSEC[0] = [(min(temp_DETSEC[0])//SEG_DATA_SIZE[0]+1)*SEG_SIZE[0]-1, (min(temp_DETSEC[0])//SEG_DATA_SIZE[0])*SEG_SIZE[0]]

            if direction_Y == 1:
                temp_DETSEC[1] = [(temp_DETSEC[1][0]//SEG_DATA_SIZE[1])*SEG_SIZE[1], (temp_DETSEC[1][0]//SEG_DATA_SIZE[1]+1)*SEG_SIZE[1]-1]
            elif direction_Y == -1:
                temp_DETSEC[1] = [(min(temp_DETSEC[1])//SEG_DATA_SIZE[1]+1)*SEG_SIZE[1]-1, (min(temp_DETSEC[1])//SEG_DATA_SIZE[1])*SEG_SIZE[1]]

        if temp_DETSEC[1][1]==0 and temp_DETSEC[0][1]==0:
            new_data[temp_DETSEC[1][0] : : direction_Y, temp_DETSEC[0][0] : : direction_X] = elem.data[temp_DATASEC[1][0]:temp_DATASEC[1][1], temp_DATASEC[0][0]:temp_DATASEC[0][1]] if not overscan else elem.data
        elif temp_DETSEC[1][1]==0:
            new_data[temp_DETSEC[1][0] : : direction_Y, temp_DETSEC[0][0] : temp_DETSEC[0][1]+direction_X : direction_X] = elem.data[temp_DATASEC[1][0]:temp_DATASEC[1][1], temp_DATASEC[0][0]:temp_DATASEC[0][1]] if not overscan else elem.data
        elif temp_DETSEC[0][1]==0:
            new_data[temp_DETSEC[1][0] : temp_DETSEC[1][1]+direction_Y : direction_Y, temp_DETSEC[0][0] : : direction_X] = elem.data[temp_DATASEC[1][0]:temp_DATASEC[1][1], temp_DATASEC[0][0]:temp_DATASEC[0][1]] if not overscan else elem.data
        else:
            new_data[temp_DETSEC[1][0] : temp_DETSEC[1][1]+direction_Y : direction_Y, temp_DETSEC[0][0] : temp_DETSEC[0][1]+direction_X : direction_X] = elem.data[temp_DATASEC[1][0]:temp_DATASEC[1][1], temp_DATASEC[0][0]:temp_DATASEC[0][1]] if not overscan else elem.data
    hdulist.close()
    new_hdu = fits.PrimaryHDU(new_data)
    new_hdulist = fits.HDUList([new_hdu])
    new_hdulist.writeto(filename_gen, clobber=True)

def _generate_json_helper(filename, overscan, header):
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

def generate_json(filename, header):
    ### To generate json object with the overscan area
    on = _generate_json_helper(filename, True, header)
    ### To generate json object without the overscan area
    off = _generate_json_helper(filename, False, header)

    return json.dumps({'WITHOUT_OSCN':off, 'WITH_OSCN':on}, sort_keys=True, indent = 2)

def generate_fits(filename, header):
    construct_CCD(FITS, False, header_info)
    construct_CCD(FITS, True, header_info)

'''
parser = argparse.ArgumentParser(description='Construct the CCD level single extension FITS based on a multi-extension FITS file.')
parser.add_argument("Filename", type = str, help='Filename of the input fits file.')
parser.add_argument("-on", "--overscan_ON", action='store_true', help = "Output a FITS file with overscan area displayed in the image.")
parser.add_argument("-off", "--overscan_OFF", action='store_true', help = "Output a FITS file without overscan area.")
parser.add_argument("--noJSON", action='store_false', help = "Do not create a json describing the region.")
'''
FITS = "s99_r01.fits"
header_info = get_Header_Info(FITS)
generate_fits(FITS, header_info)
json_string = generate_json(FITS, header_info)
print(json_string)


# TODO:
# 1. Display header only
# 2. generate a a single extention FITS file based on multi-extention version
# 3. generate json object that describes the boundaries of each amplifier
# 4. Implement command line like usage
# 5. __class__.__name__ (IMPORTANT!)
# 6. Inclusive or exclusive boundary; 0 or 1 based index
# 7. What information should we kept when generating the single extention file.
