import GameManager from ".";

jest.mock("../tools", () => ({
    someTool: {
        interaction: {
            frequency: 2,
            duration: 2
        }
    },
    anotherTool: {}
}));

describe("GameManager", () => {
    const sut = new GameManager();
    describe("setUnitySocket", () => {
        it("Should modify the unity socket", () => {
            const mockUnitySocket = jest.fn();
            sut.setUnitySocket(mockUnitySocket);
            expect(sut.unitySocket).toBe(mockUnitySocket);
        });
    });

    describe("setMap", () => {
        it("Should not add the tile to the internal interactive map if the interactive tile can not be found in the list of tools", () => {
            const fakeMap = [
                [
                    {
                        type: {
                            key: "bruh",
                            interaction: {
                                duration: 1000,
                                frequency: 10
                            }
                        }
                    }
                ]
            ];
            sut.setMap(fakeMap);

            expect(sut.currentMap["0,0"]).toBe(undefined);
        });

        it("Should set the map property to the given map", () => {
            const fakeMap = [
                [
                    {
                        type: {
                            key: "someTool",
                            interaction: {
                                duration: 2,
                                frequency: 2
                            }
                        }
                    }
                ]
            ];
            sut.setMap(fakeMap);
            expect(sut.currentMap["0,0"]).toStrictEqual({
                key: "someTool",
                duration: 2,
                frequency: 2,
                triggerable: true,
                lastCalled: 0
            });
        });

        it("Should not add non-interactive tiles to the list, even if the client said it is interactive", () => {
            const fakeMap = [
                [
                    {
                        type: {
                            key: "anotherTool",
                            interaction: {
                                duration: 2,
                                frequency: 2
                            }
                        }
                    }
                ]
            ];
            sut.setMap(fakeMap);
            expect(sut.currentMap["0,0"]).toBe(undefined);
        });
    });
});
