let state = {textbox: null, tr: null};
let a;

//Variables needed while stepping through DFA
let g_currstring = null; 
let g_runningstring = null;
let g_currnode = null;
let g_prevnode = null;
let g_accepted = null;
let g_rejected = null;


//======================= Constants ========================
const MIDPT_SIZE = 10;


