class Midpoint {
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
    render(ctx){
        //fill(0,0,0);
        //circle(this.x,this.y,10);
    }
}
class Transition {
    constructor(x1, y1, x2, y2, dst, chars) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.dst = dst;
        this.chars = chars;
        this.mid = new Midpoint((x1+x2)/2, (y1+y2)/2);
    }
    render(ctx) {
        this.mid.render();

        ctx.beginPath();
        ctx.moveTo(this.x1, this.y1);
        ctx.lineTo(this.x2, this.y2);
        ctx.closePath();
        ctx.stroke();

        //CALCULATE ARROW DATA
        let adj = 1/Math.sin(Math.PI/6);
        let theta = Math.atan((this.y2-this.y1)/(this.x2-this.x1));
        let phi = Math.PI/2 - theta;

        let x1 = 10*adj*Math.cos(theta);
        let y1 = 10*adj*Math.sin(theta);

        let x2 = 20*Math.cos(phi);
        let y2 = 20*Math.sin(phi);

        let pt1, pt2;
        if(this.x1 < this.x2){
            pt1 = {x: Math.abs(this.x2-x1)+x2, y: Math.abs(this.y2-y1)-y2};
            pt2 = {x: Math.abs(this.x2-x1)-x2, y: Math.abs(this.y2-y1)+y2};
        }
        else{
            pt1 = {x: Math.abs(this.x2+x1)+x2, y: Math.abs(this.y2+y1)-y2};
            pt2 = {x: Math.abs(this.x2+x1)-x2, y: Math.abs(this.y2+y1)+y2};
        }

        //DRAW THE ARROW
        ctx.beginPath();
        ctx.moveTo(this.x2, this.y2);
        ctx.lineTo(pt1.x, pt1.y);
        ctx.closePath();
        ctx.stroke();
        ctx.moveTo(this.x2, this.y2);
        ctx.lineTo(pt2.x, pt2.y);
        ctx.closePath();
        ctx.stroke();

    }
}

class Node {
    constructor(x, y, r, name) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.name = name;

        this.transitions = new Array();
    }

    render(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        ctx.fillText(this.name, this.x, this.y);
    }
}

class Automata {
    constructor() {
        this.canvas = document.getElementById('screen');
        this.ctx = this.canvas.getContext('2d');
        this.nodes = new Array();

        this.mode = 'default';
        this.move_node = false;
        this.selected = -1;

        this.state = 0;

        this.curr_t = null;
    }

    find_node(x, y) {
        let iterator = this.nodes.entries();
        for (let nodeinfo of iterator) {
            let node = nodeinfo[1];
            if (Math.sqrt(Math.pow(node.x - x, 2) + Math.pow(node.y - y, 2)) <
                node.r) {
                return nodeinfo[0];
            }
        }
        return -1;
    }

    mouse_setup() {
        let canvas = this.canvas;
        let ctx = this.ctx;
        let canvasPosition = {x: canvas.offsetLeft, y: canvas.offsetTop};

        canvas.onclick =
            e => {
                let mouse = {
                    x: e.pageX - canvasPosition.x,
                    y: e.pageY - canvasPosition.y
                };

                // Creates a new node
                if (this.mode == 'st_create') {
                    this.nodes.push(new Node(mouse.x, mouse.y, 50, 's'+this.state));
                    this.state++;
                }
                // Find node index and delete if a node was found
                else if (this.mode == 'st_delete') {
                    let index = this.find_node(mouse.x, mouse.y);
                    if (index != -1) this.nodes.splice(index, 1);
                } else if (this.mode == 'st_move') {
                    let index = this.find_node(mouse.x, mouse.y);
                    this.move_node = !this.move_node;
                    this.selected = index;
                } else if (this.mode == 'tr_create') {
                    if (this.curr_t) {
                        let dest_node = this.nodes[this.find_node(this.curr_t.x2, this.curr_t.y2)];
                        this.curr_t.x2 = dest_node.x;
                        this.curr_t.y2 = dest_node.y;
                        this.nodes[this.selected].transitions.push(new Transition(
                            this.curr_t.x1,
                            this.curr_t.y1,
                            this.curr_t.x2,
                            this.curr_t.y2,
                            dest_node,
                            [],
                        ));
                        this.curr_t = null;
                        this.selected = -1;
                    } else {
                        let index = this.find_node(mouse.x, mouse.y);
                        this.selected = index;
                        this.curr_t = new Transition(
                            this.nodes[index].x,
                            this.nodes[index].y, mouse.x, mouse.y);
                    }
                }
            }

                 canvas.onmousemove = e => {
                let mouse = {
                    x: e.pageX - canvasPosition.x,
                    y: e.pageY - canvasPosition.y
                };

                if (this.mode == 'st_move') {
                    if (this.selected != -1 && this.move_node) {
                        this.nodes[this.selected].x = mouse.x;
                        this.nodes[this.selected].y = mouse.y;
                    }
                } else if (this.mode == 'tr_create') {
                    if (this.curr_t) {
                        this.curr_t.x2 = mouse.x;
                        this.curr_t.y2 = mouse.y;
                    }
                }
            }
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let node of this.nodes) {
            node.render(this.ctx);
            for (let transition of node.transitions)
                transition.render(this.ctx);
        }

        // draw current transition
        if (this.curr_t) this.curr_t.render(this.ctx);

        //this.ctx.drawImage(this.input._renderCanvas, this.input._x, this.input._y);
    }
}
$(document).ready(function() {
    let a = new Automata();
    a.mouse_setup();
    setInterval(a.render.bind(a), 16);

    $('#st_create').click(function() {
        a.mode = 'st_create';
    });
    $('#st_move').click(function() {
        a.mode = 'st_move';
    });
    $('#st_delete').click(function() {
        a.mode = 'st_delete';
    });

    $('#tr_create').click(function() {
        a.mode = 'tr_create';
    });
});
