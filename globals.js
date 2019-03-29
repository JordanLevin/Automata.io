let state = {textbox: null, tr: null};
let a;

//Variables for panning and zooming
let g_translate = {x: 0, y: 0, x1: 0, y1: 0};
let g_drag = false;
let g_scale = 1;

//Variables needed while stepping through DFA
let g_currstring = null; 
let g_runningstring = null;
let g_currnode = null;
let g_prevnode = null;
let g_accepted = null;
let g_rejected = null;


//======================= Constants ========================
const MIDPT_SIZE = 10;
const WIDTH = 1280;
const HEIGHT = 720;


//UTILITIES
function canvas_to_viewX(mousecoord){
    let orig = mousecoord;
    mousecoord -= WIDTH/2;
    mousecoord /= g_scale;
    mousecoord += WIDTH/2;
    mousecoord -= g_translate.x;
    return mousecoord;
}

function canvas_to_viewY(mousecoord){
    let orig = mousecoord;
    mousecoord -= HEIGHT/2;
    mousecoord /= g_scale;
    mousecoord += HEIGHT/2;
    mousecoord -= g_translate.y;
    return mousecoord;
}

function view_to_canvasX(mousecoord){
    let orig = mousecoord;
    mousecoord += g_translate.x;
    mousecoord -= WIDTH/2;
    mousecoord *= g_scale;
    mousecoord += WIDTH/2;
    return mousecoord;
}

function view_to_canvasY(mousecoord){
    let orig = mousecoord;
    mousecoord += g_translate.y;
    mousecoord -= HEIGHT/2;
    mousecoord *= g_scale;
    mousecoord += HEIGHT/2;
    return mousecoord;
}

function canvas_offset(){
    //These are to convert window space coords to canvas coords
    let c = document.getElementById('defaultCanvas0');
    let coords = c.getBoundingClientRect();
    return coords.top;
}
