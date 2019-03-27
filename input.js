function st_create(x, y) {
    a.nodes.push(new Node(x, y, 40, 's' + a.state));
    a.state++;
}
function st_delete(x, y) {
    let index = find_node(x, y);
    if (index != -1) a.nodes.splice(index, 1);
}
function st_move(x, y) {
    let index = find_node(x, y);
    a.move_node = !a.move_node;
    a.selected = index;
}
function tr_create(x, y) {
    if (a.curr_t) {
        let dest_node = a.nodes[find_node(a.curr_t.x2, a.curr_t.y2)];
        a.curr_t.x2 = dest_node.x;
        a.curr_t.y2 = dest_node.y;
        let tr = new Transition(
            a.curr_t.x1,
            a.curr_t.y1,
            a.curr_t.x2,
            a.curr_t.y2,
            dest_node,
            [],
        );
        // Add the new transition to the transitions for the
        // source node and the sources for the dest node
        a.nodes[a.selected].transitions.push(tr);
        dest_node.sources.push(tr);

        a.curr_t = null;
        a.selected = -1;
    } else {
        let index = find_node(x, y);
        a.selected = index;
        a.curr_t = new Transition(a.nodes[index].x, a.nodes[index].y, x, y);
    }
}
function edit(x, y) {
    let tr = find_midpoint(x, y);
    state.tr = tr;
    if (tr == -1) return false;
    state.textbox = createElement('input');
    state.textbox.id('textbox');
    state.textbox.attribute('type', 'text');
    state.textbox.attribute('z-index', 1);
    state.textbox.position(tr.mid.x, tr.mid.y);
    //For some reasson the internet says this hack makes focus work
    window.setTimeout(function ()
    { document.getElementById('textbox').focus(); }, 0);
}
function st_init(x, y) {
    let index = find_node(x, y);
    a.nodes[index].init = !a.nodes[index].init;
}
function st_final(x, y) {
    let index = find_node(x, y);
    a.nodes[index].end = !a.nodes[index].end;
}

function automata_play(){
    g_accepted = null;
    g_rejected = null;
    g_currstring = document.getElementById('inputstr').value;
    //Pick up where step left off
    if(g_runningstring) g_currstring = g_runningstring;
    for (let node of a.nodes) {
        console.log(node);
        if (node.init) {
            node.col = 'blue';
            run(g_currstring, node);
        }
        return;
    }
}
function automata_step(){
    g_currstring = document.getElementById('inputstr').value;
    if(g_runningstring == null) g_runningstring = g_currstring;
    if(g_currnode == null){
        for (let node of a.nodes) {
            if (node.init) {
                g_currnode = node;
                g_prevnode = g_currnode;
                g_currnode.col = 'blue';
            }
            return;
        }
    }
    step(g_runningstring, g_currnode);
}



function left_clicked(x, y) {
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

    console.log(a.mode);
    if (a.mode == 'st_create')
        st_create(x, y);
    else if (a.mode == 'st_delete')
        st_delete(x, y);
    else if (a.mode == 'st_move')
        st_move(x, y);
    else if (a.mode == 'tr_create')
        tr_create(x, y);
    else if (a.mode == 'edit')
        edit(x, y);
    else if (a.mode == 'init')
        st_init(x, y);
    else if (a.mode == 'final')
        st_final(x, y);
}

function mouse_moved(x, y) {
    if (a.mode == 'st_move') {
        if (a.selected != -1 && a.move_node) {
            let curr_node = a.nodes[a.selected];
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
    } else if (a.mode == 'tr_create') {
        if (a.curr_t) {
            a.curr_t.x2 = x;
            a.curr_t.y2 = y;
        }
    }
}
