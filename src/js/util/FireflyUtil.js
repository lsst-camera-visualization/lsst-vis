// Firefly interface

export const FireflyUtil = {
    LoadImage: (plotID, imageURL) => {
        firefly.showImage(plotID, {
            plotId: plotID,
            URL: imageURL,
            Title: "Title: " + imageURL,
            ZoomType: "TO_WIDTH",
            ZoomToWidth: '100%'
        });
    },

    LaunchTask: (taskName, params, viewer) => {
        params.image_url = (taskName === "boundary") ? viewer.original_image_url : viewer.image;

        return firefly.getJsonFromTask('python', taskName, params);
    },
}
