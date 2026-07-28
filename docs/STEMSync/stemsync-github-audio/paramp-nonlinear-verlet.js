/**
 * Physics step executing the Velocity Verlet integration method
 * Correctly accounts for dF/dt = softplus(x) * v
 */
function physicsStepVerlet(dt) {
    // --- STEP 1: Compute current acceleration and stiffness ---
    let K = Math.log(1.0 + Math.exp(x));
    let F_pump = PUMP_AMP * Math.sin(OMEGA_PUMP * time);
    let accel_current = (F_pump - F_spring - (GAMMA * v)) / MASS;

    // --- STEP 2: Predict half-step velocity ---
    // Update velocity by half a time step using current acceleration
    let v_half = v + 0.5 * accel_current * dt;

    // --- STEP 3: Update position for the full step ---
    x += v_half * dt;

    // --- STEP 4: Update the integrated spring force ---
    // We use the half-step velocity here for optimal central-difference accuracy
    K = Math.log(1.0 + Math.exp(x)); // Recalculate stiffness at new position
    F_spring += K * v_half * dt;

    // --- STEP 5: Compute next acceleration at the new position ---
    // Advance internal time to match the new position checkpoint
    time += dt; 
    let F_pump_next = PUMP_AMP * Math.sin(OMEGA_PUMP * time);
    
    // We must approximate the next acceleration using v_half for the damping term
    // to keep the system explicit and avoid implicit algebraic loops.
    let accel_next = (F_pump_next - F_spring - (GAMMA * v_half)) / MASS;

    // --- STEP 6: Finalize full-step velocity ---
    // Update velocity by the remaining half step using the new acceleration
    v = v_half + 0.5 * accel_next * dt;
}
