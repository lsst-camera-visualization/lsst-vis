# Transforms the histogram data from what Numpy returns to what Firefly expects.
# Firefly data should be an array of [binValue, binMin, binMax].
# Seperates the hist values from underfow and overflow by one empty bin
def NumpyToFireflyHist(hist):
    vals, binEdges = hist[0], hist[1]

    fireflyHist = []
    # Loop through main histogram
    for v,i in zip(vals, range(len(vals))):
        fireflyHist.append([float(v), float(binEdges[i]), float(binEdges[i+1])])

    return fireflyHist
