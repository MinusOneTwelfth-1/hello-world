console.log('lab.js')  


     const canvas = shadowDiv.shadowRoot.querySelector("#simCanvas")
    const ctx = canvas.getContext('2d');
   const plotCanvas=shadowDiv.shadowRoot.querySelector("#plotCanvas")
    const plotCtx=plotCanvas.getContext('2d');
        // Control Elements
    const massSlider = shadowDiv.shadowRoot.getElementById('massSlider');
    const massText = shadowDiv.shadowRoot.getElementById('massText');
    const stiffnessSlider = shadowDiv.shadowRoot.getElementById('stiffnessSlider');
    const stiffnessText = shadowDiv.shadowRoot.getElementById('stiffnessText');
    const startStopBtn = shadowDiv.shadowRoot.getElementById('startStopBtn');
    const msgbox = shadowDiv.shadowRoot.getElementById('msgbox')
    const nonlinchk = shadowDiv.shadowRoot.getElementById('chk-nonlinear')
    const boink = shadowDiv.shadowRoot.getElementById('boink')
    let boinkCtx;

    // Simulation Constants & Variables
    const g = 9.81;            // Gravity
    const pixelsPerMeter = 20; // Scale factor
    const anchorX = canvas.width / 2;
    let anchorY = 50;        // Ceiling height
    const restLength = 150;    // Unstretched spring length in pixels

        let mass = parseFloat(massSlider.value);
    let k = parseFloat(stiffnessSlider.value);
     let damping = 0.25;
    let isRunning = false;

    // Physics State
    let y = anchorY + restLength + (mass * g * pixelsPerMeter) / k; // Current mass Y position
    let y_mtr = 0; // y in meters
    let v = 0;       // Velocity
    let v_mid=0;  // half-step velocity
    let acceleration=0;         // acceleration
    let lastTime = 0;
    let equiY=y
    let springForce;
    let dampingForce;
    let support_dY=0   // pulling up on spring for pump input
     // Interaction State
    let isDragging = false;

    // Sync input controls
    function updateMass(val,fromRemote=true) {  // by default pretend it's from remote hence no message to peer
      //  console.log('updateMass: '+val )
      //  if(val==17.5 && k==32){debugger;}
        mass = Math.max(1, Math.min(20, parseFloat(val)));
        massSlider.value = mass;
        massText.value = mass;
        if(!fromRemote){
        
        msgInput.value=JSON.stringify({"mass": mass,"timestamp": Date.now()})
        sendBtn.click()
        }

        if (!isRunning && !isDragging) {
            resetToEquilibrium();
        }
    }

    function updateStiffness(val, fromRemote=true) {  // by default pretend it's from remote hence no message to peer
      //  console.log('updateMass: '+val )
        k = Math.max(5, Math.min(100, parseFloat(val)));
        stiffnessSlider.value = k;
        stiffnessText.value = k;

        if(! fromRemote){
        msgInput.value=JSON.stringify({"stiffness": k,"timestamp": Date.now()})
        sendBtn.click()
         }

        if (!isRunning && !isDragging) {
            resetToEquilibrium();
        }
    }

    function resetToEquilibrium() {
         support_dY=0.
        const equilibriumOffset = (mass * g * pixelsPerMeter * 0) / k;    // ======= no gravity in new version ======
        y = anchorY + restLength + equilibriumOffset;
         y_mtr = (y - anchorY - restLength)/pixelsPerMeter
        equiY=y
        v = 0;
       draw();
    }

    massSlider.addEventListener('input', (e) => updateMass(e.target.value,false));
    massText.addEventListener('input', (e) => updateMass(e.target.value),false);
    stiffnessSlider.addEventListener('input', (e) => updateStiffness(e.target.value,false));
    stiffnessText.addEventListener('input', (e) => updateStiffness(e.target.value,false));

    // Button Toggle
    startStopBtn.addEventListener('click', () => {
        isRunning = !isRunning;
        if (isRunning) {
            startStopBtn.textContent = 'Stop';
            startStopBtn.classList.add('stop');
            lastTime = performance.now();

            msgInput.value=JSON.stringify({"state": "start", "v": v, "y": y, "equiY": equiY, "timestamp": Date.now()})
            sendBtn.click()

            requestAnimationFrame(simLoop);
        } else {
            startStopBtn.textContent = 'Start';
            msgInput.value=JSON.stringify({"state": "stop","timestamp": Date.now()})
            sendBtn.click()

            startStopBtn.classList.remove('stop');
        }

         if (!boinkCtx) { console.log("new boink"); boinkCtx = new (window.AudioContext || window.webkitAudioContext)();
                           loadBoingSound("boink.mp3")
                        }
    });

    // Mouse/Touch Dragging Mechanics
    function getMouseY(e) {
        const rect = canvas.getBoundingClientRect();
        return (e.clientY || e.touches[0].clientY) - rect.top;
    }

    function getMouseX(e) {
        const rect = canvas.getBoundingClientRect();
        return (e.clientX || e.touches[0].clientX) - rect.left;
    }

    function checkHit(mx, my) {           // old version that 
        const radius = 15 + mass * 0.5;   // doesn't consider canvas size
        const dx = mx - anchorX;
        const dy = my - y;
        return Math.sqrt( (dx * dx + dy * dy) ) < Math.sqrt(  (radius * radius)  ) + 50;
    }

/*
   function checkHit(e, canvas, y, mass) {  // new AI version : canvas size
    // 1. Get the precise, current bounding box of the canvas
    const rect = canvas.getBoundingClientRect();
    
    // 2. Calculate the exact mouse coordinates relative to the canvas element
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    
    // 3. Dynamically calculate anchorX based on current canvas width
    const anchorX = canvas.width / 2;
    
    // 4. Calculate radius based on mass
    const radius = 15 + mass * 0.5;
    
    // 5. Run the distance formula (Pythagorean theorem)
    const dx = mx - anchorX;
    const dy = my - y;
    
    // Returns true if the click is inside the circle
    return (dx * dx + dy * dy) < (radius * radius);
}
*/

    function startDrag(e) {
      
        const mx = getMouseX(e);
        const my = getMouseY(e);
        hashit=checkHit(mx,my)
    
        if (checkHit(mx, my)) {
            isDragging = true;
            isRunning = false;
           // console.log(checkHit(mx,my))
            startStopBtn.textContent = 'Start';
            startStopBtn.classList.remove('stop');
            v = 0;
        }
    }

    function doDrag(e) {
        // console.log('dodrag '+e)
        if (!isDragging) return;
        e.preventDefault();
        const my = getMouseY(e);
        // Constrain movement within reasonable canvas boundaries
        y = Math.max(anchorY + 20, Math.min(canvas.height - 50, my));
        y_mtr = (y - anchorY - restLength)/pixelsPerMeter
        msgInput.value=JSON.stringify({"y":y,"timestamp": Date.now()})
        sendBtn.click()

        draw();
    }

    function endDrag() {
        isDragging = false;
    }

    canvas.addEventListener('mousedown', startDrag);
    canvas.addEventListener('mousemove', doDrag);
    window.addEventListener('mouseup', endDrag);

    canvas.addEventListener('touchstart', startDrag, { passive: false });
    canvas.addEventListener('touchmove', doDrag, { passive: false });
    window.addEventListener('touchend', endDrag);

    // Render Function
    let plotCounter=0 // counts how many points have been plotted since retrace
        let plotPump=[];
         {for( i=0; i<110; i++){plotPump.push(100 + 25 * Math.sin(i/25 * 2 * Math.PI))
                               }
         }
    const uparro=new Image()
     uparro.src="up-arrow.png"
    const downarro=new Image()
    downarro.src="down-arrow.png"

   const upsigarro=new Image()
    upsigarro.src="up-sig-arrow.png"
   const downsigarro=new Image()
   downsigarro.src="down-sig-arrow.png"

    let upBoing = false // flag to show up arrow during pump "boing"
    let holdBoing= false // flag to keep showing arrow until end of pulse
    let boingCount=0

    let upSigBoing=false
    let holdSigBoing=false
    let sigBoingCount=0
     let arow // either uparro or downarro

    function draw() { // =============== draw the canvases ================
  
        ctx.clearRect(0, 0, canvas.width, canvas.height);

             
        // Draw Ceiling
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(anchorX - 30, anchorY + support_dY*pixelsPerMeter);
        ctx.lineTo(anchorX + 30, anchorY + support_dY*pixelsPerMeter);
        ctx.stroke();

              // Draw equilibrium line
        ctx.strokeStyle = '#a0affd';
        ctx.setLineDash([10, 5]);
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(anchorX - 100, equiY);
        ctx.lineTo(anchorX + 100, equiY);
        //ctx.lineTo(anchorX+100, equiY)
        //ctx.lineTo(anchorX-100, equiY)
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw Spring
        const currentLength = y - support_dY*pixelsPerMeter;
        const turns = 15;
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(anchorX, anchorY + support_dY*pixelsPerMeter);
        
        for (let i = 0; i <= turns; i++) {
            const fraction = i / turns;
            const springY = anchorY + support_dY*pixelsPerMeter + currentLength * fraction;
            let springX = anchorX;
            if (i > 0 && i < turns) {
                springX += (i % 2 === 0 ? 15 : -15);
            }
            ctx.lineTo(springX, springY);
        }
        ctx.stroke();

        // Draw Mass
        const radius = 15 + mass * 0.5; // Size scales slightly with mass
        ctx.fillStyle = '#007bff';
        ctx.strokeStyle = '#0056b3';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(anchorX, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

         // draw sigForce arrow
         drawArrow(20,y,20,y+sigForce*5,"red")

         // draw pumpForce arrow
         drawArrow(40,y,40,y+pumpForce*5,"blue")

         // plot
         plotCtx.lineWidth=3;
         plotCtx.strokeStyle="#c82e2e"
          plotCtx.beginPath()
          plotCtx.moveTo(0,plotPump[0] )
                     {   for(let i=0;i<=110;i++){
           plotCtx.lineTo(i, plotPump[i])
          plotCtx.stroke()
                                               }
                     }
    }
    

function drawArrow(x0,y0,x1,y1,color="red"){ctx.strokeStyle=color
ctx.lineWidth=3
ctx.beginPath()
ctx.moveTo(x0,y0)
ctx.lineTo(x1,y1)
ctx.lineTo(x1-10,y1-10*Math.sign(y1-y0))
ctx.moveTo(x1,y1)
ctx.lineTo(x1+10,y1-10*Math.sign(y1-y0))
ctx.stroke()}


       // Draw equiY line
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.lineTo(anchorX,equiY)
        ctx.stroke()

    function sigma(x,k,xt){ let zx=-k* (x - xt);    return 1/(1 + Math.exp(zx))}
    function nonlinForce(x, a, k, xt) { return (1 - sigma(x, k, xt) ) * x / 2 +   a * sigma(x, k, xt)*x*x }
    let nl_a = 1.75; let nl_k = 3; let nl_xt = 1;

async function loadBoingSound(url) {
     console.log("trying to load " + url )
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    // Decode the raw audio data into an optimized buffer
    boingBuffer = await boinkCtx.decodeAudioData(arrayBuffer);
  } catch (error) {
    console.error("Failed to load audio:", error);
  }
}



function playBoing(ofst=0.2) {   //  ====== AUDIO "BOING" 
  if (!boingBuffer || boinkCtx.state === 'suspended') return;

  // AudioBufferSourceNodes are single-use disposable objects
  const source = boinkCtx.createBufferSource();
  source.buffer = boingBuffer;
  
  // Route to the speakers
  source.connect(boinkCtx.destination);
  
  // Play immediately with zero latency using the precise AudioContext timeline
  source.start(boinkCtx.currentTime,ofst);
}




// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Physics Engine Loop @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
let tankFrequency = 1/ ( 1/ 2 / Math.PI * Math.sqrt (k/mass)  )
let pumpFrequency= tankFrequency * 2.05
let pumpAmplitude= 10

let sigFrequency= tankFrequency / 1.05
let sigAmplitude=5

let pumpForce=0.
let sigForce = 0.

let lastZeroTime=0 // for zero crossing measurement
let zeroCrossingPeriod=1



function simLoop(time) {
  
        if (!isRunning) return;

        const dt = (time - lastTime) / 1000; // convert to seconds
        lastTime = time; // document.title=time
    
     // Cap dt to prevent instability if the tab loses focus
        const clampedDt = Math.min(dt, 0.1);

        
        // ============= VELOCITY VERLET ===============
         // FIRST UPDATE POSITION
        const y_mtr_change = v * clampedDt + 0.5 * acceleration * clampedDt*clampedDt;
        const y_mtr_old = y_mtr
        y_mtr = y_mtr + y_mtr_change;
    
     // ==== zero crossing detector
     if (y_mtr_old < 0  && y_mtr > 0 ) {zeroCrossingPeriod=(time-lastZeroTime)/1000; 
               //  console.log("zero zero zero " + zeroCrossingPeriod + " " + 1/zeroCrossingPeriod)
                                       lastZeroTime=time
                                       }
     
        // Estimate half-step velocity for use in damping force calc
        v_mid = v + 0.5 * acceleration * clampedDt

         // FIND TOTAL FORCE
         if (! nonlinchk.checked){     // linear or nonlinear spring force 
        springForce = -k * (y_mtr - support_dY) ;
        }
         else{ springForce= k* nonlinForce(-y_mtr, nl_a, nl_k, nl_xt)
         }

         dampingForce = - damping * v_mid;  // damping force

  pumpForce = pumpAmplitude * Math.sin ( 2 * Math.PI * pumpFrequency * time/1000)
   sigForce = sigAmplitude * Math.sin ( 2 * Math.PI * sigFrequency * time/1000)

  

document.title = pumpForce.toFixed(3) + "  " + sigForce.toFixed(3)   
     const totalForce = springForce + dampingForce + pumpForce + sigForce
         
         // ACCELERATION
         acceleration = totalForce / mass

         // FINAL VELO AT END OF STEP
         v = v_mid + 0.5 * acceleration * clampedDt
         

        // canvas Y position
         y = y_mtr * pixelsPerMeter + restLength + anchorY;

         // Convert current displacement from pixels back to meters for calculation
        const currentLengthMeters = (y - anchorY) / pixelsPerMeter;
        const restLengthMeters = restLength / pixelsPerMeter;
        const displacement = currentLengthMeters - restLengthMeters;
         
        /* =====================  OLD (NON-VERLET) commented out =========
        let springForce;
        // F = -k*(x-100) + m*g * 0.00  (linear) === no gravity in new version ===
        if (! nonlinchk.checked){ 
        springForce = -k * displacement;
        }
         else{ springForce= k* nonlinForce(-displacement, nl_a, nl_k, nl_xt)
         }
        const gravityForce = mass * g * 0;
        const totalForce = springForce + gravityForce;

        // Acceleration
        const a = totalForce / mass;

        // Update velocity and position
        v += a * clampedDt;
        const dyMeters = v * clampedDt;
        y_mtr += dyMeters
        y += dyMeters * pixelsPerMeter;
   */
             
        draw();
        requestAnimationFrame(simLoop);
    }

    // Initial draw
    resetToEquilibrium();

function setParam(params, fromRemote=true) {  // be default pretend it's a remote command -- don't send message to peer
    console.log(params)
    if (!params || typeof params !== 'object') return;

    // 1. Check and update mass if provided
    if (params.hasOwnProperty('mass')) {
        let rawMass = parseFloat(params.mass);
        mass = Math.max(1, Math.min(20, rawMass));
        updateMass(mass, fromRemote)
    }

    // 2. Check and update stiffness if provided
    if (params.hasOwnProperty('stiffness')) {
        let rawK = parseFloat(params.stiffness);
        k = Math.max(5, Math.min(100, rawK));
        updateStiffness(k,fromRemote)
    }

    // 3. Check and update the execution state (Start / Stop)
    if (params.hasOwnProperty('state')) {
        let stateVal = params.state;
        
        // Normalize the state value to a boolean
        let shouldRun = false;
        if (typeof stateVal === 'string') {
            shouldRun = (stateVal.toLowerCase() === 'start' || stateVal.toLowerCase() === 'run');
        } else {
            shouldRun = !!stateVal; // Handles true / false
        }

       // Apply changes if it differs from the current running state
        if (shouldRun !== isRunning) {
            isRunning = shouldRun;
            
            if (isRunning) {
                startStopBtn.textContent = 'Stop';
                startStopBtn.classList.add('stop');
                lastTime = performance.now();
                requestAnimationFrame(simLoop);
            } else {
                startStopBtn.textContent = 'Start';
                startStopBtn.classList.remove('stop');
            }
        }
    }

// 4. Check and update y (position of mass element) if provided
    if (params.hasOwnProperty('y')) {    //params.hasOwnProperty('y')
        console.log('setting y '+ params.y)
        let rawY = parseFloat(params.y);
        y=rawY; draw();
          }
 

    // 5. Default baseline update if simulation is fully stopped
    if (!isRunning && !isDragging) {
     //   resetToEquilibrium();
    }

    // 6. Check and update equiY (equilibrium line) if provided
    if (params.hasOwnProperty('equiY')) {    //params.hasOwnProperty('equiY')
        console.log('setting equiY '+ params.equiY)
        let raweY = parseFloat(params.equiY);
        equiY=raweY; draw();
          }

}





window.addEventListener('message', (event) => {
  // Security check: reject messages from unexpected origins
  //if (event.origin !== 'https://parent-domain.com') return;

  // Process the received data
  console.log('Message received from popout:', event.data+'\n');
  setParam(event.data,true)    //          second argument is fromRemote : true because this is a remote setParam call
  msgbox.value=msgbox.value+'\n......\n'+event.data
});

freq=1/2/Math.PI*Math.sqrt(k/mass)
pumpThreshold=1/freq/2*1.05/2
sigThreshold=1/freq/2/0.9

console.log("lab.js ====  4.4")

//# sourceURL=praveen.com/lab.js
