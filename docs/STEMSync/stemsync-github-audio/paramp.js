//shadowDiv.shadowRoot.querySelector("#simCanvas")
console.log("===== paramp.js =======")
console.log("document.title = " + document.title)

sRoot=shadowDiv.shadowRoot;

const simCanvas = sRoot.getElementById('simCanvas');

        const ctxSim = simCanvas.getContext('2d');
        const chartCanvas = sRoot.getElementById('chartCanvas');
        const ctxChart = chartCanvas.getContext('2d');

        // State variables
        let m = 2.0;
        let k0 = 20.0;
        let b = 0.27;
        let dk = 2.0;
        let fpMult = 2.0;
        let Fext0 = 1.5;
        let fs = 0.48;
        let pumpActive = false;

        let x = 0.0; // Displacement from equilibrium
        let v = 0.0; // Velocity
        let t = 0.0;

        let history = [];
        const maxHistory = 500;

        // UI Elements
        const inputs = {
            m:sRoot.getElementById('param-m'),
            k: sRoot.getElementById('param-k'),
            b: sRoot.getElementById('param-b'),
            dk: sRoot.getElementById('param-dk'),
            fpMult: sRoot.getElementById('param-fp-mult'),
            fext: sRoot.getElementById('param-fext'),
            fs: sRoot.getElementById('param-fs')
        };

        const displays = {
            m: sRoot.getElementById('val-m'),
            k: sRoot.getElementById('val-k'),
            b: sRoot.getElementById('val-b'),
            dk: sRoot.getElementById('val-dk'),
            fpMult: sRoot.getElementById('val-fp-mult'),
            fext: sRoot.getElementById('val-fext'),
            fs: sRoot.getElementById('val-fs'),
            f0: sRoot.getElementById('stat-f0'),
            fp: sRoot.getElementById('stat-fp'),
            fi: sRoot.getElementById('stat-fi')
        };

        function updateParameters() {
            m = parseFloat(inputs.m.value);
            k0 = parseFloat(inputs.k.value);
            b = parseFloat(inputs.b.value);
            dk = pumpActive ? parseFloat(inputs.dk.value) : 0;
            fpMult = parseFloat(inputs.fpMult.value);
            Fext0 = parseFloat(inputs.fext.value);
            fs = parseFloat(inputs.fs.value);

            // Update value readouts
            displays.m.textContent = m.toFixed(1);
            displays.k.textContent = k0.toFixed(0);
            displays.b.textContent = b.toFixed(2);
            displays.dk.textContent = parseFloat(inputs.dk.value).toFixed(1);
            displays.fpMult.textContent = fpMult.toFixed(2);
            displays.fext.textContent = Fext0.toFixed(1);
            displays.fs.textContent = fs.toFixed(2);

            // Calculations
            let omega0 = Math.sqrt(k0 / m);
            let f0 = omega0 / (2 * Math.PI);
            let fp = f0 * fpMult;

            displays.f0.textContent = f0.toFixed(2);
            displays.fp.textContent = fp.toFixed(2);
            displays.fi.textContent = Math.abs(fp - fs).toFixed(2);
        }

        // Attach listeners
        Object.values(inputs).forEach(input => input.addEventListener('input', updateParameters));
        
        sRoot.getElementById('btn-toggle-pump').addEventListener('click', (e) => {
            pumpActive = !pumpActive;
            e.target.textContent = pumpActive ? "Turn Pump OFF" : "Turn Pump ON";
            e.target.style.background = pumpActive ? "#0071e3" : "#34c759";
            updateParameters();
        });

        sRoot.getElementById('btn-clear').addEventListener('click', () => {
            history = [];
            x = 0; v = 0; t = 0;
        });


<!-- end of part 2 -->


        // Physics loop
        const dt = 0.05; 
        function stepPhysics() {
            let omega0 = Math.sqrt(k0 / m);
            let f0 = omega0 / (2 * Math.PI);
            let fp = f0 * fpMult;
            let omegaP = 2 * Math.PI * fp;
            let omegaS = 2 * Math.PI * fs;

            // Parametric modulation of k
            let currentK = k0 + dk * Math.sin(omegaP * t);
  
            // External force (Electromagnet input)
            let Fext = Fext0 * Math.sin(omegaS * t);

            // Physics Equations (F = ma -> a = F/m)
            let SpringForce = -currentK * x;
            let DampingForce = -b * v;
            let TotalForce = SpringForce + DampingForce + Fext;
            
            let a = TotalForce / m;
            v += a * dt;
            x += v * dt;
            t += dt;

            // Record history
            history.push({ x: x, Fext: Fext, dk: currentK - k0 });
            if (history.length > maxHistory) history.shift();
        }

        function drawSpring(ctx, startX, startY, endX, endY, coils) {
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            let dx = endX - startX;
            let dy = endY - startY;
            let len = Math.sqrt(dx*dx + dy*dy);
            
            for(let i=0; i<=coils; i++) {
                let fraction = i / coils;
                let curX = startX + dx * fraction;
                let curY = startY + dy * fraction;
                if (i > 0 && i < coils) {
                    let offset = (i % 2 === 0 ? 1 : -1) * 15;
                    // perpendicular vector offset
                    curX += (-dy/len) * offset;
                    curY += (dx/len) * offset;
                }
                ctx.lineTo(curX, curY);
            }
            ctx.stroke();
        }

        function render() {
            // 1. Render Simulation Box
            ctxSim.clearRect(0, 0, simCanvas.width, simCanvas.height);
            
            let midY = simCanvas.height / 2;
            let centerX = simCanvas.width / 2;
            let massSize = 40;
            let currentXPos = centerX + x * 15; // scale factor for visual drawing

            // Draw ceiling/anchor
            ctxSim.fillStyle = "#86868b";
            ctxSim.fillRect(20, midY - 40, 10, 80);

            // Draw Spring
            ctxSim.strokeStyle = "#1d1d1f";
            ctxSim.lineWidth = 2;
            drawSpring(ctxSim, 30, midY, currentXPos - massSize/2, midY, 15);

            // Draw Mass
            ctxSim.fillStyle = "#0071e3";
            ctxSim.fillRect(currentXPos - massSize/2, midY - massSize/2, massSize, massSize);
            ctxSim.fillStyle = "white";
            ctxSim.font = "12px sans-serif";
            ctxSim.fillText("m", currentXPos - 5, midY + 4);

            // Draw Electromagnet Input Source
            let magX = simCanvas.width - 40;
            ctxSim.fillStyle = "#ff453a";
            ctxSim.fillRect(magX, midY - 25, 20, 50);
            ctxSim.fillStyle = "white";
            ctxSim.font = "10px sans-serif";
            ctxSim.fillText("EM", magX + 2, midY + 4);

            // Magnetic Force flux lines visual indicator
            if (Fext0 > 0 && history.length > 0) {
                let currentF = history[history.length - 1].Fext;
                if (Math.abs(currentF) > 0.2) {
                    ctxSim.strokeStyle = `rgba(255, 69, 58, ${Math.min(Math.abs(currentF)/Fext0, 1)})`;
                    ctxSim.lineWidth = 1.5;
                    ctxSim.beginPath();
                    ctxSim.arc(magX - 10, midY, 20, -Math.PI/3, Math.PI/3);
                    ctxSim.stroke();
                }
            }

            // 2. Render Scope Charts
            ctxChart.clearRect(0, 0, chartCanvas.width, chartCanvas.height);
            
            // Draw axis lines
            ctxChart.strokeStyle = "#e5e5e7";
            ctxChart.lineWidth = 1;
            ctxChart.beginPath();
            ctxChart.moveTo(0, chartCanvas.height/2);
            ctxChart.lineTo(chartCanvas.width, chartCanvas.height/2);
            ctxChart.stroke();

            if (history.length > 1) {
                // Plot Displacement Wave (Blue)
                ctxChart.strokeStyle = "#0071e3";
                ctxChart.lineWidth = 2;
                ctxChart.beginPath();
                for(let i=0; i<history.length; i++) {
                    let pixelX = (i / maxHistory) * chartCanvas.width;
                    let pixelY = chartCanvas.height/2 - (history[i].x * 12);
                    if (i === 0) ctxChart.moveTo(pixelX, pixelY);
                    else ctxChart.lineTo(pixelX, pixelY);
                }
                ctxChart.stroke();

                // Plot Input EM Signal Wave (Red)
                ctxChart.strokeStyle = "rgba(255, 69, 58, 0.6)";
                ctxChart.lineWidth = 1.5;
                ctxChart.beginPath();
                for(let i=0; i<history.length; i++) {
                    let pixelX = (i / maxHistory) * chartCanvas.width;
                    let pixelY = chartCanvas.height/2 - (history[i].Fext * 8);
                    if (i === 0) ctxChart.moveTo(pixelX, pixelY);
                    else ctxChart.lineTo(pixelX, pixelY);
                }
                ctxChart.stroke();
            }

            // Legend labels
            ctxChart.fillStyle = "#0071e3";
            ctxChart.font = "11px sans-serif";
            ctxChart.fillText("━ Amplified Mass Motion (Output)", 10, 20);
            ctxChart.fillStyle = "rgba(255, 69, 58, 0.9)";
            ctxChart.fillText("━ Electromagnet Drive (Input Signal)", 10, 36);
        }

        function loop() {
            stepPhysics();
            render();
            requestAnimationFrame(loop);
        }

        // Initialize and Start
        updateParameters();
        loop();
