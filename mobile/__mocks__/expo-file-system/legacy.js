// Mock for expo-file-system/legacy
module.exports = {
  documentDirectory: "/mock/documents/",
  cacheDirectory: "/mock/cache/",
  downloadAsync: jest.fn().mockResolvedValue({ uri: "/mock/download.tmp" }),
  getInfoAsync: jest.fn().mockResolvedValue({ exists: true, size: 1024 }),
  readAsStringAsync: jest.fn().mockResolvedValue("mock-content"),
  writeAsStringAsync: jest.fn().mockResolvedValue(),
  deleteAsync: jest.fn().mockResolvedValue(),
  moveAsync: jest.fn().mockResolvedValue(),
  copyAsync: jest.fn().mockResolvedValue(),
  makeDirectoryAsync: jest.fn().mockResolvedValue(),
  readDirectoryAsync: jest.fn().mockResolvedValue([]),
  EncodingType: {
    UTF8: "utf8",
    Base64: "base64",
  },
  FileSystemUploadType: {
    BINARY_CONTENT: 0,
    MULTIPART: 1,
  },
};
