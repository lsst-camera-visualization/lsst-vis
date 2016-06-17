from astropy.io import fits
from commonFunctions import getCoord, getDim, convert_to_Box

# Check if the segment data slicing should be reversed or not.
def check_Reverse_Slicing(detsec, datasec):
    return {'x':(detsec['start_X']>detsec['end_X'])!=(datasec['start_X']>datasec['end_X']),
            'y':(detsec['start_Y']>detsec['end_Y'])!=(datasec['start_Y']>datasec['end_Y'])}

# Actual function getting head info.
# Called by **get_Header_Info** .
def _get_Header_Info(imgHDUs):
    if not imgHDUs:
        raise RuntimeError('The given file is not a multi-extension FITS image.')
    # Get info from the first amplifier header.
    first_seg = imgHDUs[0]
    seg_dimension = [first_seg['NAXIS1'], first_seg['NAXIS2']]
    DETSIZE = getDim(getCoord(first_seg['DETSIZE'])) # Assume 'DETSIZE' is same for all segments/amplifiers.
    # Sanity Check
    if (DETSIZE[0]%seg_dimension[0]!=0) and (DETSIZE[1]%seg_dimension[1]!=0):
        raise ValueError('Incorrect segment/amplifier dimension.')
    num_X, num_Y = DETSIZE[0]//seg_dimension[0], DETSIZE[1]//seg_dimension[1]
    num_amps = num_X*num_Y

    boundary = [[{} for x in range(num_X)] for y in range(num_Y)]
    boundary_overscan = [[{} for x in range(num_X)] for y in range(num_Y)]
    # Traverse the list of headers
    for i in range(num_amps):
        header = imgHDUs[i]
        seg_dimension = [header['NAXIS1'], header['NAXIS2']]
        seg_detsec = getCoord(header['DETSEC'])
        seg_datasec = getCoord(header['DATASEC'])
        seg_datadim = getDim(seg_datasec)
        seg_bias_Size = getDim(getCoord(header['BIASSEC']))
        # Segment/amplifier coordinates in a CCD.
        # Format: amplifier[Y][X] (origin at top left corner).
            # +----+----+----+----+----+----+----+----+
            # | 00 | 01 | 02 | 03 | 04 | 05 | 06 | 07 |
            # +----+----+----+----+----+----+----+----+
            # | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 |
            # +----+----+----+----+----+----+----+----+
        seg_X, seg_Y = (seg_detsec['start_X'])//seg_datadim[0], (seg_detsec['start_Y'])//seg_datadim[1]
        boundary[seg_Y][seg_X] = convert_to_Box(seg_detsec)
        # Condition about X & Y slicing in segment data.
        is_Slice_Reverse = check_Reverse_Slicing(seg_detsec, seg_datasec)
        # Add correct offset for each segment.
        boundary_overscan[seg_Y][seg_X] = { 'x':seg_X*seg_dimension[0],
                                            'y':seg_Y*seg_dimension[1],
                                            'width':seg_dimension[0],
                                            'height':seg_dimension[1]}
        boundary_overscan[seg_Y][seg_X]['x'] += seg_bias_Size[0] if is_Slice_Reverse['x'] else (min(seg_datasec['start_X'], seg_datasec['end_X']))
        boundary_overscan[seg_Y][seg_X]['y'] += (seg_dimension[1]-getDim(seg_datasec)[1]) if is_Slice_Reverse['y'] else 0
        boundary[seg_Y][seg_X]['index'] = boundary_overscan[seg_Y][seg_X]['index'] = i
        boundary[seg_Y][seg_X]['reverse_slice'] = boundary_overscan[seg_Y][seg_X]['reverse_slice'] = is_Slice_Reverse

    return {
            'DETSIZE'       : {'x':DETSIZE[0], 'y':DETSIZE[1]},
            'DATASIZE'      : {'x':num_X*seg_datadim[0], 'y':num_Y*seg_datadim[1]},
            'NUM_AMPS'      : num_amps,
            'SEG_SIZE'      : {'x':seg_dimension[0], 'y':seg_dimension[1]},
            'SEG_DATASIZE'  : {'x':seg_datadim[0], 'y':seg_datadim[1]},
            'BOUNDARY'      : boundary,
            'BOUNDARY_OVERSCAN' : boundary_overscan
    }
    # (json['boundary'])['segment00']

# Get Header information from multiple extension
# return as a dictionary object
def get_Header_Info(filename):
    try:
        with fits.open(filename) as fits_object:
            hdulist = [elem.header for elem in fits_object if elem.__class__.__name__ == 'ImageHDU']
            return _get_Header_Info(hdulist)
    except Exception as e:
        print("Error getting header info!\nException: " + str(e) + "\n")
        return ["Error when getting header info"]

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

    return {'WITHOUT_OSCN':off, 'WITH_OSCN':on}


if __name__ == "__main__":
    filename = "/home/wei/backend/images/imageE2V.fits"
    print(get_Header_Info(filename))
