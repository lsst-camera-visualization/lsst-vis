from astropy.io import fits
from copy import deepcopy
import json

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

def generate_object(filename, overscan):

    # Get total dimension.
    hdulist = fits.open(filename)
    seg_header = hdulist[1].header
    DETSIZE = getCoord(seg_header['DETSIZE'])
    DETSIZE_val = getDim(DETSIZE)
    # Get segment number based on actual dimension (regardless of overscan)
    seg_X, seg_Y = seg_header['NAXIS1'], seg_header['NAXIS2']
    # Sanity Check
    if (DETSIZE_val[0]%seg_X!=0) and (DETSIZE_val[1]%seg_Y!=0):
        raise ValueError("Incorrect Segment Dimension.")
    num_X, num_Y = DETSIZE_val[0]//seg_X, DETSIZE_val[1]//seg_Y
    nccds = num_X*num_Y

    # Caculate dimension based on DATASEC (considering overscan)
    seg_DATASEC_DIM = getDim(getCoord(seg_header['DATASEC']))
    seg_data_X, seg_data_Y = seg_DATASEC_DIM[0], seg_DATASEC_DIM[1]

    if not overscan:
        trim = '_trimmed'
        DIM_SIZE = [seg_data_X*num_X, seg_data_Y*num_Y]
        SEG_DIM_SIZE = seg_DATASEC_DIM
    else:
        trim = '_untrimmed'
        DIM_SIZE = getDim(DETSIZE)
        SEG_DIM_SIZE = [seg_X, seg_Y]

    SEG_DATA_SIZE = seg_DATASEC_DIM

    index = filename.find('.')
    filename_gen = filename[:index]+trim+filename[index:]

    SEG_DATA_BOUNDARY = [[[[0,0],[0,0]] for x in range(num_X)] for y in range(num_Y)]
    SEG_BOUNDARY = [[[[0,0],[0,0]] for x in range(num_X)] for y in range(num_Y)]

    for i in range(1,nccds+1):
        temp_header = hdulist[i].header
        temp_DETSEC = getCoord(temp_header['DETSEC'])
        coord_X = (temp_DETSEC[0][0]-1)//seg_data_X
        coord_Y = (temp_DETSEC[0][1]-1)//seg_data_Y

        SEG_BOUNDARY[coord_Y][coord_X] = [[seg_data_X*(num_X-coord_X)+1, seg_data_X*(num_X-coord_X+1)], [seg_data_Y*(coord_Y)+1, seg_data_Y*(coord_Y+1)]] if not overscan else [[seg_X*(num_X-coord_X)+1, seg_X*(num_X-coord_X+1)], [seg_Y*(coord_Y)+1, seg_Y*(coord_Y+1)]]

        temp_BIASSEC = getDim(getCoord(temp_header['BIASSEC']))

        # Calculate offset in a hacky way
        if coord_Y==0:
            BIAS_X = temp_BIASSEC[0]
            BIAS_Y = seg_Y-temp_BIASSEC[1]
            offset_X = getCoord(temp_header['DATASEC'])[0][0]-1
            offset_Y = getCoord(temp_header['DATASEC'])[1][0]-1
        elif coord_Y==1:
            BIAS_X = getCoord(temp_header['DATASEC'])[0][0]-1
            BIAS_Y = getCoord(temp_header['DATASEC'])[1][0]-1
            offset_X = temp_BIASSEC[0]
            offset_Y = temp_BIASSEC[1]

        SEG_DATA_BOUNDARY[coord_Y][coord_X] = deepcopy(SEG_BOUNDARY[coord_Y][coord_X]) if not overscan else [[seg_X*(num_X-coord_X)+1+offset_X, seg_X*(num_X-coord_X+1)-BIAS_X], [seg_Y*(coord_Y)+1-BIAS_Y, seg_Y*(coord_Y+1)+offset_Y]]

        hdulist.close()
        return {'filename':filename_gen, 'DIM_SIZE':DIM_SIZE, 'overscan':overscan, 'SEG_DIM_SIZE':SEG_DIM_SIZE, 'SEG_DATA_SIZE':SEG_DATA_SIZE, 'SEG_BOUNDARY':SEG_BOUNDARY, 'SEG_DATA_BOUNDARY':SEG_DATA_BOUNDARY}

FITS = "imageE2V.fits"
### To generate json object with the overscan area
on = generate_object(FITS, overscan=True)
### To generate json object without the overscan area
off = generate_object(FITS, overscan=False)

json_string = json.dumps({'WITHOUT_OSCN':off, 'WITH_OSCN':on}, sort_keys=True, indent = 2)
print(json_string)
