import GameManager from ".";
import { ERRORS } from "../consts";
import SOCKET_EVENTS from "../SOCKET_EVENTS";

jest.useFakeTimers();
jest.spyOn(global, "setTimeout");

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
        let mockUnitySocket;
        beforeEach(() => {
            mockUnitySocket = {
                emit: jest.fn()
            };
            sut.unitySocket = mockUnitySocket;
        });

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

        it("Should send the new map to the unity client", () => {
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
            expect(mockUnitySocket.emit).toHaveBeenCalledWith(
                SOCKET_EVENTS.MAP_UPDATE,
                fakeMap
            );
        });

        it("Should throw NO_UNITY_CLIENT if no unity client is connected", () => {
            sut.unitySocket = undefined;
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

            expect(() => sut.setMap(fakeMap)).toThrow(ERRORS.NO_UNITY_CLIENT);
        });

        it("Should throw NO_UNITY_CLIENT if emit throws an error", () => {
            sut.unitySocket = {
                emit: jest.fn().mockImplementation(() => {
                    throw Error("Something went wrong");
                })
            };
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

            expect(() => sut.setMap(fakeMap)).toThrow(ERRORS.NO_UNITY_CLIENT);
        });
    });

    describe("triggerEvent", () => {
        let mockUnitySocket;
        beforeEach(() => {
            mockUnitySocket = {
                emit: jest.fn()
            };
            sut.unitySocket = mockUnitySocket;
            sut.currentMap = {
                "0,0": {
                    key: "someTool",
                    duration: 2,
                    frequency: 2,
                    triggerable: true,
                    lastCalled: 0
                }
            };
        });
        it("Should send a TRIGGER_EVENT to the unity client", () => {
            sut.triggerEvent("0,0");
            expect(mockUnitySocket.emit).toHaveBeenCalledWith(
                SOCKET_EVENTS.TRIGGER_EVENT,
                [0, 0]
            );
        });

        it("Should not emit an event if unity socket does not exist", () => {
            sut.unitySocket = undefined;
            sut.triggerEvent("0,0");
            expect(mockUnitySocket.emit).not.toHaveBeenCalled();
        });

        it("Should not emit an event if the specified coords are not an interactive tile", () => {
            sut.triggerEvent("1,1");
            expect(mockUnitySocket.emit).not.toHaveBeenCalled();
        });

        it("Should log the error message if something went wrong contacting the unity client", () => {
            sut.unitySocket = {
                emit: jest.fn().mockImplementation(() => {
                    throw Error("Something went wrong");
                })
            };
            console.log = jest.fn();

            sut.triggerEvent("0,0");
            expect(console.log).toHaveBeenCalledWith("Something went wrong");
            expect(console.log).toHaveBeenCalledWith(
                "Failed to emit event to unity client"
            );
        });

        it("Should set a timeout to set the tile as triggerable in amount of seconds frequency represents", () => {
            sut.triggerEvent("0,0");
            expect(sut.currentMap["0,0"].triggerable).toBe(false);
            const [setTimeoutCallback, delay] = setTimeout.mock.calls[0];
            expect(delay).toBe(2000);
            expect(setTimeoutCallback());
            expect(sut.currentMap["0,0"].triggerable).toBe(true);
        });
    });
});
