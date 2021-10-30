// by Alima Zhagufarova
// it is a "simulation" of what is happening insude the leaf. Moving green ellipses are chlorophyll that pursue energy (yellow circles) for photosynthehis. At the back you can see wandering mitochondrias, ribosomes, and golgi apparatus as well as the pattern which was supposed to symbolyze other plant cells.
//created with the help of codingTrain youtube videos

let pursuers = [];
let target1;
let target2;
let target3;
let others = [];
const size=10;
const size2 = 10;
let type = 0;
let imgR, imgG, imgM;

function preload() {
  imgR = loadImage('ribosome.png');
  imgM = loadImage('mitochondria.png');
  imgG = loadImage('golgi.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  let c1 = color('#2E8B57');
  let c2 = color('#3F704D');
  let c4 = color('#C7EA46');
  
  for (let j = 0; j<size2; j++){
      others[j] = new Other(random(0, width), random(0,height), int(random(1,4)));
  }
  
  for (let i = 0; i<size; i++){
     pursuers[i] = new Vehicle(random(100, 300), random(100, 300), c1);
  }
  target1 = new Target(width/4, height/4, c4);
  target2 = new Target(width/2, height/2, c4);
 
}

function draw() {
  let c1 = color('#2E8B57');
  let c2 = color('#3F704D');
  let c4 = color('#C7EA46');
  background('#50C878');
  noFill();
  stroke('#9DC183');
  strokeWeight(2);
  for (var j =0; j<width; j=65+j)
  {
    for (var k=0; k<height; k=65+k)
    {
      square(j, k, 60,  10);
    }
  }
  
  for (var p=0; p<size2; p++){
    others[p].wander();
    others[p].update();
    others[p].show();
    others[p].edges();
  }
  

  
  
for (let i = 0; i<size; i++){
  let steering1 = pursuers[i].pursue(target1);
  pursuers[i].applyForce(steering1);
  
  let steering2 = pursuers[i].pursue(target2);
  pursuers[i].applyForce(steering2);

  let d = p5.Vector.dist(pursuers[i].pos, target1.pos);
  if (d < pursuers[i].r + target1.r) {
    target1 = new Target(0, random(height), c4);
    if (i<size-1){
    pursuers[i].pos.set(pursuers[i+1].pos.x, pursuers[i+1].pos.y);
    }
    if (i==size){
      pursuers[i].pos.set(pursuers[i-1].pos.x, pursuers[i-1].pos.y);
    }
  }
  
  let d2 = p5.Vector.dist(pursuers[i].pos, target2.pos);
  if (d2 < pursuers[i].r + target2.r) {
    target2 = new Target(random(width), 0, c4);
    if (i<size-1){
    pursuers[i].pos.set(pursuers[i+1].pos.x, pursuers[i+1].pos.y);
    }
    if (i==size){
      pursuers[i].pos.set(pursuers[i-1].pos.x, pursuers[i-1].pos.y);
    }
  }
  
  pursuers[i].apply(pursuers);
  pursuers[i].update();
  pursuers[i].show();
}

  target1.edges();
  target1.update();
  target1.show();
  
  target2.edges();
  target2.update();
  target2.show();  
}

class Vehicle {
  constructor(x, y, c) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.perception = 50;
    this.maxSpeed = this.perception/50;
    this.maxForce = this.maxSpeed/5;
    this.r = 16;
    this.cl = c;
    
  }
  
  pursue(vehicle) {
    let target = vehicle.pos.copy();
    let prediction = vehicle.vel.copy();
    prediction.mult(10);
    target.add(prediction);
    return this.seek(target);
  }

  seek(target) {
    let force = p5.Vector.sub(target, this.pos);
    force.setMag(this.maxSpeed);
    force.sub(this.vel);
    force.limit(this.maxForce);
    return force;
  }

  applyForce(force) {
    this.acc.add(force);
  }
  
    separationRule(pursuers){
        let steer = createVector();
        let total = 0;
        
        for(let other of pursuers){
            let distance = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y); 
            
            if( other != this && distance <= this.perception){
                let diff = p5.Vector.sub(this.pos, other.pos);
                diff.div(distance);
                steer.add(diff);
                total++;
            }   
        }
        if (total > 0){
            steer.div(total);
            steer.setMag(this.maxSpeed);
            steer.sub(this.vel);
            steer.limit(this.maxForce);
        }
        return steer;
    }
  
   cohesionRule(pursuers){
        let steer = createVector();
        let total = 0;
        
        for(let other of pursuers){
            let distance = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y); 
            
            if( other != this && distance <= this.perception){
                steer.add(other.pos);
                total++;
            }   
        }
        if (total > 0){
            steer.div(total);
            steer.sub(this.position);
            steer.setMag(this.maxSpeed);
            steer.sub(this.vel);
            steer.limit(this.maxForce);
        }

        return steer;
    }
  
  apply(pursuers){
    let separation = this.separationRule(pursuers);
    let cohesion = this.cohesionRule(pursuers);
    this.acc.add(separation);
    this.acc.add(cohesion);
  }


  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.set(0, 0);
  }

  show() {
    stroke('#D0F0C0');
    strokeWeight(3);
    fill(this.cl);
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());
    ellipse(0, 0, this.r * 2, this.r);
    pop();
  }

  edges() {
    if (this.pos.x > width + this.r) {
      this.pos.x = -this.r;
    } else if (this.pos.x < -this.r) {
      this.pos.x = width + this.r;
    }
    if (this.pos.y > height + this.r) {
      this.pos.y = -this.r;
    } else if (this.pos.y < -this.r) {
      this.pos.y = height + this.r;
    }
  }
}

class Target extends Vehicle {
  constructor(x, y, c) {
    super(x, y);
    this.vel = p5.Vector.random2D();
    this.vel.mult(6);
    this.cl = c;
  }

  show() {
    stroke(255);
    strokeWeight(2);
    fill(this.cl);
    push();
    translate(this.pos.x, this.pos.y);
    circle(0, 0, this.r * 2);
    
    text('E', -this.r/4, this.r/4);
    pop();
  }

  edges() {
    if (this.pos.x > width + this.r) {
      //this.vel.x *= -1;
      this.pos.x = this.r ;
    } else if (this.pos.x < this.r) {
      //this.vel.x *= -1;
      this.pos.x = width - this.r;
    }
    if (this.pos.y > height + this.r) {
      //this.vel.y *= -1;
      this.pos.y = this.r ;
    } else if (this.pos.y < this.r) {
      //this.vel.y *= -1;
      this.pos.y = height - this.r;
    }
  }
}

class Other{
  constructor(x, y, t){
    this.pos = createVector(x, y);
    this.vel = createVector(1, 0);
    this.acc = createVector(0, 0);
    this.maxSpeed = 1;
    this.maxForce = 0.2;
    this.r = 200;
    this.type = t;
    this.wanderTheta = PI/10 ;
    this.currentPath = [];
    this.paths = [this.currentPath];
  }
  
   applyForce(force) {
    this.acc.add(force);
  }
  
   wander() {
    let wanderPoint = this.vel.copy();
    wanderPoint.setMag(100);
    wanderPoint.add(this.pos);
    let wanderRadius = 50;
    let theta = this.wanderTheta + this.vel.heading();
    let x = wanderRadius * cos(theta);
    let y = wanderRadius * sin(theta);
    wanderPoint.add(x, y);
    let steer = wanderPoint.sub(this.pos);
    steer.setMag(this.maxForce);
    this.applyForce(steer);

    let displaceRange = 0.3;
    this.wanderTheta += random(-displaceRange, displaceRange);
  }
  
  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.set(0, 0);
    this.currentPath.push(this.pos.copy());
  }
  
  edges(){
    if (this.pos.x >= width) {this.pos.x = 0}
    if (this.pos.x <= 0) {this.pos.x = width}
    if (this.pos.y >= height) {this.pos.y = 0}
    if (this.pos.y <= 0) {this.pos.y = height}
  }
 
  show(){
switch (this.type) {
  case 1:
    image(imgG, this.pos.x, this.pos.y, 100, 50);
    break;
  case 2:
    image(imgR, this.pos.x, this.pos.y, 50, 25);
    break;
  case 3:
    image(imgM, this.pos.x, this.pos.y, 50, 25);       
    }
  }
}