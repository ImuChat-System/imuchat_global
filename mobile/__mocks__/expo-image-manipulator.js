// Mock for expo-image-manipulator
module.exports = {
  manipulateAsync: jest.fn().mockResolvedValue({
    uri: "compressed-uri",
    width: 1200,
    height: 800,
  }),
  SaveFormat: {
    JPEG: "jpeg",
    PNG: "png",
    WEBP: "webp",
  },
  FlipType: {
    Horizontal: "horizontal",
    Vertical: "vertical",
  },
  ActionType: {
    Resize: "resize",
    Rotate: "rotate",
    Flip: "flip",
    Crop: "crop",
  },
};
