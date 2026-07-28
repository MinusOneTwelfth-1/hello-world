// --- Simulation Constants ---
const DT = 0.001;        // Fixed physics step size (1ms) for high numerical stability
const MASS = 1.0;        // Mass (m)
const GAMMA = 0.05;      // Damping coefficient (γ)
const OMEGA_PUMP = 2.0;  // Pumping frequency (typically ~2x natural frequency)
const PUMP_AMP = 0.2;    // Strength of parametric pumping

// --- System State Variables ---
let x = 0.1;             // Position (Displacement / Charge) - start slightly off-center
let v = 0.0;             // Velocity (Current)
let F_spring = 0.0;      // Integrated nonlinear spring force (Voltage)
let time = 0.0;          // Accumulated internal simulation time

// --- Timing Accumulator Variables ---
let lastTimestamp = 0;
let accumulator = 0.0;

/**
 * Core physics step executing the state-variable integration
 * dF/dt = softplus(x) * v
 */
function pshysicsStep(dt) {
    // 1. Compute softplus stiffness: K(x) = ln(1 + e^x)
    // Math.exp(x) can overflow if x grows too large; softplus naturally caps tracking
    const K = Math.log(1.0 + Math.exp(x));

    // 2. Dynamically integrate the internal spring force: dF = K * v * dt
    F_spring += K * v * dt;

    // 3. Calculate external parametric pump force (modulating the system)
    const F_pump = PUMP_AMP * Math.sin(OMEGA_PUMP * time);

    // 4. Sum up forces: F_total = F_pump - F_spring - F_damping
    const F_total = F_pump - F_spring - (GAMMA * v);

    // 5. Update state variables using Semi-Implicit Euler method
    v += (F_total / MASS) * dt;
    x += v * dt;

    // 6. Advance internal simulation time
    time += dt;
}

/**
 * Main loop bound to requestAnimationFrame
 */
function animationLoop(currentTimestamp) {
    // Handle the very first frame initialization
    if (!lastTimestamp) {
        lastTimestamp = currentTimestamp;
        requestAnimationFrame(animationLoop);
        return;
    }

    // Convert real-world elapsed time to seconds
    let frameTime = (currentTimestamp - lastTimestamp) / 1000.0;
    lastTimestamp = currentTimestamp;

    // Panic threshold: cap frameTime to prevent "spiral of death" during lag spikes
    if (frameTime > 0.25) {
        frameTime = 0.25;
    }

    // Add real elapsed time to the physics bucket
    accumulator += frameTime;

    // Consume time chunks in identical, predictable fixed increments
    while (accumulator >= DT) {
        pshysicsStep(DT);
        accumulator -= DT;
    }

    // --- Render Scene ---
    // draw(x, v); // Call your drawing visual functions here using current state

    // Request next animation frame
    requestAnimationFrame(animationLoop);
}

// Start the loop
requestAnimationFrame(animationLoop);
