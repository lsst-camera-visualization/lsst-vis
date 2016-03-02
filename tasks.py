import numpy as np
import json
from copy import deepcopy
from astropy.io import fits


# filename = os.getcwd()+"../frontend/images/image.fits"

# Return the parameter without any modification. For test and debug purpose.
def tasks_test(param):
    return ({"result": param}, None)

# Simple task calculating average value in a region.
# Boundary assumes the expected format being sent in.
def average_value(boundary):
    filename = "/www/static/images/image.fits"
    x_start, x_end = boundary[0], boundary[2]
    y_start, y_end = boundary[1], boundary[3]
    hdulist = fits.open(filename)
    region = hdulist[0].data[y_start:y_end, x_start:x_end]
    avg = str(np.mean(region))
    hdulist.close()
    return {"result":avg},None

# Return amplifier boundries of a FITS file based on its header information.
def boundary(filename):
    return {"overscan_off":{"filename":"imageE2V_trimmed.fits","X_Y_dim_full":[4096,4004],"overscan":False,"X_Y_seg":[512,2002],"X_Y_seg_data":[512,2002],"data_seg_regions":[[[[3584,2002],[4096,4004]],[[3072,2002],[3584,4004]],[[2560,2002],[3072,4004]],[[2048,2002],[2560,4004]],[[1536,2002],[2048,4004]],[[1024,2002],[1536,4004]],[[512,2002],[1024,4004]],[[0,2002],[512,4004]]],[[[3584,0],[4096,2002]],[[3072,0],[3584,2002]],[[2560,0],[3072,2002]],[[2048,0],[2560,2002]],[[1536,0],[2048,2002]],[[1024,0],[1536,2002]],[[512,0],[1024,2002]],[[0,0],[512,2002]]]],"overscan_regions":None},"overscan_on":{"filename":"imageE2V_untrimmed.fits","X_Y_dim_full":[4352,4096],"overscan":True,"X_Y_seg":[544,2048],"X_Y_seg_data":[512,2002],"data_seg_regions":[[[[3818,2094],[4330,4096]],[[3274,2094],[3786,4096]],[[2730,2094],[3242,4096]],[[2186,2094],[2698,4096]],[[1642,2094],[2154,4096]],[[1098,2094],[1610,4096]],[[554,2094],[1066,4096]],[[10,2094],[522,4096]]],[[[3830,0],[4342,2002]],[[3286,0],[3798,2002]],[[2742,0],[3254,2002]],[[2198,0],[2710,2002]],[[1654,0],[2166,2002]],[[1110,0],[1622,2002]],[[566,0],[1078,2002]],[[22,0],[534,2002]]]],"overscan_regions":[[[[3808,2048],[4352,4096]],[[3264,2048],[3808,4096]],[[2720,2048],[3264,4096]],[[2176,2048],[2720,4096]],[[1632,2048],[2176,4096]],[[1088,2048],[1632,4096]],[[544,2048],[1088,4096]],[[0,2048],[544,4096]]],[[[3808,0],[4352,2048]],[[3264,0],[3808,2048]],[[2720,0],[3264,2048]],[[2176,0],[2720,2048]],[[1632,0],[2176,2048]],[[1088,0],[1632,2048]],[[544,0],[1088,2048]],[[0,0],[544,2048]]]]}}

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
    construct_CCD(filename, False, header)
    construct_CCD(filename, True, header)

# Debug line
# print average_value([0,0,10,10])
### :sDebug line
# def histogram(boundary):
    # x_start, x_end = boundary[0][0], boundary[1][0]
    # y_start, y_end = boundary[0][1], boundary[1][1]
    # hdulist = fits.open(filename)
    # region = hdulist[0].data[y_start:y_end, x_start:x_end]
