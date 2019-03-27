function find_midpoint(x, y) {
    let iterator = a.nodes.entries();
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

function find_node(x, y) {
    let iterator = a.nodes.entries();
    for (let nodeinfo of iterator) {
        let node = nodeinfo[1];
        if (Math.sqrt(Math.pow(node.x - x, 2) + Math.pow(node.y - y, 2)) <
            node.r) {
            return nodeinfo[0];
        }
    }
    return -1;
}

// Run a DFA until end is reached
function run(str, srcnode) {
    console.log('RUNNING');
    if (str == '' && srcnode.end) {
        srcnode.col = 'green';
        g_accepted = true;
        return;
    } else if (srcnode.end) {
        srcnode.col = 'red';
        g_rejected = true;
        return;
    }
    for (let tr of srcnode.transitions) {
        if (tr.chars.includes(str[0])) {
            tr.dst.col = 'yellow';
            run(str.substr(1), tr.dst);
        }
    }
}

function step(str, srcnode) {
    console.log('STEP');
    if (str == '' && srcnode.end) {
        srcnode.col = 'green';
        g_accepted = true;
        return;
    } else if (srcnode.end) {
        srcnode.col = 'red';
        g_rejected = true;
        return;
    }
    for (let tr of srcnode.transitions) {
        if (tr.chars.includes(str[0])) {
            g_runningstring = str.substr(1);
            g_currnode = tr.dst;
            g_currnode.col = 'blue';
            if (g_prevnode) g_prevnode.col = 'yellow';
            g_prevnode = g_currnode;
            return;
        }
    }
    srcnode.col = 'red';
    g_rejected = true;
}

function save_automata(automata) {
    let json_rep = JSON.stringify(a, function(key, value) {
        if (key == 'dst') return value.name;
        return value;
    });
    document.getElementById('saveloadstr').value = json_rep;
}

function load_automata(str) {
    function find_node_by_name(name, nodes){
        for(let n of nodes){
            if(n.name == name)
                return n;
        }
        console.log("Error: Invalid automata string");
    }
    let temp = JSON.parse(str);
    nodes = [];
    //Recreate the entire automata because the serialization
    //process loses all of the functions
    for(let node of temp.nodes){
        let tnode = new Node(node.x, node.y, node.r, node.name);
        tnode.init = node.init;
        tnode.end = node.end;
        tnode.transitions = [];
        tnode.sources = [];
        for(let t of node.transitions){
            let newtran = new Transition(t.x1, t.y1, t.x2, t.y2, t.dst, t.chars);
            let mid = new Midpoint(t.mid.x, t.mid.y);
            newtran.mid = mid;
            tnode.transitions.push(newtran);
        }
        nodes.push(tnode);
    }

    //Fix up the references because they were changed to names when serialized
    for(let node of nodes){
        for(let t of node.transitions){
            t.dst = find_node_by_name(t.dst, nodes);
            t.dst.sources.push(t);
        }
    }
    
    a.nodes = nodes;
    console.log(a);
}



function canvasClick(event) {
    // if (event.buttons == 1)
    left_clicked(mouseX, mouseY);
    // else if(event.buttons == 2)
    // a.right_clicked(mouseX, mouseY);
    // return false;
}

function mouseMoved() {
    mouse_moved(mouseX, mouseY);
    // prevent default
    return false;
}

function setup() {
    let canv = createCanvas(1280, 720);
    canv.mousePressed(canvasClick);
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
        automata_play();
    });
    $('#step').click(function() {
        a.mode = 'step';
        automata_step();
    });
    $('#save').click(function() {
        save_automata(a);
    });
    $('#load').click(function() {
        load_automata(document.getElementById('saveloadstr').value);
    });
    document.getElementById('defaultCanvas0')
        .addEventListener('contextmenu', event => event.preventDefault());
}

function draw() {
    a.render();
}
