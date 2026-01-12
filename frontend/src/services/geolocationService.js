let wgsCoordinates = [];

export const geolocationService = {
  getPos: () => {
    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    };

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const crd = pos.coords;

          wgsCoordinates = [crd.longitude, crd.latitude];

          console.log("Your current position is:");
          console.log(`Latitude : ${crd.latitude}`);
          console.log(`Longitude: ${crd.longitude}`);
          console.log(`More or less ${crd.accuracy} meters.`);

          resolve(wgsCoordinates);
        },
        (err) => {
          console.warn(`ERROR(${err.code}): ${err.message}`);
          reject(err);
        },
        options
      );
    });
  },
};
