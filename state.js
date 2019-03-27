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
