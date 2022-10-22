import SOCKET_EVENTS from "../SOCKET_EVENTS";

const broadcastQueueUpdate = (queue, io) => {
    // io.emit(SOCKET_EVENTS.QUEUE_UPDATE, { total: queue.contents.length });
    // AdminHandler.getAdmins().forEach((admin) => {
    //     updateAdminQueue(io.sockets.to(admin), queue);
    // }); // send update to each admin
    queue.contents.forEach(([user, _], index) => {
        // for each person in the queue
        io.sockets.to(user.socketId).emit(SOCKET_EVENTS.QUEUE_POSITION_UPDATE, {
            position: index + 1,
            queueSize: queue.contents.length
        });
    });
};

export default broadcastQueueUpdate;
