var socket;

let video;
let poseNet;
let pose;
let hat;
let tree;
let treeFlip;
let greenBird;
let blueBird;
let yellowBird;
let pinkBird;
let birdL = [];
let birdR = [];
let shoulderL = 0;//左肩膀上没有鸟
let shoulderR = 0;//右肩膀上没有鸟
let nR;
let nL;
let scores = 0;
let arr = [];

let gameState = 0;//游戏进行状态
let win = 0;
let music;
let  musicState = 0;

let timer = 60;//倒计时

function preload(){
	soundFormats('mp3', 'ogg');
	music = loadSound('music/music.mp3');
	//hat = loadImage('img/hat.png');
	tree1 = loadImage('img/tree.png');
	treeFlip1 = loadImage('img/treeFlip.png');
	greenBird = loadImage('img/greenBird.png');
	blueBird = loadImage('img/blueBird.png');
	yellowBird = loadImage('img/yellowBird.png');
	pinkBird = loadImage('img/pinkBird.png');

	video = createCapture(VIDEO, () => {
		video.size(640, 480);
		video.hide();
	});
}

function setup() {
	//🌟🌟🌟🌟🌟🌟
	createCanvas(640, 480);

	//🌟🌟🌟🌟🌟🌟
	//video = createCapture(VIDEO);
	//video.size(640, 480);
	//video.hide();

	poseNet = ml5.poseNet(video, modelLoaded);
	poseNet.on('pose', gotPoses);

	for(let i = 1; i < 60; i++){
		let ran1 = Math.floor(random(1,5));
		//console.log(ran1);
		birdR[i] = new Bird(300, -100*i*4, ran1);
		let ran2 = Math.floor(random(1,5));
		//console.log(ran2);
		birdL[i] = new Bird(300, -170*i*4, ran2);
	  }

	treeFlip = new TreeFlip();
	tree = new Tree();

	//🌟🌟🌟🌟🌟🌟
	//socket = io.connect('http://5386w319o8.qicp.vip');
	//socket = io.connect('http://localhost:3000'); 
	socket = io.connect('https://saving-birds.herokuapp.com/');
	
	socket.on('gameState', function(temp){
		console.log('got temp: ' + temp);
		gameState = temp;
		console.log('gameState: ' + gameState);
	    timer = 60;
	});

}

  
  
function gotPoses(poses){
	//console.log(poses);
	if(poses.length > 0){
	  pose = poses[0].pose;
	}
  }
  
  
function modelLoaded() {
	console.log('poseNet ready');
  }
  
  function keyPressed(){
	if(key == 's'){  //按下s游戏开始
	  gameState = 1;
	  //snake = new Snake();

	  timer = 60;
	  scores = 0;
	  let temp = gameState;
	  socket.emit('gameState', temp);
	}
	
  }
  
  
  function draw() {
	//background(220);

	//🌟🌟🌟🌟🌟🌟
	translate(video.width, 0);
	scale(-1, 1);
	image(video, 0, 0);
	//image(video, 640, 480, 0, 0);
	translate(640, 0);
	scale(-1, 1);
	image(video, 0, 0, width, width * video.height / video.width);

	// translate(video.width, 0);
	// scale(-1, 1);
	// image(video, 0, 0);

	if(timer <= 0){
		gameState = 0;
		music.stop();
		musicState = 0;
		textSize(60);
		text('YOU GOT '+scores+' SCORES', 20, 250);
	}
	
	var newArr = [];
	  var o = {};  // { 1:true, 2:true}
	  for (let i = 0; i < arr.length; i++) {
		  var t = arr[i];
		  if(o[t]){  			// 标记是否处理过 
						  
		  }else{
			  newArr.push(arr[i]);
			  o[t] = true;
		  }
	 }
	 scores = newArr.length;
	//console.log(newArr)

	if(gameState){
		musicState++;
		if(musicState == 1){
			music.play();
		}
		textSize(50);
		text('SCORES: '+scores, 20, 60);

		if (frameCount % 40 == 0 && timer > 0) { 
			//console.log(timer);
			timer--;
		  }
		  textSize(50);
		  //fill(217, 104, 49);
		  text('Time: '+timer, 400, 60);//显示倒计时
		  translate(640, 0);
		  scale(-1, 1);
		treeFlip.show();
		tree.show();
		let cnt = 0;
		for(let i = 1; i < 60; i++){
		  
			if(pose){
			  
				let dRT = dist(birdR[i].x, birdR[i].y, treeFlip.x, treeFlip.y);
			  if(dRT < 150){
				birdR[i].hitRT();
				treeFlip.in();
				shoulderR = 0;
				//scores++;
				append(arr, i);
			  }else{
				if(treeFlip.x < -50){
				  treeFlip.out();
				}
				birdR[i].show();
				birdR[i].move();
	  
				  let dR = dist(birdR[i].x+20, birdR[i].y+30, pose.rightShoulder.x, pose.rightShoulder.y);
				  if(dR < 100 & shoulderR == 0){
					nR = i;
					birdR[i].hitR();
					shoulderR = 1;
				  }else if(dR < 100 & shoulderR == 1){
					birdR[nR].hitR();
				  }
				
			  }
	  
			  
			  let dLT = dist(birdL[i].x+40, birdL[i].y+40, tree.x+150, tree.y+100);
			  if(dLT < 50){
				birdL[i].hitLT();
				tree.in();
				shoulderL = 0;
				//scores++;
				append(arr, i+60);
				
			  }else{
				if(tree.x > 400){
				  tree.out();
				}
				birdL[i].show();
				birdL[i].move();
				let dL = dist(birdL[i].x, birdL[i].y, pose.leftShoulder.x, pose.leftShoulder.y);
				if(dL < 100 & shoulderL == 0){
				  nL = i;
				  birdL[i].hitL();
				  shoulderL = 1;
				}else if(dL < 100 & shoulderL == 1){
					birdL[nL].hitL();
				}
			  }
	  
			  fill('red');
			  ellipse(birdR[i].x, birdR[i].y, 20);
			  ellipse(pose.rightShoulder.x, pose.rightShoulder.y, 30);
			  fill('green');
			  ellipse(pose.leftShoulder.x, pose.leftShoulder.y, 30);
			  ellipse(birdL[i].x, birdL[i].y, 20);
		  }
		}
	}
	
	 
  }
  
  function Bird(x,y,i){
	this.x = x;
	this.y = y;
	this.i = i;
	
	
	this.show = function(){//小鸟在特定的点出现
	  if(i == 1){
		image(blueBird, this.x, this.y, 80, 80);
	  }
	  if(i == 2){
		image(greenBird, this.x, this.y, 80, 80);
	  }
	  if(i == 3){
		image(yellowBird, this.x, this.y, 80, 80);
	  }
	  if(i == 4){
		image(pinkBird, this.x, this.y, 80, 80);
	  }
	}
	
	this.move = function(){//从上往下落下
	  this.y+=3;
	}
	
	this.hitR = function(){//小鸟与右肩相碰则落下右肩上
	  this.x = pose.rightShoulder.x-50;
	  this.y = pose.rightShoulder.y-100;
	}
	
	this.hitL = function(){//小鸟与左肩相碰则落在左肩上
	  this.x = pose.leftShoulder.x-30;
	  this.y = pose.leftShoulder.y-80;
	}
	
	this.hitRT = function(){//肩上的小鸟与右边的树相碰则落在树上
	  this.x = treeFlip.x+130;
	  this.y = treeFlip.y+50;
	}
	
	this.hitLT = function(){//肩上的小鸟与左边的树相碰则落在树上
	  this.x = tree.x+100;
	  this.y = tree.y+50;
	}
	
  }
  
  
  function TreeFlip(){
	this.x = -300;
	this.y = 130;
	this.state = 0;//0:x=-300; 1:x=-50;
	
	this.show = function(){
	  image(treeFlip1, this.x, this.y, 300, 200);
	}
	
	this.out = function(){
	  this.x+=1;
	  this.state = 1;
	}
	this.in = function(){
	  this.x-=1;
	  this.state = 0;
	}
  
	
  }
  
  
  function Tree(){
	this.x = 700;
	this.y = 130;
	this.state = 0;//0:x=700; 1:x=400;
	
	this.show = function(){
	  image(tree1, this.x, this.y, 300, 200);
	}
	
	this.out = function(){
	  this.x-=1;
	  this.state = 1;
	}
	this.in = function(){
	  this.x+=1;
	  this.state = 0;
	}
  
	
  }
  
  