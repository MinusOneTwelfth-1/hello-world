console.log('lab.js')  


     const canvas = shadowDiv.shadowRoot.querySelector("#simCanvas")
    const ctx = canvas.getContext('2d');
        // Control Elements
    const massSlider = shadowDiv.shadowRoot.getElementById('massSlider');
    const massText = shadowDiv.shadowRoot.getElementById('massText');
    const stiffnessSlider = shadowDiv.shadowRoot.getElementById('stiffnessSlider');
    const stiffnessText = shadowDiv.shadowRoot.getElementById('stiffnessText');
    const startStopBtn = shadowDiv.shadowRoot.getElementById('startStopBtn');
    const msgbox = shadowDiv.shadowRoot.getElementById('msgbox')

    // Simulation Constants & Variables
    const g = 9.81;            // Gravity
    const pixelsPerMeter = 20; // Scale factor
    const anchorX = canvas.width / 2;
    const anchorY = 50;        // Ceiling height
    const restLength = 150;    // Unstretched spring length in pixels
    

    let mass = parseFloat(massSlider.value);
    let k = parseFloat(stiffnessSlider.value);
    let isRunning = false;

    // Physics State
    let y = anchorY + restLength + (mass * g * pixelsPerMeter) / k; // Current mass Y position
    let v = 0;                                                      // Velocity
    let lastTime = 0;
    let equiY=y

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
        const equilibriumOffset = (mass * g * pixelsPerMeter) / k;
        y = anchorY + restLength + equilibriumOffset;
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
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw Ceiling
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(anchorX - 30, anchorY);
        ctx.lineTo(anchorX + 30, anchorY);
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
        const currentLength = y - anchorY;
        const turns = 15;
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(anchorX, anchorY);
        
        for (let i = 0; i <= turns; i++) {
            const fraction = i / turns;
            const springY = anchorY + currentLength * fraction;
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
    }

       // Draw equiY line
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.lineTo(anchorX,equiY)
        ctx.stroke()

    // Physics Engine Loop
    function simLoop(time) {
        if (!isRunning) return;

        const dt = (time - lastTime) / 1000; // convert to seconds
        lastTime = time;

        // Cap dt to prevent instability if the tab loses focus
        const clampedDt = Math.min(dt, 0.1);

        // Convert current displacement from pixels back to meters for calculation
        const currentLengthMeters = (y - anchorY) / pixelsPerMeter;
        const restLengthMeters = restLength / pixelsPerMeter;
        const displacement = currentLengthMeters - restLengthMeters;

        // F = -k*x + m*g
        const springForce = -k * displacement;
        const gravityForce = mass * g;
        const totalForce = springForce + gravityForce;

        // Acceleration
        const a = totalForce / mass;

        // Update velocity and position
        v += a * clampedDt;
        const dyMeters = v * clampedDt;
        y += dyMeters * pixelsPerMeter;

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



//# sourceURL=praveen.com/lab.js