export default class SerialHandler {
    state = {};

    constructor(autoConnect, serialPort, parser) {
        this.serialPort = serialPort;
        this.parser = parser;
        this.connected = false;

        // there has to be a better way to solve this
        this.onOpen = this.onOpen.bind(this);
        this.onClose = this.onClose.bind(this);
        this.onError = this.onError.bind(this);
        this.reconnect = this.reconnect.bind(this);
        this.handleMessage = this.handleMessage.bind(this);

        if (autoConnect) {
            this.connect();
        }
    }

    connect() {
        // console.log(
        //     `Attempting to connect to ${this.serialPort.path} with baud rate ${this.serialPort.baudRate}`
        // );
        this.serialPort.pipe(this.parser);

        this.serialPort.on("open", this.onOpen);
        this.serialPort.on("close", this.onClose);
        this.serialPort.on("error", this.onError);

        this.parser.on("data", this.handleMessage);

        this.serialPort.open();

        return this.parser;
    }

    onOpen() {
        console.log(`Successfully connected to serial ${this.serialPort.path}`);
        this.connected = true;
    }

    onClose() {
        this.connected = false;
        setTimeout(this.reconnect, 5000);
    }

    onError() {
        this.connected = false;
        setTimeout(this.reconnect, 5000);
    }

    async safeWrite(message) {
        try {
            await this.serialPort.write(message);
        } catch (e) {
            console.error(e);
            console.log(
                `Failed to write message to ${this.serialPort.path} - is it connected?`
            );
        }
    }

    reconnect() {
        // console.log(`Attempting to reconnect to ${this.serialPort.path}`);
        if (!this.connected) {
            this.serialPort.open();
        }
    }

    handleMessage(content) {
        let bpm = Number(content.split(",")[0]);

        if (isNaN(bpm)) {
            bpm = 100;
        }

        if (this.state.bpm != bpm) {
            //console.log(`Updating BPM to ${bpm}`);  TODO RE-ENABLE THIS
        }

        this.state.bpm = bpm;
    }
}
