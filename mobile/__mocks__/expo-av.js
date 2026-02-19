// Mock for expo-av
module.exports = {
  Video: {
    RESIZE_MODE_CONTAIN: "contain",
    RESIZE_MODE_COVER: "cover",
  },
  ResizeMode: {
    CONTAIN: "contain",
    COVER: "cover",
    STRETCH: "stretch",
  },
  Audio: {
    Sound: {
      createAsync: jest.fn().mockResolvedValue({
        sound: {
          playAsync: jest.fn(),
          pauseAsync: jest.fn(),
          stopAsync: jest.fn(),
          unloadAsync: jest.fn(),
          setPositionAsync: jest.fn(),
          setVolumeAsync: jest.fn(),
          setStatusAsync: jest.fn(),
          getStatusAsync: jest.fn().mockResolvedValue({ isLoaded: true }),
        },
        status: { isLoaded: true },
      }),
    },
    setAudioModeAsync: jest.fn(),
    setIsEnabledAsync: jest.fn(),
  },
};
