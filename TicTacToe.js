(function(global){
	const TicTacToe = {};
	global.TicTacToe = TicTacToe;

	let stop = false;
	var GameBoard;

	const win_combos = ['012','345','678','036','147','258','048','246'];

	Tile.prototype.value = "";
	Tile.prototype.draw = function(){
		ctx.strokeStyle = 'gray';
		ctx.lineWidth = 5;
		if(this.miniBoard){
			this.miniBoard.draw();
			ctx.strokeStyle = 'gray';
			ctx.lineWidth = 10;
			if(this.active){
				ctx.strokeStyle = 'green';
			}
		}
		let ct = this.getCenter();

		let sc2 = this.grid.scale/2;
		ctx.beginPath();
		ctx.rect(ct.x-sc2,ct.y-sc2,sc2*2,sc2*2);
		if(this.miniBoard && this.value){
			ctx.fillStyle = 'rgba(0,0,0,.5)';
			ctx.fill();
		}
		ctx.stroke();

		if(this.value == 'X'){
			ctx.beginPath();
			ctx.strokeStyle = 'red';
			ctx.moveTo(ct.x-sc2+sc2/5,ct.y-sc2+sc2/5);
			ctx.lineTo(ct.x+sc2-sc2/5,ct.y+sc2-sc2/5);
			ctx.moveTo(ct.x-sc2+sc2/5,ct.y+sc2-sc2/5);
			ctx.lineTo(ct.x+sc2-sc2/5,ct.y-sc2+sc2/5);
			ctx.stroke();
		} else if(this.value == 'O'){
			ctx.beginPath();
			ctx.strokeStyle = 'blue';
			ctx.arc(ct.x,ct.y,sc2*.8,0,Math.PI*2);
			ctx.stroke();
		}
	}

	Grid.prototype.draw = function(){
		this.forEach(tile=>{
			tile.draw();
		})	
	}

	class Board{
		constructor(){
			this.grid = new Grid(3,3,canvas.width/3);
			const THIS = this;
			let sc2 = this.grid.scale/2;
			this.grid.forEach(tile=>{
				tile.inPlay = true;
				tile.miniBoard = new Grid(3,3,THIS.grid.scale/3);
				tile.miniBoard.forEach(tile=>{tile.inPlay=true});
				tile.miniBoard.parent = tile;
				let ct = tile.getCenter();
				tile.miniBoard.offsetX = ct.x - sc2;
				tile.miniBoard.offsetY = ct.y - sc2;
			});
		}
		draw(){
			this.grid.draw();
		}
	}

	function start(canvas){
		global.canvas = canvas;
		global.ctx = canvas.getContext('2d');
		GameBoard = new Board;
		TicTacToe.GameBoard = GameBoard;
		mouse.start(canvas);
		Touch.init(start=>{
			mouse.pos.x = start.x;
			mouse.pos.y = start.y;
			mouse.down = true;
		},move=>{},end=>{
			mouse.down = false;
		});
		loop();
	}

	let selected_big = null;
	let turn = 'X',turnCounter = 0;

	function nextTurn(){
		turn = turn == 'X' ? 'O' : 'X';
		turnCounter++;
	}

	function markOff(tile,bigbox=false){
		tile.value = turn;
		tile.inPlay = false;
		if(bigbox){
			checkWin();
			return;
		}
		checkBox(tile.grid.parent);
		if(selected_big) selected_big.active = false;
		selected_big = GameBoard.grid.getTileAt(tile.x,tile.y);
		if(isFull(selected_big)) selected_big=null;
		if(selected_big) selected_big.active = true;
		mouse.down = false;
		nextTurn();
	}

	function checkWin(){
		let game_over = checkBox(GameBoard,true);
		if(game_over){
			alert(turn+' wins!');
			stop = true;	
		}
	}

	function checkBox(box,final=false){
		if(!box.inPlay&&!final) return;
		let arr = (final?GameBoard.grid.tiles:box.miniBoard.tiles).flat().map(e=>e.value);
		if(final) console.log(arr);
		for(let combo of win_combos){
			let prevletter = arr[combo[0]];
			if(prevletter == '') continue;
			let score = 0;
			for(let letter of combo){
				if(arr[letter] !== prevletter) break;
				score++;
			}
			if(score == 3){
				if(final) return true;
				markOff(box,true);
			}
		}
	}

	function isFull(box){
		let arr = box.miniBoard.tiles.flat().map(e=>e.value);
		return !arr.includes('');
	}

	function loop(){
		if(!stop) setTimeout(loop,1000/30);
		ctx.clearRect(-2,-2,canvas.width+2,canvas.height+2);
		if(GameBoard){

			let hover_big = GameBoard.grid.getActiveTile(),hover_little;

			if(mouse.down){

				if(hover_big){
					hover_little = hover_big.miniBoard.getActiveTile();
					// if(mouse.down) console.log(hover_little);

					if(selected_big == null){
						if(hover_little.inPlay) markOff(hover_little);
					} else {
						if(selected_big == hover_big && hover_little.inPlay){
							markOff(hover_little);
						}
					}
				}
			}

			GameBoard.draw();

			if(selected_big){
				selected_big.draw();
			}
		}
	}


	TicTacToe.start = start;

})(this);