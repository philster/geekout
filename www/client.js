(function() {

var dots = {};
var socket = io.connect();

socket.on("connect", function() {
    document.body.onmousemove = function(e) {
        socket.emit("cursor", {
           x: e.pageX,
           y: e.pageY
        });
    };
    
    document.body.onclick = function() {
        socket.emit("click", "");
    };
});

socket.on("remove", function(id) {
    var el = dots[id];
    if (!el)
        return;
        
    document.body.removeChild(el);
    delete dots[id];
});

socket.on("click", function(id) {
    var el = dots[id];
    if (!el)
        return;
        
    el.className = "ball click";
    setTimeout(function() {
        el.className = "ball";
    }, 150);
});

socket.on("cursor", function(data) {
    var id = data.id;
    var el = dots[id];
    if (!el) {
        el = document.createElement("div");
        el.className = "ball";
        el.style.background = "hsl(" + (id*5 % 360) + ", 70%, 70%)";
        document.body.appendChild(el);
        dots[data.id] = el;
    }
    
    // find colliding dots
    var radius = 10;
    var ax = data.x;
    var ay = data.y;
    for (var dot_id in dots) {
        var dot = dots[dot_id];
        var bx = dot.offsetLeft + radius;
        var by = dot.offsetTop + radius;
        // compute distance
        var dist = Math.sqrt( Math.pow(bx - ax, 2) + Math.pow(by - ay, 2) );
        console.log("dist %o", dist);
        if (dist < 2 * radius) {  // collision!!
            console.log("BOOOM!! %o %o", id, dot_id);
            socket.emit("disconnect", dot_id);  // kill other player
            socket.emit("disconnect", "");  // kill self
            return;
        }
    }
        
    el.style.left = data.x + "px";
    el.style.top = data.y + "px";
});

})();