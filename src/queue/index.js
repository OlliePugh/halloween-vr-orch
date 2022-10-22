export default class Queue {
    contents = [];
    closed = false;

    static #queue;

    constructor(config = {}) {
        if (Queue.#queue) {
            return Queue.getInstance();
        }
        this.onAdd = config.onAdd;
        this.onRemove = config.onRemove;
        this.onChange = config.onChange;

        Queue.#queue = this;
    }

    static getInstance() {
        return Queue.#queue;
    }

    add(user, isVip) {
        if (!this.closed) {
            if (this.positionInQueue(user.clientId) === -1) {
                if (isVip) {
                    const queueReversed = this.contents.reverse();
                    let lastVipIndex = queueReversed
                        .map((item) => item[1])
                        .indexOf(true);
                    if (lastVipIndex === -1) {
                        lastVipIndex = this.contents.length;
                    }
                    let insertIndex = this.contents.length - lastVipIndex;
                    // will be one after

                    let addChance = 0.5;
                    for (
                        // TODO I'm pretty sure this can be worked out without using a loop
                        insertIndex;
                        insertIndex < this.contents.length;
                        insertIndex++
                    ) {
                        if (Math.random() > addChance) {
                            break; // insert the user at this insert index
                        } else {
                            addChance = addChance / 2;
                        }
                    }

                    this.contents.splice(insertIndex, 0, [user, true]);
                } else {
                    this.contents.push([user, false]);
                }
                this.onAdd?.(user);
                this.onChange?.();
            }
        }
    }

    remove(clientId) {
        const userPos = this.positionInQueue(clientId);
        if (userPos !== -1) {
            // the user is in the queue
            const user = this.contents[userPos];
            this.contents.splice(userPos, 1); // remove the one user
            this.onRemove?.(user[0]);
            this.onChange?.();
        }
    }

    positionInQueue(clientId) {
        // returns the index of the user
        for (let i = 0; i < this.contents.length; i++) {
            const currUser = this.contents[i][0];
            if (currUser.clientId === clientId) {
                return i;
            }
            this.onChange?.();
        }
        return -1;
    }

    getNext() {
        const newPlayer = this.contents.shift(); // remove the most recent
        if (newPlayer) {
            // if the queue has changed
            this.onChange?.();
        }
        return newPlayer;
    }

    close() {
        this.closed = true;
    }
}
