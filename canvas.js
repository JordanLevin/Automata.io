class automata {
    constructor() {
        this.canvas = document.getElementById('screen');
        console.log(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        console.log(this.ctx);
        this.mouse_setup();
    }

    mouse_setup() {
        var canvas = this.canvas;
        var ctx = this.canvas.getContext('2d');
        var canvasPosition = {x: canvas.offsetLeft, y: canvas.offsetTop};

        canvas.onclick = function(e) {
            console.log("hewwo");
            var mouse = {
                x: e.pageX - canvasPosition.x,
                y: e.pageY - canvasPosition.y
            }
            // now you have local coordinates,
            // which consider a (0,0) origin at the
            // top-left of canvas element
            ctx.fillRect(mouse.x, mouse.y, 150, 75);
        }
    }

    render() {
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(0, 0, 150, 75);
    }
}
$(document).ready(function(){
    let a = new automata();
});
