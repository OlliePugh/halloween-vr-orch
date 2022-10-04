import GameManager from "../game-manager";

class Factory {
    static instances = {};

    constructor() {
        throw new TypeError("Abstract Class");
    }

    static createGameManager() {
        if (this.instances.gameManager) {
            // only ever create one instance
            return this.instances.gameManager;
        }
        const gameManager = new GameManager();
        this.instances.gameManager = gameManager;
        return gameManager;
    }
}

export default Factory;
