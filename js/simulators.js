// ชุดแบบจำลองเสมือนจริงและเครื่องมือทดลองเชิงโต้ตอบ (Interactive Simulators)
// รายวิชา: อิเล็กทรอนิกส์กำลัง (รหัสวิชา 20105-2013)

const Simulators = {
  // 1. แบบจำลองควบคุมมุมจุดชนวน SCR (Firing Angle Simulator)
  initScrSimulator() {
    const slider = document.getElementById("scr-alpha-slider");
    const alphaVal = document.getElementById("scr-alpha-val");
    const vdcVal = document.getElementById("scr-vdc-val");
    const vrmsVal = document.getElementById("scr-vrms-val");
    const thetaVal = document.getElementById("scr-theta-val");
    const canvas = document.getElementById("scr-canvas");
    if (!slider || !canvas) return;

    const ctx = canvas.getContext("2d");

    function drawWaveform(alphaDeg) {
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;
      const amplitude = 65; // px

      ctx.clearRect(0, 0, width, height);

      // Grid background
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < width; x += 30) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += 25) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Center Reference Line (0V)
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();

      // Reference Full Sine wave (Dashed Gray)
      ctx.strokeStyle = "#475569";
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      const cycles = 2;
      const period = width / cycles;
      for (let x = 0; x <= width; x++) {
        const angle = (x / period) * 2 * Math.PI;
        const y = centerY - amplitude * Math.sin(angle);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Controlled Waveform (Cyan Glow)
      ctx.strokeStyle = "#06b6d4";
      ctx.lineWidth = 3;
      ctx.beginPath();

      const alphaRad = (alphaDeg * Math.PI) / 180;

      for (let x = 0; x <= width; x++) {
        const cycleProgress = (x % period) / period; // 0 to 1
        const angle = cycleProgress * 2 * Math.PI; // 0 to 2pi
        let y = centerY;

        // Controlled Half-wave rectifier with SCR
        if (angle >= 0 && angle < Math.PI) {
          if (angle >= alphaRad) {
            y = centerY - amplitude * Math.sin(angle);
          } else {
            y = centerY; // OFF before trigger
          }
        } else {
          y = centerY; // Reverse biased in negative cycle
        }

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Trigger Pulse marker
      const triggerX = (alphaDeg / 360) * period;
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.arc(triggerX, centerY, 5, 0, Math.PI * 2);
      ctx.fill();

      // Second cycle trigger
      ctx.beginPath();
      ctx.arc(triggerX + period, centerY, 5, 0, Math.PI * 2);
      ctx.fill();

      // Calculations (Vs = 220Vrms -> Vm = 311V)
      const Vm = 311.12;
      const Vdc = (Vm / (2 * Math.PI)) * (1 + Math.cos(alphaRad));
      const theta = 180 - alphaDeg;

      // Half-wave RMS calculation
      const Vrms = (Vm / 2) * Math.sqrt(1 - (alphaRad / Math.PI) + (Math.sin(2 * alphaRad) / (2 * Math.PI)));

      if (alphaVal) alphaVal.textContent = alphaDeg + "°";
      if (vdcVal) vdcVal.textContent = Vdc.toFixed(1) + " V";
      if (vrmsVal) vrmsVal.textContent = Vrms.toFixed(1) + " V";
      if (thetaVal) thetaVal.textContent = theta + "°";
    }

    slider.addEventListener("input", (e) => {
      drawWaveform(parseInt(e.target.value, 10));
    });

    drawWaveform(parseInt(slider.value, 10));
  },

  // 2. แบบจำลอง DC-DC Buck / Boost Converter
  initDcDcSimulator() {
    const typeSelect = document.getElementById("dcdc-type");
    const vinInput = document.getElementById("dcdc-vin");
    const dutySlider = document.getElementById("dcdc-duty");
    const dutyVal = document.getElementById("dcdc-duty-val");
    const voutVal = document.getElementById("dcdc-vout-val");
    const gainVal = document.getElementById("dcdc-gain-val");
    const formulaDisplay = document.getElementById("dcdc-formula");
    const canvas = document.getElementById("dcdc-canvas");

    if (!dutySlider || !canvas) return;
    const ctx = canvas.getContext("2d");

    function updateSimulation() {
      const type = typeSelect ? typeSelect.value : "buck";
      const Vin = parseFloat(vinInput ? vinInput.value : 24) || 24;
      const D = parseFloat(dutySlider.value) / 100; // 0 to 0.95

      let Vout = 0;
      let gain = 0;

      if (type === "buck") {
        Vout = D * Vin;
        gain = D;
        if (formulaDisplay) formulaDisplay.textContent = "Vout = D × Vin";
      } else if (type === "boost") {
        Vout = Vin / (1 - D);
        gain = 1 / (1 - D);
        if (formulaDisplay) formulaDisplay.textContent = "Vout = Vin / (1 - D)";
      } else {
        Vout = Vin * (D / (1 - D));
        gain = D / (1 - D);
        if (formulaDisplay) formulaDisplay.textContent = "Vout = -Vin × (D / (1 - D)) [ขั้วกลับ]";
      }

      if (dutyVal) dutyVal.textContent = Math.round(D * 100) + "%";
      if (voutVal) voutVal.textContent = Vout.toFixed(1) + " V";
      if (gainVal) gainVal.textContent = gain.toFixed(2) + "x";

      // Draw PWM and Inductor current wave
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Grid
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < w; x += 30) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
      for (let y = 0; y < h; y += 25) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
      ctx.stroke();

      // Top: Gate PWM pulse
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      const period = w / 3;
      const ton = period * D;

      for (let i = 0; i < 3; i++) {
        const startX = i * period;
        ctx.moveTo(startX, 60);
        ctx.lineTo(startX, 20);
        ctx.lineTo(startX + ton, 20);
        ctx.lineTo(startX + ton, 60);
        ctx.lineTo(startX + period, 60);
      }
      ctx.stroke();

      // Label PWM
      ctx.fillStyle = "#38bdf8";
      ctx.font = "11px sans-serif";
      ctx.fillText("PWM Gate Signal (Ton / Toff)", 10, 15);

      // Bottom: Inductor Current iL (Triangular Ripple in CCM)
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 3;
      ctx.beginPath();
      const iMin = 130;
      const iMax = 85;

      for (let i = 0; i < 3; i++) {
        const startX = i * period;
        ctx.moveTo(startX, iMin);
        ctx.lineTo(startX + ton, iMax); // Rising current
        ctx.lineTo(startX + period, iMin); // Falling current
      }
      ctx.stroke();

      ctx.fillStyle = "#10b981";
      ctx.font = "11px sans-serif";
      ctx.fillText("Inductor Current (iL Ripple in CCM)", 10, 80);
    }

    if (typeSelect) typeSelect.addEventListener("change", updateSimulation);
    if (vinInput) vinInput.addEventListener("input", updateSimulation);
    dutySlider.addEventListener("input", updateSimulation);

    updateSimulation();
  },

  // 3. แบบจำลองสวิตช์หรี่ไฟ (Light Dimmer Interactive Sim)
  initDimmerSimulator() {
    const slider = document.getElementById("dimmer-slider");
    const lampGlow = document.getElementById("dimmer-lamp-glow");
    const powerPercent = document.getElementById("dimmer-power-percent");
    const cutAngle = document.getElementById("dimmer-cut-angle");
    if (!slider || !lampGlow) return;

    slider.addEventListener("input", (e) => {
      const val = parseInt(e.target.value, 10); // 0 to 100 %
      const angle = Math.round(180 - (val * 1.8)); // 180° (dark) down to 0° (bright)

      if (powerPercent) powerPercent.textContent = val + "%";
      if (cutAngle) cutAngle.textContent = angle + "°";

      // Glow intensity style
      const glowOpacity = (val / 100);
      const blurRadius = (val / 100) * 45;
      lampGlow.style.boxShadow = `0 0 ${blurRadius}px ${blurRadius / 2}px rgba(245, 158, 11, ${glowOpacity})`;
      lampGlow.style.backgroundColor = `rgba(251, 191, 36, ${Math.max(0.1, glowOpacity)})`;
      lampGlow.style.borderColor = `rgba(245, 158, 11, ${Math.max(0.3, glowOpacity)})`;
    });
  }
};
