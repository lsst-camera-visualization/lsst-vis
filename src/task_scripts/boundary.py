from astropy.io import fits
from util.fitsHandler import fitsHandler

def task(filename, task_params):
    ''' Return amplifier boundries of a FITS file based on its header information.
    @author Wei Ren
    @param task_params - task_params should specify the FITS file.
    @return A dictionary that contains relevant header and boundary information
    '''

    with fitsHandler(filename) as fitsImage:
        headerInfo = fitsImage.getHeader()

    return headerInfo, None
