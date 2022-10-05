import GameManager from "../game-manager";
import * as redis from "redis";

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
        const redisClient = this.createRedisClient();
        const gameManager = new GameManager(redisClient);
        this.instances.gameManager = gameManager;
        return gameManager;
    }

    static async createRedisClient() {
        if (this.instances.redisClient) {
            return this.instances.redisClient;
        }
        const redisClient = redis.createClient();
        await redisClient.connect();

        redisClient.on("error", (err) =>
            console.log("Redis Client Error", err)
        );

        this.instances.redisClient = redisClient;
        return redisClient;
    }
}

export default Factory;
