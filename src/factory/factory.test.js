import MockGameManager from "../game-manager";
import Factory from ".";
import mockRedis from "redis";

jest.mock("redis", () => ({
    createClient: jest.fn()
}));

jest.mock("../game-manager", () => jest.fn());

describe("factory", () => {
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
        let mockRedisClient;

        beforeEach(() => {
            mockRedisClient = {
                on: jest.fn(),
                connect: jest.fn()
            };
            mockRedis.createClient.mockReturnValue(mockRedisClient);
        });
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
});
