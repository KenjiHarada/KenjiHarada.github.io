// (c) 2013 Kenji Harada.
var ratio = 0.9;
var width = 400;
function px(x, xmin, xmax, w) {
    return (x-xmin)/(xmax-xmin) * w*ratio + w*(1-ratio);
}

function py(y, ymin, ymax, w) {
    return (ymax-y)/(ymax-ymin) * w * ratio+w*(1-ratio)*0.5;
}

function draw_back(ctx){
    ctx.strokeStyle = "black";
    ctx.rect(px(0,0,1,width), py(4,0,4,width), width*ratio, width*ratio);
    ctx.stroke();

    ctx.strokeStyle = "blue";
    ctx.beginPath();
    ctx.moveTo(px(0, 0, 1, width), py(4, 0, 4, width));
    for(var x = 0; x <= 1.01; x+=0.01){
        var y = 4/(1+x*x);
        ctx.lineTo(px(x, 0, 1, width), py(y, 0, 4, width));
    }
    ctx.stroke();
    ctx.fillStyle = "black";
    ctx.fillText(0, px(0, 0, 1, width)-24, py(0, 0, 1, width)+24);
    ctx.fillText(1, px(1, 0, 1, width), py(0, 0, 1, width)+24);
    ctx.fillText(4, px(0, 0, 1, width)-24, py(4, 0, 4, width));
    ctx.fillStyle = "blue";
    ctx.fillText("f(x)=4/(1+x²)", px(0.65, 0, 1, width), py(2.95, 0, 4, width));
    ctx.fillStyle = "black";
}

function draw_pi() {
    id = "mc_pi";
    var canvas = document.getElementById(id);
    if (canvas == null)
        return false;
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.font = "20px 'Helvetica'";
    draw_back(ctx);

    var t = 0;
    var timer;
    var delay = 100;
    var num = 10;
    var ave = 0;
    canvas.onmousedown = function(e){
        ave = 0;
        num *= 2;
        delay /= 2;
        if(num == 640){
            num = 10;
            delay = 100;
        }
        ctx.clearRect(0,0,canvas.width,canvas.height);
        draw_back(ctx);
        t = 1;
        timer = setTimeout(loop, delay);
    }
    var loop = function(){
        var x = Math.random();
        var y = 4/(1+x*x);
        ave += y;
        t++;
        var xave = ave/t;
        ctx.strokeStyle = "red";
        ctx.strokeRect(px(x, 0, 1, width), py(y, 0, 4, width), width*ratio/num, y/4*width*ratio);
        ctx.clearRect(px(0.6, 0, 1, width), py(0.9, 0, 1, width)-20, 20*7, 60);
        ctx.fillText("サンプル数 " + t, px(0.6, 0, 1, width), py(0.9, 0, 1, width));
        ctx.fillText("平均 " + xave.toFixed(5), px(0.6, 0, 1, width), py(0.9, 0, 1, width)+30);
        if(t < num){
            timer = setTimeout(loop, delay);
        }else{
            clearTimeout(timer);
        }
    }
    loop();
}
