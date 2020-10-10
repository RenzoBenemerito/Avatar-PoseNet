var canvas;
var stage;
var width = window.innerWidth;
var height = window.innerHeight;
var particles = [];
var max = 150;
var clear = 10;
// var mouseX = 0;
// var mouseY = 0;

var speed = 5;
var size = 20;

//The class we will use to store particles. It includes x and y
//coordinates, horizontal and vertical speed, and how long it's
//been "alive" for.
function Particle(x, y, xs, ys) {
    this.x = x;
    this.y = y;
    this.xs = xs;
    this.ys = ys;
    this.life = 0;
}

function init(canvas) {
    var positions;
    var mouseX;
    var mouseY;
    //See if the browser supports canvas
    if (canvas.getContext) {

        //Get the canvas context to draw onto
        stage = canvas.getContext("2d");

        //Makes the colors add onto each other, producing
        //that nice white in the middle of the fire
        stage.globalCompositeOperation = "lighter";
        
        //Update the mouse position
        document.addEventListener("mousemove", function(e){
            positions = getMousePos(e,canvas);
            mouseX = positions[0];
            mouseY = positions[1];
            update(stage, mouseX, mouseY);
        });
        console.log(positions);
        //Update the particles every frame
        // var timer = setInterval(update(stage,mouseX,mouseY), 40);

    } else {
        alert("Canvas not supported.");
    }
}

function getMousePos(evt,canvas) {
    var rect = canvas.getBoundingClientRect()
    var root = document.documentElement;

    // return mouse position relative to the canvas
    mouseX = evt.clientX - rect.left - root.scrollLeft;
    mouseY = evt.clientY - rect.top - root.scrollTop;
    return [mouseX,mouseY]
}
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

function bend_fire(x, y){
    for (var i = 0; i < 20; i++) {
        //Adds a particle at the point position, with random horizontal and vertical speeds
        random_num_x = getRandomArbitrary(-1, 1);
        random_num_y = getRandomArbitrary(-1, 1);
        var p = new Particle(x, y, (random_num_x * 2 * speed - speed) / 2, 0 - random_num_y * 2 * speed);
        particles.push(p);
    }
}

function bend_water(x,y){
    for (var i = 0; i < 20; i++) {
        //Adds a particle at the point position, with random horizontal and vertical speeds
        random_num_x = getRandomArbitrary(-7, 7);
        random_num_y = getRandomArbitrary(-2, 2);
        increment_x = getRandomArbitrary(-5, 5);
        increment_y = getRandomArbitrary(-4, 4);
        var p = new Particle(x + increment_x, y + increment_y, (random_num_x * 2 * speed - speed) / 2, 0 - random_num_y * 2 * speed);
        particles.push(p);
    }
}

function bend_earth(x,y){
    var p = new Particle(x, y, 0, 0);
    particles.push(p);
}

function generate_water(x,y, pos){
    for (var i = 0; i < 40; i++) {
        increment_x = getRandomArbitrary(-1, 1);
        increment_y = getRandomArbitrary(-1, 1);
        if (pos == "mid") {
            random_num_x = getRandomArbitrary(-2, 2);
            random_num_y = getRandomArbitrary(-20, 0);
        }
        else if (pos == "left") {
            random_num_x = getRandomArbitrary(-5, 0);
            random_num_y = getRandomArbitrary(-20, 0);
        }
        else if (pos == "right") {
            random_num_x = getRandomArbitrary(0, 5);
            random_num_y = getRandomArbitrary(-20, 0);
        }
        //Adds a particle at the point position, with random horizontal and vertical speeds
        var p = new Particle(x+increment_x, y+increment_y, (random_num_x * 2 * speed - speed) / 2, random_num_y * 2 * speed);
        particles.push(p);
    }
}

function generate_air(orient_x) {
    //Adds ten new particles every frame
    random_num_x = 0
    random_num_y = 0
    increment_x = 0
    increment_y = 0
    
    for (var i = 0; i < 700; i++) {
        if (orient_x) {
            random_num_x = getRandomArbitrary(-40, 0);
            increment_x = getRandomArbitrary(-5, 0);
            x = width;
            y = height / 2;
        }
        else {
            random_num_x = getRandomArbitrary(0, 40);
            increment_x = getRandomArbitrary(0, 5);
            x = 0;
            y = height / 2;
        }
        
        random_num_y = 0;
        increment_y = getRandomArbitrary(-height / 3, height / 4);
    
        //Adds a particle at the point position, with random horizontal and vertical speeds
        var p = new Particle(x+increment_x, y+increment_y, (random_num_x * 2 * speed - speed) / 2, random_num_y * 2 * speed);
        particles.push(p);
    }
}

function generate_earth(midpoint_x, side){
    for (var i = 0; i < particles.length; i++) {
        if (side == "right" && particles[i].x > midpoint_x) {
            particles[i].xs = 55;
            particles[i].ys = -55;
        }
        else if (side == "left" && particles[i].x < midpoint_x) {
            particles[i].xs = -55;
            particles[i].ys = -55;
        }
    }
}

function generate_fire(x, y, orient_x, orient_y) {
    //Adds ten new particles every frame
    random_num_x = 0
    random_num_y = 0
    increment_x = 0
    increment_y = 0

    for (var i = 0; i < 150; i++) {
        if (orient_x) {
            random_num_x = getRandomArbitrary(0, 15);
            increment_x = getRandomArbitrary(-1, 5);
        }
        else {
            random_num_x = getRandomArbitrary(-15, 0);
            increment_x = getRandomArbitrary(-5, 1);
        }
        if (orient_y){
            random_num_y = getRandomArbitrary(-2, 1);
            increment_y = getRandomArbitrary(-3, 3);
        }
        else {
            random_num_y = getRandomArbitrary(-1, 2);
            increment_y = getRandomArbitrary(-3, 3);
        }
     
        //Adds a particle at the point position, with random horizontal and vertical speeds
        var p = new Particle(x + increment_x, y + increment_y, (random_num_x * 2 * speed - speed) / 2, (random_num_y * 2 * speed) / 2);
        particles.push(p);
    }
}

// function generate_fire(x, y, orient_x, orient_y) {
//     //Adds ten new particles every frame
//     random_num_x = 0
//     random_num_y = 0
//     increment_x = 0
//     increment_y = 0
//     if (orient_x) {
//         random_num_x = getRandomArbitrary(0, 25);
//         // increment_x = getRandomArbitrary(-1, 5);
//     }
//     else {
//         random_num_x = getRandomArbitrary(-25, 0);
//         // increment_x = getRandomArbitrary(-5, 1);
//     }
//     if (orient_y) {
//         random_num_y = getRandomArbitrary(-4, 2);
//         // increment_y = getRandomArbitrary(-3, 3);
//     }
//     else {
//         random_num_y = getRandomArbitrary(-2, 4);
//         // increment_y = getRandomArbitrary(-3, 3);
//     }
//     for (var i = 0; i < 170; i++) {
//         if (orient_x) {
//             // random_num_x = getRandomArbitrary(0, 25);
//             increment_x = getRandomArbitrary(-1, 5);
//         }
//         else {
//             // random_num_x = getRandomArbitrary(-25, 0);
//             increment_x = getRandomArbitrary(-5, 1);
//         }
//         if (orient_y) {
//             // random_num_y = getRandomArbitrary(-4, 2);
//             increment_y = getRandomArbitrary(-5, 3);
//         }
//         else {
//             // random_num_y = getRandomArbitrary(-2, 4);
//             increment_y = getRandomArbitrary(-3, 5);
//         }
//         //Adds a particle at the point position, with random horizontal and vertical speeds
//         var p = new Particle(x + increment_x, y + increment_y, random_num_x*i / speed, random_num_y*i / speed);
//         particles.push(p);
//     }
// }

function update_element(stage, element){
    //Cycle through all the particles to draw them
    for (var i = 0; i < particles.length; i++) {

        //Set the file colour to an RGBA value where it starts off red-orange, but progressively
        //gets more grey and transparent the longer the particle has been alive for
        if (element == "Fire") {
            stage.fillStyle = "rgba(" + (260 - (particles[i].life * 2)) + "," + ((particles[i].life * 2) + 40) + "," + (particles[i].life * 2) + "," + (((max - particles[i].life * 4) / max) * 0.5) + ")";
        }
        else if (element == "Water") {
            stage.fillStyle = "rgba(0," + ((particles[i].life * 2) + 40) + "," + (particles[i].life * 2 + 120) + "," + (((max - particles[i].life * 4) / max) * 0.4) + ")";
        }
        else if (element == "Earth"){
            stage.fillStyle = "rgba(62," + ((particles[i].life * 2) + 28) + "," + (particles[i].life + 25) + ",1)";
        }
        else if (element == "Air") {
            stage.fillStyle = "rgba(" + (200 - (particles[i].life * 2)) + "," + ((particles[i].life * 2) + 175) + "," + (particles[i].life * 2+175) + "," + (((max - particles[i].life * 4) / max) * 0.4) + ")";
        }
        // console.log(stage.fillStyle);
        stage.beginPath();
        //Draw the particle as a circle, which gets slightly smaller the longer it's been alive for
        if (element == "Earth") {
            stage.arc(particles[i].x, particles[i].y, (max * 1.5 - particles[i].life) / max * (75 / 2) + (75 / 2), 0, 2 * Math.PI);
        }
        else if (element == "Fire") {
            stage.arc(particles[i].x, particles[i].y, (max * 1.5 - particles[i].life*12) / max * (size / 2) + (size / 2), 0, 2 * Math.PI);
        }
        else {
            stage.arc(particles[i].x, particles[i].y, (max * 1.5 - particles[i].life) / max * (size / 2) + (size / 2), 0, 2 * Math.PI);
        }
        stage.fill();

        //Move the particle based on its horizontal and vertical speeds
        particles[i].x += particles[i].xs;
        particles[i].y += particles[i].ys;
        if (element != "Earth") {
            particles[i].life++;
        }
        //If the particle has lived longer than we are allowing, remove it from the array.
        if (particles[i].life >= clear) {
            particles.splice(i, 1);
            i--;
        }
    }
}
