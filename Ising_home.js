// (c) 2014 Kenji Harada.
var width = 444;

function draw() {
    draw_ising();
}

function draw_as(ctx, as, L){
    var wh = 30;
    var area = width - 2*wh;
    var pw = area/L;
    var base = wh;
    var np = 0;
    for(var i = 0; i < L*L; ++i)
        np+=as[i];
    if(np > L*L/2){
        ctx.fillStyle="#fff";
        ctx.fillRect(base, base, area, area);
        ctx.fillStyle="#ccc";
        for(var i = 0; i < L*L; ++i){
            if(as[i] == 0){
                var x = i % L;
                var y = Math.floor(i / L);
                ctx.fillRect(base+x*pw, base+y*pw, pw, pw);
            }
        }
        ctx.stroke();
    }else{
        ctx.fillStyle="#ccc";
        ctx.fillRect(base, base, area, area);
        ctx.fillStyle="#fff";
        for(var i = 0; i < L*L; ++i){
            if(as[i] == 1){
                var x = i % L;
                var y = Math.floor(i / L);
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
    var L=64;

    var as = new Array(L*L);
    for(var i=0; i < L*L;++i){
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
        for(var nt=0; nt < L*L;++nt){
            var i = Math.floor(Math.random()*L*L);
            var x = i % L;
            var y = Math.floor((i - x)/L);
            var ne = 0;
            if(as[i] == as[(x+1)%L+y*L]) ne++;
            if(as[i] == as[(x-1+L)%L+y*L]) ne++;
            if(as[i] == as[x+((y+1)%L)*L]) ne++;
            if(as[i] == as[x+((y-1+L)%L)*L]) ne++;
            e += ne;
            if(Math.random() <= Math.pow(z+1e0, 4-2*ne))
                as[i] = 1 - as[i];
        }
        ave += e/2/2/L/L;
        draw_as(ctx, as, L);
        if(t < num){
            timer = setTimeout(loop, delay);
        }else{
            clearTimeout(timer);
        }
    }
    loop();
}
