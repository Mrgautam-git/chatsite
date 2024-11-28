const io = require('socket.io')(5000, {
    cors: {
        origin: "*", // Allow all origins (for testing purposes)
    }
});

console.log('Socket.IO server running on port 5000');

// Store connected users
const users = {};

io.on('connection', socket => {
    console.log(`New user connected: ${socket.id}`);


    // Handle user joining
    socket.on('new-user-joined', name => {
        users[socket.id] = name;
        console.log(`${name} joined the chat`);

        // Check if this is the only user (first user)
        if (Object.keys(users).length === 1) {
            // Notify the first user that no one has joined yet
            socket.emit('no-one-joined', { message: 'No one has joined yet.' });
        }

        // Notify all other users that a new user has joined
        socket.broadcast.emit('user-joined', { message: `${name} has joined the chat`, name: 'Server' });
    });

    // Handle receiving messages
    socket.on('send-message', (data) => {
        // Ensure the message and name are being sent as strings
        const message = data.message;
        const name = data.name;
    
        // Emit the message to all clients
        io.emit('receive-message', { message, name });
    });

    // Handle user disconnect
    socket.on('disconnect', () => {
        const userName = users[socket.id];
        if (userName) {
            console.log(`${userName} disconnected`);
            // Notify all users that this user has left the chat
            socket.broadcast.emit('user-left', { message: `${userName} has left the chat`, name: 'Server' });
            // Remove user from the list of connected users
            delete users[socket.id];
        }
    });
});
