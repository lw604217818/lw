//首页的canvas星空图
var canvas=document.getElementById('canvas');
var ctx=canvas.getContext('2d');

var count=70;
var distance = 200;	 	
var id=0;

var dotArray=[];
var timer=null;

ctx.lineWidth=0.1;

class Dot{
	constructor(){
		this.x=0;
		this.y=0;
		this.id=id++;
		this.speedX=rndSyb()*rnd(2,5)*0.1;
		this.speedY=rndSyb()*rnd(2,5)*0.1;
		this.ids={};

		this.move();
	}
	draw(){
		ctx.save();
		ctx.beginPath();
		ctx.fillStyle='white';
		ctx.arc(this.x,this.y,rnd(2,20)*0.1,0,Math.PI*2,false);
		ctx.fill();
		ctx.restore();
	}
	move(){
		setInterval(() => {
			this.x +=this.speedX;
			this.y +=this.speedY;

			if(this.x <0 || this.x>canvas.width){
				this.speedX *= -1;
			}

			if(this.y <0 || this.x>canvas.height){
				this.speedY *= -1;
			}
		},16);
	}
}

for (var i = 0; i < count; i++) {
	var dot=new Dot();
	dot.x=rnd(0,canvas.width);
	dot.y=rnd(0,canvas.height);

	dotArray.push(dot);

}
function moveStar(){
	ctx.clearRect(0,0,canvas.width,canvas.height)
	dotArray.forEach(function(dot,dotIndex){
		dot.draw();
		dotArray.forEach(function(compareDot,index){
			if(!(index==dotIndex) && !compareDot.ids[dot.id]){
				var dis=getDis(dot,compareDot);

				if(dis < distance){
					ctx.beginPath();
					ctx.strokeStyle=`rgba(227,234,220,${1-dis/distance})`;

					ctx.moveTo(dot.x,dot.y);
					ctx.lineTo(compareDot.x,compareDot.y);
					ctx.stroke();

					dot.ids[compareDot.id]=true;
				}else{
					dot.ids[compareDot.id]=false;
				}
			}
		});
	});
}
timer=setInterval(moveStar,16);

//nav
var oNav=document.getElementById('nav');
var aNavBtn=oNav.children;
var oHtmlWork=document.getElementById('html_work');
var oJsWork=document.getElementById('js_work');
var oHtml5Work=document.getElementById('html5_work');
var current=0;
for (var i = 0; i < aNavBtn.length; i++) {
	aNavBtn[i].index=i;
	aNavBtn[i].onclick=function(){
		tab(this.index);
	}
}
function tab(index){
	for (var i = 0; i < aNavBtn.length; i++) {
		aNavBtn[i].className='';
	}
	aNavBtn[index].className='index_active';
}
function wheel(){
	var scrollTop=document.body.scrollTop || document.documentElement.scrollTop;
	
	if(scrollTop>oHtml5Work.offsetTop-300){
		current=3;
		tab(current);
	}else if(scrollTop>oJsWork.offsetTop-300){
		current=2;
		tab(current);
	}else if(scrollTop>oHtmlWork.offsetTop-300){
		current=1;
		tab(current);
	}else{
		current=0;
		tab(current);
	}
}
function addEvent(obj,sEv,fn){//obj为要添加事件的对象，sEv为事件，fn为要绑定的函数
	if(obj.addEventListener){
		obj.addEventListener(sEv,fn,false);
	}else{
		obj.attachEvent('on'+sEv,fn);	
	}
}
if(navigator.userAgent.toLowerCase().indexOf('firefox')!=-1){
	addEvent(document,'DOMMouseScroll',wheel);
}else{
	addEvent(document,'mousewheel',wheel);
}

//button
var aSection=document.querySelectorAll('section');
var aButton=document.querySelectorAll('section button');
for(var i=0;i<3;i++){
	aButton[i].onmouseenter=function(){

	};
	aButton[i].onmouseout=function(){
		
	};
}