from astropy.io import fits
import json
import sys
from os.path import dirname
sys.path.append(dirname(__file__))
from os.path import splitext
from commonFunctions import getCoord, getDim, convert_to_Box
import traceback

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
    # Get the pre and post scan regions
    DATASEC = getCoord(first_seg['DATASEC'])
    BIASSEC = getCoord(first_seg['BIASSEC'])
    overscan = max(DATASEC['start_Y'], DATASEC['end_Y']) + 1
    prescan = min(DATASEC['start_X'], DATASEC['end_X']) + 1
    postscan = min(BIASSEC['start_X'], BIASSEC['end_X']) + 1
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
        seg_Y_converted  = num_Y-1-seg_Y
        boundary[seg_Y_converted][seg_X] = convert_to_Box(seg_detsec)
        # Condition about X & Y slicing in segment data.
        is_Slice_Reverse = check_Reverse_Slicing(seg_detsec, seg_datasec)
        # Add correct offset for each segment.
        boundary[seg_Y_converted][seg_X]['EXTNAME'] = header['EXTNAME']
        boundary_overscan[seg_Y_converted][seg_X] ={
                                                # NOTE: DS9 box region start from top left corner
                                                'x':seg_X*seg_dimension[0] + seg_datadim[0]/2,
                                                'y':seg_Y*seg_dimension[1] + seg_datadim[1]/2,
                                                'width':seg_datadim[0],
                                                'height':seg_datadim[1],
                                                'EXTNAME':header['EXTNAME']
                                                }
        boundary_overscan[seg_Y_converted][seg_X]['x'] += seg_bias_Size[0] if is_Slice_Reverse['x'] else (min(seg_datasec['start_X'], seg_datasec['end_X']))
        boundary_overscan[seg_Y_converted][seg_X]['y'] += (seg_dimension[1]-seg_datadim[1]) if is_Slice_Reverse['y'] else 0
        boundary[seg_Y_converted][seg_X]['index'] = boundary_overscan[seg_Y_converted][seg_X]['index'] = i
        boundary[seg_Y_converted][seg_X]['reverse_slice'] = boundary_overscan[seg_Y_converted][seg_X]['reverse_slice'] = is_Slice_Reverse

    return {
            'DETSIZE'       : {'x':DETSIZE[0], 'y':DETSIZE[1]},
            'DATASIZE'      : {'x':num_X*seg_datadim[0], 'y':num_Y*seg_datadim[1]},
            'NUM_AMPS'      : {'num':num_amps, 'x':num_X, 'y':num_Y},
            'SEG_SIZE'      : {'x':seg_dimension[0], 'y':seg_dimension[1]},
            'SEG_DATASIZE'  : {'x':seg_datadim[0], 'y':seg_datadim[1]},
            'OVERSCAN'      : {'PRE': prescan, 'POST': postscan, 'OVER': overscan},
            'BOUNDARY'      : boundary,
            'BOUNDARY_OVERSCAN' : boundary_overscan
    }

# Get Header information from multiple extension
# return as a dictionary object
def get_Header_Info(filename):
    try:
        with fits.open(filename) as fits_object:
            hdulist = [elem.header for elem in fits_object if elem.__class__.__name__ == 'ImageHDU']
            return _get_Header_Info(hdulist)
    except Exception as e:
        print("Exception in user code:")
        print("-"*60)
        traceback.print_exc(file=sys.stdout)
        print("-"*60)
        print("Error getting header info!\nException: " + str(e) + "\n")
        return ["Error when getting header info."]


if __name__ == "__main__":
    filename = "/home/wei/backend/images/imageE2V.fits"
    header = get_Header_Info(filename)
    print(json.dumps(header, sort_keys=True))
    json_name = splitext(filename)[0]+".json"
    with open(json_name, "w") as outfile:
        json.dump(header, outfile, sort_keys=True, indent=2)
