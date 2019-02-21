class Node {
    constructor(x, y, r, name) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.name = name;
    }

}

class Automata {
    constructor() {
        this.canvas = document.getElementById('screen');
        this.ctx = this.canvas.getContext('2d');
        this.nodes = new Array();

        this.mode = "st_create";
        this.selected_index = -1;
    }

    find_node(x, y){
        let iterator = this.nodes.entries();
        for(let nodeinfo of iterator){
            let node = nodeinfo[1];
            if(Math.sqrt(Math.pow(node.x-x,2) + Math.pow(node.y-y,2)) < node.r){
                return nodeinfo[0];
            }
        }
        return -1;
    }

    mouse_setup() {
        let canvas = this.canvas;
        let ctx = this.ctx;
        let canvasPosition = {x: canvas.offsetLeft, y: canvas.offsetTop};

        canvas.onclick = e => {
            let mouse = {
                x: e.pageX - canvasPosition.x,
                y: e.pageY - canvasPosition.y
            };

            //Creates a new node
            if(this.mode == 'st_create'){
                this.nodes.push(new Node(mouse.x, mouse.y, 50, "test"));
            }
            //Find node index and delete if a node was found
            else if(this.mode == 'st_delete'){
                let index = this.find_node(mouse.x, mouse.y);
                if(index != -1)
                    this.nodes.splice(index,1);
            }
            else if(this.mode == 'st_move'){
                let index = this.find_node(mouse.x, mouse.y);
                this.selected_index = index;
            }
        }

        canvas.mousemove = e => {
            let mouse = {
                x: e.pageX - canvasPosition.x,
                y: e.pageY - canvasPosition.y
            };

            if(this.mode == 'st_move'){
                    console.log(this.selected_index);
                if(this.selected_index != -1){
                    this.nodes[selected_index].x = mouse.x;
                    this.nodes[selected_index].y = mouse.y;
                }
            }

        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for(let node of this.nodes){
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
            this.ctx.stroke();
        }
    }
}
$(document).ready(function(){
    let a = new Automata();
    a.mouse_setup();
    setInterval(a.render.bind(a), 16);

    $("#st_create").click(function(){
        a.mode = 'st_create';
    });
    $("#st_move").click(function(){
        a.mode = 'st_move';
    });
    $("#st_delete").click(function(){
        a.mode = 'st_delete';
    });
});
