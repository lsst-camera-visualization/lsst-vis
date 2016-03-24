import six
import os

def valid_boundary(boundary):
    boundary = [int(elem) for elem in boundary if ((isinstance(elem, six.string_types) or isinstance(elem, int)) and (elem or elem==0))]
    # os.system("echo %d %d %d %d > /www/algorithm/debug_file" % (boundary[0], boundary[1], boundary[2], boundary[3]))
    x_start, x_end = boundary[0], boundary[2]
    y_start, y_end = boundary[1], boundary[3]
    # os.system("echo %d %d %d %d > /www/algorithm/debug_file" % (x_start, x_end, y_start, y_end))
    if (x_start > x_end):
        x_start, x_end = x_end, x_start
    if (y_start > y_end):
        y_start, y_end = y_end, y_start
    return x_start, x_end, y_start, y_end

# TODO: define a function that checks valid filenames
def valid_filename(filename):
    return filename
