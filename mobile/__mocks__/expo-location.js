// Mock for expo-location
module.exports = {
  requestForegroundPermissionsAsync: jest
    .fn()
    .mockResolvedValue({ status: "granted" }),
  requestBackgroundPermissionsAsync: jest
    .fn()
    .mockResolvedValue({ status: "granted" }),
  getCurrentPositionAsync: jest.fn().mockResolvedValue({
    coords: { latitude: 48.8566, longitude: 2.3522 },
    timestamp: Date.now(),
  }),
  reverseGeocodeAsync: jest
    .fn()
    .mockResolvedValue([
      { isoCountryCode: "FR", country: "France", city: "Paris" },
    ]),
  getLastKnownPositionAsync: jest.fn().mockResolvedValue(null),
  watchPositionAsync: jest.fn().mockResolvedValue({ remove: jest.fn() }),
  Accuracy: {
    Lowest: 1,
    Low: 2,
    Balanced: 3,
    High: 4,
    Highest: 5,
    BestForNavigation: 6,
  },
  LocationAccuracy: {
    Lowest: 1,
    Low: 2,
    Balanced: 3,
    High: 4,
    Highest: 5,
    BestForNavigation: 6,
  },
};
