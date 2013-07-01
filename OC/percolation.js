// (c) 2013 Kenji Harada.
var width = 400;
var box = 18;

function p_draw_rec(ctx, L, i, j, x, c){
    var dx = width/(2*L+3);
    var dy = dx;
    ctx.fillStyle = c;
    ctx.fillRect(dx*(i+1), dy*(j+1)+box, dx, dy);
    ctx.strokeStyle = "black";
    ctx.rect(dx*(i+1), dy*(j+1)+box, dx, dy);
    ctx.stroke();
    ctx.fillStyle = "black";
    ctx.font = "14px 'Helvetica'";
    ctx.fillText(x, dx*(i+1.1), dy*(j+1.74)+box, dx, dy);
}

function p_find_root(al, i){
    var r = i;
    while(al[r] >= 0){
        r = al[r];
    }
    return r;
}

function p_draw_all(ctx, L, al, ar){
    for(var i=0; i < L; ++i){
        for(var j=0; j < L; ++j){
            var x = p_find_root(al, i+j*L);
            if(x != ar[i+j*L]){
                p_draw_rec(ctx, L, i, j, x, "white");
                ar[i+j*L]=x;
            }
            if(al[i+j*L] == -1)
                p_draw_rec(ctx, L, i+L+1, j, al[i+j*L], "red");
            else
                p_draw_rec(ctx, L, i+L+1, j, al[i+j*L], "yellow");
        }
    }
}

function p_draw_all_diff(ctx, L, al, ar, p){
    for(var i=0; i < L; ++i){
        for(var j=0; j < L; ++j){
            var x = p_find_root(al, i+j*L);
            if(x != ar[i+j*L]){
                p_draw_rec(ctx, L, i, j, x, "white");
                ar[i+j*L]=x;
            }
        }
    }
    var i = p % L;
    var j = Math.floor(p/L);
    p_draw_rec(ctx, L, i+L+1, j, al[i+j*L], "yellow");
}

function draw() {
    draw_percolate();
    draw_ising();
}

function draw_percolate() {
    var id = "percolate";
    var canvas = document.getElementById(id);
    if (canvas == null)
        return false;
    var ctx = canvas.getContext('2d');
    var L=6;
    ctx.fillStyle = "black";
    ctx.font = "24px 'Helvetica'";
    var dx = width/(2*L+3);
    ctx.fillText("クラスター番号", dx, box*1.5, box*8, box);
    ctx.fillText("配列L", dx*(L+2), box*1.5, box*4, box);
    var al = new Array(L*L);
    var ar = new Array(L*L);

    for(var i=0; i < L*L;++i){
        al[i]=-1;
        ar[i]=-1;
    }
    
    p_draw_all(ctx, L, al, ar);

    var mouse = { x:null, y:null };
    canvas.onmousedown = function(e){
        var rect = e.target.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        var dx = width/(2*L+3);
        var dy = dx;
        var i = Math.floor(mouse.x/dx)-1;
        var j = Math.floor((mouse.y-box)/dy)-1;
        if(i >= L+1 && i < 2*L+1 && j >= 0 && j < L){
            for(var i=0; i < L*L;++i){
                al[i]=-1;
            }
            p_draw_all(ctx, L, al, ar);
            return;
        }
        var di = mouse.x/dx-1-i;
        var dj = (mouse.y-box)/dy-1-j;
        var ip, jp;
        if(di <= dj){
            if(di <= (1-dj)){
                ip = i - 1;
                jp = j;
            }else{
                ip = i;
                jp = j + 1;
            }
        }else{
            if((1-di) <= dj){
                ip = i + 1;
                jp = j;
            }else{
                ip = i;
                jp = j - 1;
            }
        }
        if(i >= 0 && i < L && j >= 0 && j < L && ip >= 0 && ip < L && jp >= 0 && jp < L){
            var r1 = p_find_root(al, i+j*L);
            var r2 = p_find_root(al, ip+jp*L);
            if(r1 != r2){
                if(r1 > r2){
                    al[r1]=r2;
                    p_draw_all(ctx, L, al, ar, r1);
                }else{
                    al[r2]=r1;
                    p_draw_all(ctx, L, al, ar, r2);
                }
            }
        }
    }
}

function draw_as(ctx, as, L){
    var wh = 10;
    var area = width - 8*wh;
    var pw = area/L;
    var base = 4*wh;
    var np = 0;
    for(var i = 0; i < L*L; ++i)
        np+=as[i];
    if(np > L*L/2){
        ctx.fillStyle="yellow";
        ctx.fillRect(base, 0, area, area);
        ctx.fillStyle="blue";
        for(var i = 0; i < L*L; ++i){
            if(as[i] == 0){
                var x = i % L;
                var y = Math.floor(i / L);
                ctx.fillRect(base+x*pw, y*pw, pw, pw);
            }
        }
        ctx.stroke();
    }else{
        ctx.fillStyle="blue";
        ctx.fillRect(base, 0, area, area);
        ctx.fillStyle="yellow";
        for(var i = 0; i < L*L; ++i){
            if(as[i] == 1){
                var x = i % L;
                var y = Math.floor(i / L);
                ctx.fillRect(base+x*pw, y*pw, pw, pw);
            }
        }
        ctx.stroke();
    }
}

function round(num, n) {
  var tmp = Math.pow(10, n);
  return Math.round(num * tmp) / tmp;
}

function draw_average(ctx, z, e){
    var wh = 10;
    var base = 4*wh;
    ctx.fillStyle="black";
    ctx.font = "14px 'Helvetica'";
    ctx.clearRect(base, width-8*wh, width-base, 4*wh);
    ctx.fillText("z="+round(z,5) + ", E ~ " + round(e, 8), base, width-6*wh, width-base, 2*wh);
    ctx.stroke();
}

function draw_meter(ctx, x, xmax){
    var wh = 10;
    ctx.clearRect(0, width - 2*wh, width, wh);
    ctx.rect(0, width - 2*wh, width, wh);
    ctx.fillStyle="red";
    ctx.fillRect(0, width - 2*wh, width*x/xmax, wh);
    ctx.stroke();
    ctx.fillStyle="black";
    ctx.font = "14px 'Helvetica'";
    for(var i = 0; i < xmax; ++i){
        if(i==0)
            ctx.fillText(i, width/xmax*i, width-3*wh, wh, wh);
        else
            ctx.fillText(i, width/xmax*i-0.4*wh, width-3*wh, wh, wh);
        ctx.beginPath();
        ctx.moveTo(width/xmax*i, width-2*wh);
        ctx.lineTo(width/xmax*i, width- wh);
        ctx.stroke();
    }
    ctx.fillText(xmax, width/xmax*i-0.9*wh, width-3*wh, wh, wh);
    ctx.stroke();
}

function draw_ising(){
    var id = "ising";
    var canvas = document.getElementById(id);
    if (canvas == null)
        return false;
    var ctx = canvas.getContext('2d');
    var L=32;

    var as = new Array(L*L);
    for(var i=0; i < L*L;++i){
        as[i]=Math.floor(Math.random()*2);
    }

    var mouse = { x:null, y:null };
    var t = 0;
    var timer;
    var delay = 1;
    var num = 100;
    var ave = 0;
    var z = Math.sqrt(2);
    var zmax = 3;
    draw_meter(ctx, z, zmax);
    canvas.onmousedown = function(e){
        var rect = e.target.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        if(mouse.x >=0 && mouse.x <= width){
            z = mouse.x/width*zmax;
            draw_meter(ctx, z, zmax);
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
        draw_average(ctx, z, ave/t);
        draw_as(ctx, as, L);
        if(t < num){
            timer = setTimeout(loop, delay);
        }else{
            clearTimeout(timer);
        }
    }
    loop();
}
