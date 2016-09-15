var socket = io();
var yourTiles = [];
var room_id, user_id, colorClass, oponentColorClass, lockedBy, interval;
var board = {};

$(document).on('click','div.grid', function(e){
	if($('#lock').prop('disabled') && lockedBy == user_id){
		socket.emit('played', {room_id:room_id,user_id:user_id,index:$(this).data('index')});
	}
});

$(document).on('click','#create_room', function(e){
	$('.joinRoomDiv').remove();
	socket.emit('create_room');
});

$(document).on('click','#join_room', function(e){
	$('.createRoomDiv').remove();
	room_id = $('#room_id').val();
	colorClass = 'yellow';
	oponentColorClass = 'red';
	socket.emit('join_room',room_id);

});

$(document).on('click','#lock', function(e){
	socket.emit('locked',{room_id:room_id,user_id:user_id});
});

function render(){
	for(user in board){
		if(user == user_id){
			paint(board[user], colorClass);
		}else{
			paint(board[user], oponentColorClass);
		}
	}
	calculateScore();
}

function paint(board, color){
	$('div.grid').removeClass(color);
	board.forEach(function(index){
		$('div.grid[data-index="'+index+'"]').addClass(color);
	});
}

function calculateScore(){
	$('td.you').html($('div.'+colorClass).length);
	$('td.opponent').html($('div.'+oponentColorClass).length);
}

function startTimeLimit(){
	clearInterval(interval);
	interval = setInterval(function(){
		socket.emit('unlock',{room_id:room_id});
		clearInterval(interval);
	},12000);
}

//listeners
socket.on('room_created', function(data){
	room_id = data.room_id;
	user_id = data.user_id;
	colorClass = 'red';
	oponentColorClass = 'yellow';
	$('.page-header .row').addClass('hidden');
	$('.room-code-info').removeClass('hidden');
	$('.room-code-info span').html(room_id);
});

socket.on('start', function(data){
	if(!user_id){
		user_id = data.user_id;
	}
	$('.game-form').hide();
	$('.game-grid').removeClass('hidden');
	$('#lock').html('Unlocked');
	$('#lock').removeClass('hidden');
	$('.score-card').removeClass('hidden');
});

socket.on('add', function(data){
	if(!board[data.user_id]){
		board[data.user_id] = [];
	}
	board[data.user_id].push(data.index);
	render();
});

socket.on('remove', function(data){
	var index = board[data.user_id].indexOf(data.index);
	board[data.user_id].splice(index,1);
	render();
});

socket.on('locked', function(data){
	lockedBy = data.user_id;
	$('#lock').prop('disabled', true);
	$('#lock').html('Locked');
	startTimeLimit();
});

socket.on('unlocked', function(data){
	$('#lock').prop('disabled', false);
	$('#lock').html('Unlocked');
});



