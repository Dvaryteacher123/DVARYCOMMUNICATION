require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// ===== Middleware =====
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Make io available inside routes
app.set('io', io);

// ===== MongoDB Connection =====
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB imeunganishwa'))
  .catch(err => console.error('❌ MongoDB error:', err.message));

// ===== Routes =====
const chatRoutes = require('./routes/chatRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/', chatRoutes);
app.use('/admin', adminRoutes);

// ===== Socket.io (Live Chat) =====
io.on('connection', (socket) => {
  console.log('🔌 Mtumiaji ameunganishwa:', socket.id);

  // Mteja/admin kujiunga na room
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
  });

  // Admin kujiunga na chumba maalum cha admin
  socket.on('adminJoin', () => {
    socket.join('admin');
  });

  // Ujumbe mpya
  socket.on('chatMessage', (data) => {
    // data = { roomId, sender, text }
    io.to(data.roomId).emit('message', data);
    io.to('admin').emit('message', data);
  });

  socket.on('disconnect', () => {
    console.log('❌ Mtumiaji ameondoka:', socket.id);
  });
});

// ===== Start Server =====
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server inakimbia: http://localhost:${PORT}`);
});
