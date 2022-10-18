import SerialHandler from ".";

jest.useFakeTimers();
jest.spyOn(global, "setTimeout");

describe("SerialHandler", () => {
    let mockSerialPort;
    let mockParser;
    let sut;

    beforeEach(() => {
        mockSerialPort = {
            on: jest.fn(),
            open: jest.fn(),
            pipe: jest.fn(),
            write: jest.fn(),
            path: "bruh"
        };
        mockParser = {
            on: jest.fn()
        };

        sut = new SerialHandler(false, mockSerialPort, mockParser);
    });
    describe("constructor", () => {
        it("Should auto connect if the auto connect param is true", () => {
            new SerialHandler(true, mockSerialPort, mockParser);
            expect(mockSerialPort.open).toHaveBeenCalled();
        });

        it("Should set the serial port and parser to properties", () => {
            const serialHandler = new SerialHandler(
                false,
                mockSerialPort,
                mockParser
            );
            expect(serialHandler.serialPort).toBe(mockSerialPort);
            expect(serialHandler.parser).toBe(mockParser);
            expect(sut.connected).toBe(false);
        });
    });

    describe("connect", () => {
        it("Should call open on the serial port", () => {
            sut.connect();
            expect(mockSerialPort.open).toHaveBeenCalled();
        });

        it("Should add event listeners to port", () => {
            sut.connect();
            expect(mockSerialPort.on).toHaveBeenCalledWith("open", sut.onOpen);
            expect(mockSerialPort.on).toHaveBeenCalledWith(
                "close",
                sut.onClose
            );
            expect(mockSerialPort.on).toHaveBeenCalledWith(
                "error",
                sut.onError
            );
        });
        it("Should add data event to parser", () => {
            sut.connect();
            expect(mockParser.on).toBeCalledWith("data", sut.handleMessage);
        });
    });

    describe("onOpen", () => {
        it("Should set connected as true", () => {
            sut.connected = false;
            sut.onOpen();
            expect(sut.connected).toBe(true);
        });
    });

    describe("onClose", () => {
        it("Should set connected as false", () => {
            sut.connected = true;
            sut.onClose();
            expect(sut.connected).toBe(false);
        });

        it("Should set a timeout to reconnect every 5 seconds", () => {
            sut.onClose();
            expect(setTimeout).toHaveBeenCalledWith(sut.reconnect, 5000);
        });
    });

    describe("onError", () => {
        it("Should set connected as false", () => {
            sut.connected = true;
            sut.onError();
            expect(sut.connected).toBe(false);
        });

        it("Should set a timeout to reconnect every 5 seconds", () => {
            sut.onError();
            expect(setTimeout).toHaveBeenCalledWith(sut.reconnect, 5000);
        });
    });

    describe("safeWrite", () => {
        it("Should write a message on the port", async () => {
            await sut.safeWrite("my message!");
            expect(mockSerialPort.write).toHaveBeenCalledWith("my message!");
        });

        it("Should swallow an exception thrown by the write method", async () => {
            mockSerialPort.write.mockImplementation(() => {
                throw Error("something went pop");
            });
            await expect(() => {
                sut.safeWrite("something");
            }).not.toThrow();
        });
    });

    describe("reconnect", () => {
        it("Should try to reopen the port if the port is not connected", () => {
            sut.connected = false;
            sut.reconnect();
            expect(mockSerialPort.open).toHaveBeenCalled();
        });

        it("Should not try to reopen the port if the port is already connected", () => {
            sut.connected = true;
            sut.reconnect();
            expect(mockSerialPort.open).not.toHaveBeenCalled();
        });
    });

    describe("handleMessage", () => {
        it("Should log the message", () => {
            console.log = jest.fn();
            sut.handleMessage("my Message");
            expect(console.log).toHaveBeenCalledWith(
                "Message from bruh: my Message"
            );
        });
    });
});
