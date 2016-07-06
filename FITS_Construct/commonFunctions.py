# Convert the boundary coordincates from string(as in the header) to values.
# Assume to be a rectangular region (2-dimensional)
# Return value: list containing X and Y boundaries(in list form).
# NOTE: slicing are inclusive here.
def getCoord(s):
    coord_list = s.split(',')
    coord_list[0] = coord_list[0].split('[')[1].split(':')
    coord_list[1] = coord_list[1].split(']')[0].split(':')
    coord_list = [[int(value) for value in elem] for elem in coord_list]
    return {'start_X'   :coord_list[0][0]-1,
            'start_Y'   :coord_list[1][0]-1,
            'end_X'     :coord_list[0][1]-1,
            'end_Y'     :coord_list[1][1]-1
        }


# Get dimension information from a region.
def getDim(coords):
    return [abs(coords['end_X']-coords['start_X'])+1,
            abs(coords['end_Y']-coords['start_Y'])+1]

# Correct the order of the coordinate.
# Same format as ds9 box region
# NOTE: ds9 region uses image coord (start with 0).
def convert_to_Box(coords):
    x = min(coords['start_X'], coords['end_X'])
    y = min(coords['start_Y'], coords['end_Y'])
    width = abs(coords['end_X']-coords['start_X'])+1
    height = abs(coords['end_Y']-coords['start_Y'])+1
    return {'x':x, 'y':y, 'width':width, 'height':height}

# Return the correct slice for ndarray
def convert_slice(start, end):
    if start > end:
        end = None if end==0 else (end-1)
        return slice(start, end, -1)
    else:
        return slice(start, end+1)
