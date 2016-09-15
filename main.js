const path = require('path');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 3000;
var rooms = {};

app.use(express.static(path.join(__dirname,'assets')));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){

	socket.on('create_room', function(){
		const room_id = Math.floor(Math.random() * 1000);
		const user_id = Math.floor(Math.random() * 1000);
		socket.join(room_id);
		rooms[room_id] = {player_1:user_id};
		io.to(room_id).emit('room_created',{room_id:room_id,user_id:user_id});
	});

	socket.on('join_room', function(room_id){
		socket.join(room_id);
		const user_id = Math.floor(Math.random() * 1000);
		rooms[room_id] = {player_2:user_id};
		rooms[room_id] = {board:{}};
		io.to(room_id).emit('start',{room_id:room_id,user_id:user_id});
	});

	socket.on('played', function(data){
		var board = rooms[data.room_id];
		if(!board[data.index]){
			board[data.index] = data.user_id;
			io.to(data.room_id).emit('add',{room_id:data.room_id,user_id:data.user_id,index:data.index});
		}else{
			var owner = board[data.index];
			if(owner == data.user_id){
				delete(board[data.index]);
				io.to(data.room_id).emit('remove',{room_id:data.room_id,user_id:data.user_id,index:data.index});
			}
		}
		io.to(data.room_id).emit('unlocked');
	});

	socket.on('unlock', function(data){
		io.to(data.room_id).emit('unlocked');
	});

	socket.on('locked', function(data){
		io.to(data.room_id).emit('locked',{room_id:data.room_id,user_id:data.user_id});
	});

});


http.listen(PORT, function(){
	console.log('listening on *:'+PORT);
});