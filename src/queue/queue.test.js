import Queue from ".";

describe("Queue", () => {
    const onAdd = jest.fn();
    const onRemove = jest.fn();
    const onChange = jest.fn();
    let sut;
    let fakeUser;

    beforeEach(() => {
        if (!sut) {
            // if the constructor tests have not been ran
            sut = new Queue({ onAdd, onRemove, onChange });
        }
        fakeUser = {
            clientId: "loz",
            socketId: "laz"
        };
    });

    afterEach(() => {
        sut.contents = [];
    });

    describe("Constructor", () => {
        it("Should set the static queue variable as the first and only instance", () => {
            sut = new Queue({ onAdd, onRemove, onChange });
            expect(Queue.getInstance()).toBe(sut);
        });

        it("Should return the already created instance instead of making new ones", () => {
            if (!sut) {
                // if the constructor tests have not been ran
                sut = new Queue({ onAdd, onRemove, onChange });
            }
            expect(new Queue()).toBe(sut);
        });
    });

    describe("add method", () => {
        beforeEach(() => {
            jest.spyOn(global.Math, "random");
        });

        it("Should add the user as a non VIP with the VIP as false", () => {
            sut.add(fakeUser, false);
            expect(sut.contents[0][0]).toBe(fakeUser);
            expect(sut.contents[0][1]).toBe(false);
        });

        it("Should add the user as a VIP with the VIP as true", () => {
            sut.add(fakeUser, true);
            expect(sut.contents[0][0]).toBe(fakeUser);
            expect(sut.contents[0][1]).toBe(true);
        });

        it("Should add a VIP user after last vip user", () => {
            const mockUser = {
                clientId: "wibble",
                socketId: "wobble"
            };

            sut.contents = [
                [mockUser, false],
                [mockUser, false],
                [mockUser, true]
            ];
            sut.add(fakeUser, true);
            expect(sut.contents[3][0]).toBe(fakeUser);
            expect(sut.contents[3][1]).toBe(true);
        });

        it("Should add a VIP user after last vip user", () => {
            const mockUser = {
                clientId: "wibble",
                socketId: "wobble"
            };

            sut.contents = [
                [mockUser, false],
                [mockUser, true]
            ];
            sut.add(fakeUser, true);
            jest.spyOn(global.Math, "random").mockReturnValue(1);
            expect(sut.contents[2][0]).toBe(fakeUser);
            expect(sut.contents[2][1]).toBe(true);
        });

        it("Should increase the for a position each time a player joins", () => {
            const mockUser = {
                clientId: "wibble",
                socketId: "wobble"
            };
            jest.spyOn(global.Math, "random").mockReturnValue(0.126);

            sut.contents = [
                [mockUser, false], // 0.5 to hit this
                [mockUser, false], // 0.25
                [mockUser, false], // 0.125
                [mockUser, false],
                [mockUser, false],
                [mockUser, false]
            ];
            sut.add(fakeUser, true);
            console.log(sut.contents);
            expect(sut.contents[2][0]).toBe(fakeUser);
            expect(sut.contents[2][1]).toBe(true);
        });

        it("Should not add the user if they are already in the queue", () => {
            sut.add(fakeUser, false);
            sut.add(fakeUser, false);
            expect(sut.contents.length).toBe(1);
        });

        it("Should call add callback and change callback on addition to queue", () => {
            sut.add(fakeUser, true);
            expect(onAdd).toHaveBeenCalledWith(fakeUser);
            expect(onChange).toHaveBeenCalled();
        });

        it("Should not add the user if the queue is closed", () => {
            sut.close();
            sut.add(fakeUser, true);
            expect(sut.contents.length).toBe(0);
            sut.closed = false;
        });
    });

    describe("Remove", () => {
        let user2;
        beforeEach(() => {
            sut.add(fakeUser, false);
            user2 = {
                clientId: "bruh",
                socketId: "brah"
            };
            sut.add(user2, false);
        });
        it("Should remove the user from the queue", () => {
            sut.remove(fakeUser.clientId);
            expect(sut.contents).not.toContainEqual([fakeUser, false]);
            expect(sut.contents).toContainEqual([user2, false]);
        });

        it("Should do nothing if the user can not be found", () => {
            sut.remove({});
            expect(sut.contents).toContainEqual([fakeUser, false]);
            expect(sut.contents).toContainEqual([user2, false]);
        });

        it("Should call onRemove and onChange if they are specified", () => {
            sut.remove(fakeUser.clientId);
            expect(onRemove).toHaveBeenCalledWith(fakeUser);
            expect(onChange).toHaveBeenCalled();
        });
    });

    describe("getNext", () => {
        it("Should get the user at the front of the queue", () => {
            sut.add(fakeUser, false);
            const user2 = {
                clientId: "bruh",
                socketId: "brah"
            };
            sut.add(user2, false);
            expect(sut.getNext()).toMatchObject([fakeUser, false]);
        });
    });

    describe("Close", () => {
        afterEach(() => {
            sut.closed = false;
        });
        it("Should modify the queue to be in a closed state", () => {
            sut.close();
            expect(sut.closed).toBe(true);
        });
    });

    describe("GetInstance method", () => {
        it("Should return itself", () => {
            expect(Queue.getInstance()).toBe(sut);
        });
    });
});
