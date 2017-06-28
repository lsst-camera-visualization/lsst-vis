from scipy.ndimage.filters import generic_filter

# Creates a rectangular slice
def _CreateRectangularSlice(value):
    # Add 1 to include the right and bottom edges
    ySlice = slice(value["y1"], value["y2"] + 1)
    xSlice = slice(value["x1"], value["x2"] + 1)
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
    def __init__(self, type, value):
        self._type = type
        self._value = value

    # Executes f over the circular region
    def _executeCircle(self, imageData, f):
        mask = _CreateCircularMask(imageData, self._value)
        return generic_filter(imageData, f, footprint=mask)

    # Executes f over the rectangular region
    def _executeRect(self, imageData, f):
        rectSlice = _CreateRectangularSlice(self._value)
        roi = imageData[rectSlice]
        return f(roi)

    def execute(self, imageData, fRect, fCirc = None):
        """
        Executes a function over a region of an image.
        :param imageData: An array containing the image data.
        :param fRect, fCirc: The functions to be executed over rectangular and circular regions, respectively. If fCirc is not specified or is None, fRect will be used for both.
        """
        if self._type == "rect":
            return self._executeRect(imageData, fRect)
        elif self._type == "circ":
            return self._executeCircle(imageData, fCirc if fCirc != None else fRect)
