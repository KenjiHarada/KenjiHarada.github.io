// (c) 2014 Kenji Harada.
var width = 936;

function draw() {
    draw_ising();
}

function draw_as(ctx, as, LX, LY){
    var area = width;
    var pw = area/LX;
    var base = 0;
    var np = 0;
    for(var i = 0; i < LX*LY; ++i)
        np+=as[i];
    if(np > LX*LY/2){
        ctx.fillStyle="#fff";
        ctx.fillRect(base, base, area, area);
        ctx.fillStyle="#ccc";
        for(var i = 0; i < LX*LY; ++i){
            if(as[i] == 0){
                var x = i % LX;
                var y = Math.floor(i / LX);
                ctx.fillRect(base+x*pw, base+y*pw, pw, pw);
            }
        }
        ctx.stroke();
    }else{
        ctx.fillStyle="#ccc";
        ctx.fillRect(base, base, area, area);
        ctx.fillStyle="#fff";
        for(var i = 0; i < LX*LY; ++i){
            if(as[i] == 1){
                var x = i % LX;
                var y = Math.floor(i / LX);
                ctx.fillRect(base+x*pw, base+y*pw, pw, pw);
            }
        }
        ctx.stroke();
    }
}

function draw_ising(){
    var id = "ising";
    var canvas = document.getElementById(id);
    if (canvas == null)
        return false;
    var ctx = canvas.getContext('2d');
    var LX=104;
    var LY=50;

    var as = new Array(LX*LY);
    for(var i=0; i < LX*LY;++i){
        as[i]=Math.floor(Math.random()*2);
    }

    var mouse = { x:null, y:null };
    var t = 0;
    var timer;
    var delay = 256;
    var num = 1024;
    var ave = 0;
    var z = Math.sqrt(2);
    var zmax = 3;
    canvas.onmousedown = function(e){
        var rect = e.target.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        if(mouse.x >=0 && mouse.x <= width){
            z = mouse.x/width*zmax;
        }
        ave = 0;
        t = 0;
        timer = setTimeout(loop, delay);
    }
    var loop = function(){
        t++;
        var e = 0;
        for(var nt=0; nt < LX*LY;++nt){
            var i = Math.floor(Math.random()*LY*LX);
            var x = i % LX;
            var y = Math.floor((i - x)/LX);
            var ne = 0;
            if(as[i] == as[(x+1)%LX+y*LX]) ne++;
            if(as[i] == as[(x-1+LX)%LX+y*LX]) ne++;
            if(as[i] == as[x+((y+1)%LY)*LX]) ne++;
            if(as[i] == as[x+((y-1+LY)%LY)*LX]) ne++;
            e += ne;
            if(Math.random() <= Math.pow(z+1e0, 4-2*ne))
                as[i] = 1 - as[i];
        }
        ave += e/2/2/LX/LY;
        draw_as(ctx, as, LX, LY);
        if(t < num){
            timer = setTimeout(loop, delay);
        }else{
            clearTimeout(timer);
        }
    }
    loop();
}
