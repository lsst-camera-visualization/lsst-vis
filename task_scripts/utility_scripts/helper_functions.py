import six
import os
import numpy as np

# Deprecated
def valid_boundary(boundary):
    try:
        boundary = list(map(int, boundary))
    except:
        boundary = [0, 1, 0, 1]
    x_start, x_end = boundary[0], boundary[2]
    y_start, y_end = boundary[1], boundary[3]
    # os.system("echo %d %d %d %d > /www/algorithm/debug_file" % (x_start, x_end, y_start, y_end))
    if (x_start > x_end):
        x_start, x_end = x_end, x_start
    if (y_start > y_end):
        y_start, y_end = y_end, y_start
    return x_start, x_end, y_start, y_end

def parseRegion_rect(region):
    slicing = (slice(region['y1'],region['y2']), slice(region['x1'],region['x2']))
    return slicing

# a,b is the coordinate (X, Y) of the circle origin.
def circle_mask(region_orig, region_circ):
    # TODO: double check the order of row and column.
    a, b, radius = region_circ['center_x'], region_circ['center_y'], region_circ['radius']
    ny, nx = region_orig.shape
    y, x = np.ogrid[-b:ny-b, -a:nx-a]
    mask = y*y + x*x <= radius*radius
    circle = np.zeros((ny,nx))
    circle[mask] = 1
    return circle

# TODO: define a function that checks valid filenames
def valid_filename(filename):
    return filename
