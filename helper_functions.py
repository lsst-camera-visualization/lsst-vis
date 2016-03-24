import six

def valid_boundary(boundary):
    boundary = [int(elem) for elem in boundary if (isinstance(elem, six.string_types) and (elem))]
    x_start, x_end = boundary[0], boundary[2]
    y_start, y_end = boundary[1], boundary[3]
    if (x_start > x_end):
        x_start, x_end = x_end, x_start
    if (y_start > y_end):
        y_start, y_end = y_end, y_start
    return x_start, x_end, y_start, y_end

# TODO: define a function that checks valid filenames
def valid_filename(filename):
    return filename
