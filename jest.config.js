
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    roots: ["<rootDir>/src"],
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
    testMatch: [
        "**/__tests__*.test.[jt]s?(x)",
        "**/?(*.)+(spec|test).[jt]s?(x)"
    ],
};