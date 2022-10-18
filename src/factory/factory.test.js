import {
    SerialPort as MockSerialPort,
    ReadlineParser as MockReadlineParser
} from "serialport";
import MockSerialHandler from "../serial-handler";
import MockGameManager from "../game-manager";
import Factory from ".";
import mockRedis from "redis";

jest.mock("redis", () => ({
    createClient: jest.fn()
}));

jest.mock("serialport", () => ({
    SerialPort: jest.fn(),
    ReadlineParser: jest
        .fn()
        .mockImplementation(() => ({ fakeReadLineParser: "naw" }))
}));

jest.mock("../serial-handler", () => jest.fn());

jest.mock("../game-manager", () => jest.fn());

describe("factory", () => {
    let mockRedisClient;

    beforeEach(() => {
        mockRedisClient = {
            on: jest.fn(),
            connect: jest.fn()
        };
        mockRedis.createClient.mockReturnValue(mockRedisClient);
    });

    afterEach(() => {
        Factory.instances = {}; // reset the state
    });

    describe("Constructor", () => {
        it("Should throw an abstract class error", () => {
            expect(() => {
                new Factory();
            }).toThrow("Abstract Class");
        });
    });

    describe("GameManager", () => {
        it("Should return a game manager", () => {
            Factory.createGameManager();
            expect(MockGameManager).toHaveBeenCalled();
        });

        it("Should return an already created instance instead of creating a new one", () => {
            const firstGameManager = Factory.createGameManager();
            expect(Factory.createGameManager()).toBe(firstGameManager);
        });
    });

    describe("CreateRedisClient", () => {
        it("Should call createClient and connect the redis client", async () => {
            await Factory.createRedisClient();
            expect(mockRedisClient.connect).toHaveBeenCalled();
        });

        it("Should add an event for errors to the redis client", async () => {
            console.log = jest.fn();

            await Factory.createRedisClient();
            expect(mockRedisClient.on).toHaveBeenCalledWith(
                "error",
                expect.any(Function)
            );
            const callback = mockRedisClient.on.mock.calls[0][1];

            const fakeError = Error("pop");
            callback(fakeError);
            expect(console.log).toHaveBeenCalledWith(
                "Redis Client Error",
                fakeError
            );
        });

        it("Should return an already created instance instead of creating a new one", async () => {
            const firstRedisClient = await Factory.createRedisClient();
            expect(await Factory.createRedisClient()).toBe(firstRedisClient);
        });
    });
    describe("CreateSerialHandler", () => {
        let fakeSerialPort = jest.fn();
        let fakeReadlineParser = jest.fn();
        beforeEach(() => {
            MockSerialPort.mockImplementation(() => fakeSerialPort);
            MockReadlineParser.mockImplementation(() => fakeReadlineParser);
        });
        it("Should create a SerialPort with the specific port and baudRate", () => {
            Factory.createSerialHandler(
                { path: "wibble", baudRate: 123 },
                false
            );
            expect(MockSerialPort).toHaveBeenCalledWith({
                path: "wibble",
                baudRate: 123,
                autoOpen: false
            });
            expect(MockReadlineParser).toHaveBeenCalled();
            expect(MockSerialHandler).toHaveBeenCalledWith(
                false,
                fakeSerialPort,
                fakeReadlineParser
            );
        });

        it("Should return an already created instance instead of creating a new one", () => {
            const firstSerialHandler = Factory.createSerialHandler({
                path: "wibble",
                baudRate: 123,
                autoOpen: false
            });
            expect(
                Factory.createSerialHandler({
                    path: "wibble",
                    baudRate: 123,
                    autoOpen: false
                })
            ).toBe(firstSerialHandler);
        });
    });
});
