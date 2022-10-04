import MockGameManager from "../game-manager";
import Factory from ".";

jest.mock("../game-manager", () => jest.fn());

describe("factory", () => {
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
});
