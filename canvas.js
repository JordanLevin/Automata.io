let state = {textbox: null, tr: null};
let currstring = 'abb';  // TEMPORARY TEST

const MIDPT_SIZE = 10;


let a;
class Midpoint {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    render(ctx) {
        fill(0, 0, 0);
        circle(this.x, this.y, MIDPT_SIZE);
        fill(255, 255, 255);
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
        this.mid = new Midpoint((x1 + x2) / 2, (y1 + y2) / 2);
    }
    render() {
        this.mid.x = (this.x1 + this.x2) / 2;
        this.mid.y = (this.y1 + this.y2) / 2;
        this.mid.render();

        line(this.x1, this.y1, this.x2, this.y2);

        // CALCULATE ARROW DATA
        let adj = 1 / Math.sin(Math.PI / 6);
        let theta = Math.atan((this.y2 - this.y1) / (this.x2 - this.x1));
        let phi = Math.PI / 2 - theta;

        let x1 = 10 * adj * Math.cos(theta);
        let y1 = 10 * adj * Math.sin(theta);

        let x2 = 20 * Math.cos(phi);
        let y2 = 20 * Math.sin(phi);

        let pt1, pt2;
        if (this.x1 < this.x2) {
            pt1 = {
                x: Math.abs(this.x2 - x1) + x2,
                y: Math.abs(this.y2 - y1) - y2
            };
            pt2 = {
                x: Math.abs(this.x2 - x1) - x2,
                y: Math.abs(this.y2 - y1) + y2
            };
        } else {
            pt1 = {
                x: Math.abs(this.x2 + x1) + x2,
                y: Math.abs(this.y2 + y1) - y2
            };
            pt2 = {
                x: Math.abs(this.x2 + x1) - x2,
                y: Math.abs(this.y2 + y1) + y2
            };
        }

        // DRAW THE ARROW
        line(this.x2, this.y2, pt1.x, pt1.y);
        line(this.x2, this.y2, pt2.x, pt2.y);

        // DRAW TRANSITION CHARACTERS
        fill(0, 0, 0);
        textAlign(CENTER);
        textSize(16);
        text(this.chars, this.mid.x, this.mid.y - MIDPT_SIZE * 1.5);
    }
}

class Node {
    constructor(x, y, r, name) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.name = name;
        this.col = 'white';

        this.init = false;
        this.end = false;

        this.transitions = new Array();
        this.sources = new Array();
    }

    render() {
        fill(this.col);
        circle(this.x, this.y, this.r);
        textAlign(CENTER);
        textSize(16);
        text(this.name, this.x, this.y);

        noFill();
        if (this.end) {
            circle(this.x, this.y, this.r / 2);
        }
        if (this.init) {
            triangle(
                this.x - this.r, this.y, this.x - this.r - 10, this.y - 10,
                this.x - this.r - 10, this.y + 10);
        }
    }
}

class Automata {
    constructor() {
        this.nodes = new Array();

        this.mode = 'default';
        this.move_node = false;
        this.selected = -1;

        this.state = 0;

        this.curr_t = null;
    }

    find_midpoint(x, y) {
        let iterator = this.nodes.entries();
        for (let nodeinfo of iterator) {
            let node = nodeinfo[1];
            for (let transition of node.transitions) {
                if (Math.sqrt(
                        Math.pow(transition.mid.x - x, 2) +
                        Math.pow(transition.mid.y - y, 2)) < MIDPT_SIZE) {
                    return transition;
                }
            }
        }
        return -1;
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

    left_clicked(x, y) {
        if (state.textbox) {
            state.tr.chars.push(state.textbox.value());
            state.textbox.remove();
            state.textbox = null;
            state.tr = null;
            return;
        }
        // Check if point clicked in canvas
        let c = document.getElementById('defaultCanvas0');
        let crds = c.getBoundingClientRect();
        if (y < crds.top || y > crds.bottom || x < crds.left || x > crds.right)
            return;

        console.log(this.mode);
        // Creates a new node
        if (this.mode == 'st_create') {
            this.nodes.push(new Node(x, y, 40, 's' + this.state));
            this.state++;
        }
        // Find node index and delete if a node was found
        else if (this.mode == 'st_delete') {
            let index = this.find_node(x, y);
            if (index != -1) this.nodes.splice(index, 1);
        } else if (this.mode == 'st_move') {
            let index = this.find_node(x, y);
            this.move_node = !this.move_node;
            this.selected = index;
        } else if (this.mode == 'tr_create') {
            if (this.curr_t) {
                let dest_node =
                    this.nodes[this.find_node(this.curr_t.x2, this.curr_t.y2)];
                this.curr_t.x2 = dest_node.x;
                this.curr_t.y2 = dest_node.y;
                let tr = new Transition(
                    this.curr_t.x1,
                    this.curr_t.y1,
                    this.curr_t.x2,
                    this.curr_t.y2,
                    dest_node,
                    [],
                );
                // Add the new transition to the transitions for the
                // source node and the sources for the dest node
                this.nodes[this.selected].transitions.push(tr);
                dest_node.sources.push(tr);

                this.curr_t = null;
                this.selected = -1;
            } else {
                let index = this.find_node(x, y);
                this.selected = index;
                this.curr_t = new Transition(
                    this.nodes[index].x, this.nodes[index].y, x, y);
            }
        } else if (this.mode == 'edit') {
            let tr = this.find_midpoint(x, y);
            state.tr = tr;
            if (tr == -1) return false;
            state.textbox = createElement('input');
            state.textbox.id('textbox');
            state.textbox.attribute('type', 'text');
            state.textbox.attribute('z-index', 1);
            state.textbox.position(tr.mid.x, tr.mid.y);
            document.getElementById('textbox').focus();
            // this.mode = 'default';
        } else if (this.mode == 'init') {
            let index = this.find_node(x, y);
            this.nodes[index].init = !this.nodes[index].init;
        } else if (this.mode == 'final') {
            let index = this.find_node(x, y);
            this.nodes[index].end = !this.nodes[index].end;
        } else if (this.mode == 'play') {
            console.log('HELLO???');
            for (let node of this.nodes) {
                console.log(node);
                if (node.init) {
                    this.run(currstring, node);
                }
                return;
            }
        }
    }

    mouse_moved(x, y) {
        if (this.mode == 'st_move') {
            if (this.selected != -1 && this.move_node) {
                let curr_node = this.nodes[this.selected];
                curr_node.x = x;
                curr_node.y = y;
                for (let t of curr_node.transitions) {
                    t.x1 = x;
                    t.y1 = y;
                }
                for (let t of curr_node.sources) {
                    t.x2 = x;
                    t.y2 = y;
                }
            }
        } else if (this.mode == 'tr_create') {
            if (this.curr_t) {
                this.curr_t.x2 = x;
                this.curr_t.y2 = y;
            }
        }
    }

    // Run a DFA, just a temporary function for testing
    run(str, srcnode) {
        console.log('RUNNING');
        if (str == '' && srcnode.end) {
            srcnode.col = 'green';
            return;
        }
        else if(str == ''){
            srcnode.col = 'red';
            return;
        }
        for (let tr of srcnode.transitions) {
            if (tr.chars.includes(str[0])) {
                tr.dst.col = 'yellow';
                this.run(str.substr(1), tr.dst);
            }
        }
    }

    render() {
        background(255, 255, 255);
        for (let node of this.nodes) {
            node.render(this.canvas);
            for (let transition of node.transitions)
                transition.render(this.canvas);
        }

        // draw current transition
        if (this.curr_t) this.curr_t.render(this.canvas);
    }
}

function mousePressed(event) {
    if (event.buttons == 1) a.left_clicked(mouseX, mouseY);
    // else if(event.buttons == 2)
    // a.right_clicked(mouseX, mouseY);
    return false;
}

function mouseMoved() {
    a.mouse_moved(mouseX, mouseY);
    // prevent default
    return false;
}

function setup() {
    createCanvas(1280, 720);
    a = new Automata();

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
    $('#edit').click(function() {
        a.mode = 'edit';
    });
    $('#init').click(function() {
        a.mode = 'init';
    });
    $('#final').click(function() {
        a.mode = 'final';
    });
    $('#play').click(function() {
        a.mode = 'play';
    });
    document.getElementById('defaultCanvas0')
        .addEventListener('contextmenu', event => event.preventDefault());
}

function draw() {
    a.render();
}
