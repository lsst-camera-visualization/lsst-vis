
import taskDef

from astropy.io import fits
from FITS_Construct.ccdHeaderInfo import get_Header_Info as get_boundary

def task(task_params):
    ''' Return amplifier boundries of a FITS file based on its header information.
    @author Wei Ren
    @param task_params - task_params should specify the FITS file.
    @return
    '''

    filename = taskDef.IMAGE_ORIGINAL
    # TODO: Should change filename to task_params once the front end can specify where the FITS file is.
    json_str = get_boundary(filename)
    return json_str,None
