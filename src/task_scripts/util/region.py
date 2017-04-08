# Utility functions for parsing regions
from scipy.ndimage.filters import generic_filter

# Creates a rectangular slice
def _CreateRectangularSlice(value):
    ySlice = slice(self._value["y1"], self._value["y2"])
    xSlice = slice(self._value["x1"], self._value["x2"])
    return (ySlice, xSlice)

# Creates a mask with a circular shape, ie a value of 1 inside the circle,
#   and a value of 0 outside the circle.
def _CreateCircularMask(imageData, circ):
    # Read the circle data
    origX, origY, radius = circ["center_x"], circ["center_y"], circ["radius"]
    ny, nx = imageData.shape
    # Black magic
    y, x = np.ogrid[-origY:ny-origY, -origX:nx-origX]
    # Creates a boolean array, True where the point is in the circle
    mask = y*y + x*x <= radius*radius
    circle = np.zeros((ny,nx))
    # Change the true values from mask into 1's
    circle[mask] = 1
    return circle


class Region:
    def __init__(type, value):
        if type == "rect":
            self._exec = executeRect
            self._rectSlice = _CreateRectangularSlice(value)
        else
            self._exec = executeCircle
            self._value = value

        self._value = value

    # Executes f over the circular region
    def executeCircle(imageData, f):
        mask = _CreateCircularMask(imageData, self._value)
        return generic_filter(imageData, f, footprint=mask)

    # Executes f over the rectangular region
    def executeRect(imageData, f):
        roi = imageData[self._rectSlice]
        return f(roi)

    # Executes f over the region
    def execute(imageData, f):
        return self._exec(imageData, f)
