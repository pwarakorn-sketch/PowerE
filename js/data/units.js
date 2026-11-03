// ข้อมูลเนื้อหาบทเรียน 10 หน่วยการเรียนรู้
// รายวิชา: อิเล็กทรอนิกส์กำลัง (รหัสวิชา 20105-2013) หลักสูตรประกาศนียบัตรวิชาชีพ (ปวช.)

const UNITS_DATA = [
  {
    id: 1,
    title: "วงจรแหล่งจ่ายไฟฟ้ากระแสตรงครึ่งคลื่นและเต็มคลื่น",
    enTitle: "Half-Wave and Full-Wave DC Power Supply",
    icon: "activity",
    badge: "หน่วยที่ 1",
    summary: "ศึกษาหลักการทำงานของไดโอดเรียงกระแส วงจรแปลงไฟฟ้ากระแสสลับเป็นกระแสตรงแบบครึ่งคลื่น แบบเต็มคลื่นมีแท็ปกลาง และแบบบริดจ์ การคำนวณแรงดันเฉลี่ย Vdc, แรงดันยังผล Vrms, ตัวประกอบการกระเพื่อม (Ripple Factor) และพิกัดแรงดัน PIV",
    objectives: [
      "อธิบายหลักการทำงานของวงจรเรียงกระแสแบบครึ่งคลื่นและเต็มคลื่นได้ถูกต้อง",
      "คำนวณหาค่าแรงดันเฉลี่ย (Vdc), แรงดันประสิทธิผล (Vrms) และค่าระลอกคลื่น (Ripple Factor) ได้",
      "เปรียบเทียบข้อดีและข้อจำกัดระหว่างวงจรเรียงกระแสแบบแท็ปกลางและแบบบริดจ์ได้",
      "เลือกพิกัดอุปกรณ์ไดโอดและหม้อแปลงไฟฟ้าให้เหมาะสมกับการใช้งานจริงได้"
    ],
    formulas: [
      { name: "แรงดันเฉลี่ยครึ่งคลื่น (Half-Wave Vdc)", formula: "V_{dc} = \\frac{V_m}{\\pi} \\approx 0.318 V_m", note: "Vm คือแรงดันยอดของไฟสลับ" },
      { name: "แรงดันเฉลี่ยเต็มคลื่น (Full-Wave Vdc)", formula: "V_{dc} = \\frac{2V_m}{\\pi} \\approx 0.636 V_m", note: "ได้แรงดันเฉลี่ยเป็น 2 เท่าของแบบครึ่งคลื่น" },
      { name: "แรงดันย้อนกลับสูงสุด (PIV - Center Tapped)", formula: "PIV = 2V_m", note: "ไดโอดต้องทนแรงดันย้อนกลับได้ 2 เท่าของแรงดันยอด" },
      { name: "แรงดันย้อนกลับสูงสุด (PIV - Bridge)", formula: "PIV = V_m", note: "ไดโอดแต่ละตัวทนแรงดันย้อนกลับเพียง Vm" },
      { name: "ความถี่ริปเปิล (Ripple Frequency)", formula: "f_{r(half)} = f_{in},\\quad f_{r(full)} = 2f_{in}", note: "ไฟบ้าน 50Hz เต็มคลื่นจะได้ริปเปิล 100Hz" }
    ],
    contentHtml: `
      <section class="mb-8">
        <h3 class="text-xl font-bold text-sky-400 mb-3 flex items-center gap-2">
          <span class="w-2 h-6 bg-sky-500 rounded-full inline-block"></span>
          1. บทนำและหลักการเรียงกระแส (Rectification Principle)
        </h3>
        <p class="text-slate-300 leading-relaxed mb-4">
          ไฟฟ้าที่ส่งมาจากโรงไฟฟ้าตามบ้านเรือนและโรงงานอุตสาหกรรมเป็น <strong>ไฟฟ้ากระแสสลับ (AC) 220V 50Hz</strong> แต่อุปกรณ์อิเล็กทรอนิกส์ส่วนใหญ่ เช่น คอมพิวเตอร์ ระบบควบคุม PLC วงจรออปแอมป์ และมอเตอร์กระแสตรง ต้องการพลังงานจาก <strong>ไฟฟ้ากระแสตรง (DC)</strong> ที่มีขั้วบวกและลบแน่นอน ดังนั้น วงจรเรียงกระแส (Rectifier Circuit) จึงเป็นด่านแรกที่สำคัญที่สุดในการแปลงไฟสลับให้เป็นไฟตรง
        </p>

        <!-- SVG Diagram: Half-wave vs Full-wave -->
        <div class="my-6 bg-slate-900/90 border border-slate-700/80 rounded-xl p-4 shadow-xl">
          <div class="text-center font-semibold text-sky-300 mb-3 text-sm tracking-wide">แผนภาพเปรียบเทียบรูปคลื่นแรงดันอินพุตและเอาต์พุตของการเรียงกระแส</div>
          <svg class="w-full max-w-2xl mx-auto h-48" viewBox="0 0 600 200" xmlns="http://www.w3.org/2000/svg">
            <!-- Grid Lines -->
            <line x1="40" y1="90" x2="560" y2="90" stroke="#334155" stroke-dasharray="3,3" />
            <line x1="40" y1="10" x2="40" y2="170" stroke="#475569" stroke-width="2" />
            <line x1="40" y1="90" x2="570" y2="90" stroke="#475569" stroke-width="2" />
            <text x="575" y="94" fill="#94a3b8" font-size="12">t</text>
            <text x="25" y="20" fill="#94a3b8" font-size="12">v(t)</text>
            
            <!-- AC Wave (Gray/Faint) -->
            <path d="M 40 90 Q 100 10 160 90 T 280 90 T 400 90 T 520 90" fill="none" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4,4" />
            <text x="200" y="28" fill="#94a3b8" font-size="11">AC Input (Sine)</text>
            
            <!-- Full-Wave Output (Cyan) -->
            <path d="M 40 90 Q 100 10 160 90 Q 220 10 280 90 Q 340 10 400 90 Q 460 10 520 90" fill="none" stroke="#06b6d4" stroke-width="3" />
            <text x="370" y="28" fill="#06b6d4" font-weight="bold" font-size="11">Full-Wave Output (Vdc = 0.636 Vm)</text>
            
            <!-- Markers -->
            <circle cx="100" cy="10" r="4" fill="#38bdf8" />
            <text x="95" y="8" fill="#38bdf8" font-size="11" text-anchor="end">+Vm</text>
            <circle cx="220" cy="170" r="3" fill="#64748b" />
            <text x="215" y="185" fill="#64748b" font-size="11" text-anchor="end">-Vm</text>
            <text x="160" y="108" fill="#94a3b8" font-size="11">π (180°)</text>
            <text x="280" y="108" fill="#94a3b8" font-size="11">2π (360°)</text>
          </svg>
        </div>
      </section>

      <section class="mb-8">
        <h3 class="text-xl font-bold text-sky-400 mb-3 flex items-center gap-2">
          <span class="w-2 h-6 bg-sky-500 rounded-full inline-block"></span>
          2. วงจรเรียงกระแสแบบครึ่งคลื่น (Single-Phase Half-Wave Rectifier)
        </h3>
        <p class="text-slate-300 leading-relaxed mb-3">
          ประกอบด้วยหม้อแปลงไฟฟ้า ไดโอด 1 ตัว และโหลด (R):
        </p>
        <ul class="list-disc list-inside space-y-2 text-slate-300 pl-2 mb-4">
          <li><strong>ช่วงครึ่งไซเคิลบวก (0 ถึง π):</strong> ขั้วบนของหม้อแปลงเป็นบวก ขั้วล่างเป็นลบ ไดโอดได้รับไบแอสตรง (Forward Bias) นำกระแสไฟฟ้า กระแสไหลผ่านโหลด เกิดแรงดันตกคร่อมโหลดตามรูปคลื่นอินพุต</li>
          <li><strong>ช่วงครึ่งไซเคิลลบ (π ถึง 2π):</strong> ขั้วบนเป็นลบ ขั้วล่างเป็นบวก ไดโอดได้รับไบแอสกลับ (Reverse Bias) หยุดนำกระแส แรงดันตกคร่อมโหลดมีค่าเป็นศูนย์ (0V)</li>
        </ul>
        <div class="p-4 bg-sky-950/40 border border-sky-800/60 rounded-lg text-sm text-sky-200">
          <strong>ค่าสำคัญที่ต้องจดจำ:</strong>
          <br>• แรงดันเฉลี่ย: \(V_{dc} = \frac{V_m}{\pi} = 0.318 \times V_m\)
          <br>• แรงดันยังผล: \(V_{rms} = \frac{V_m}{2} = 0.5 \times V_m\)
          <br>• ประสิทธิภาพสูงสุด: \(\eta_{max} = 40.6\%\)
          <br>• แรงดันย้อนกลับสูงสุดที่ไดโอดต้องทน: \(PIV = V_m\)
        </div>
      </section>

      <section class="mb-8">
        <h3 class="text-xl font-bold text-sky-400 mb-3 flex items-center gap-2">
          <span class="w-2 h-6 bg-sky-500 rounded-full inline-block"></span>
          3. วงจรเรียงกระแสแบบเต็มคลื่น (Full-Wave Rectifier)
        </h3>
        <p class="text-slate-300 leading-relaxed mb-4">
          วงจรเต็มคลื่นสามารถนำกระแสทั้งในครึ่งไซเคิลบวกและลบมาใช้งาน ทำให้ได้แรงดันเฉลี่ยสูงขึ้นและมีริปเปิลน้อยลง โดยแบ่งออกเป็น 2 แบบหลัก:
        </p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
          <div class="p-4 bg-slate-900 border border-slate-700 rounded-xl">
            <h4 class="font-bold text-amber-400 mb-2">1) แบบมีแท็ปกลาง (Center-Tapped)</h4>
            <p class="text-xs text-slate-300 leading-relaxed mb-2">
              ใช้ไดโอด 2 ตัว ร่วมกับหม้อแปลงที่มีจุดกึ่งกลาง (Center Tap) ต่อเป็นกราวด์อ้างอิง ไดโอด D1 และ D2 สลับกันนำกระแสคนละไซเคิล
            </p>
            <ul class="text-xs text-slate-300 space-y-1">
              <li>• ใช้ไดโอดเพียง 2 ตัว</li>
              <li>• <strong>ข้อควรระวัง:</strong> PIV ของไดโอดสูงถึง \(2V_m\)</li>
              <li>• หม้อแปลงมีราคาสูงเพราะต้องสั่งทำแท็ปกลาง</li>
            </ul>
          </div>

          <div class="p-4 bg-slate-900 border border-slate-700 rounded-xl">
            <h4 class="font-bold text-emerald-400 mb-2">2) แบบบริดจ์ (Bridge Rectifier)</h4>
            <p class="text-xs text-slate-300 leading-relaxed mb-2">
              ใช้ไดโอด 4 ตัว ต่อเป็นสะพานบริดจ์ ไม่ต้องใช้หม้อแปลงแท็ปกลาง ไดโอดจะทำงานพร้อมกันเป็นคู่ (D1-D2 ในครึ่งบวก, D3-D4 ในครึ่งลบ)
            </p>
            <ul class="text-xs text-slate-300 space-y-1">
              <li>• ค่า \(PIV = V_m\) (ต่ำกว่าแบบแท็ปกลางครึ่งหนึ่ง)</li>
              <li>• ใช้หม้อแปลง 2 สายธรรมดาที่มีราคาถูกกว่า</li>
              <li>• แรงดันตกคร่อมไดโอดขณะนำกระแสคือ \(2 \times 0.7V = 1.4V\)</li>
            </ul>
          </div>
        </div>
      </section>

      <section class="mb-8">
        <h3 class="text-xl font-bold text-sky-400 mb-3 flex items-center gap-2">
          <span class="w-2 h-6 bg-sky-500 rounded-full inline-block"></span>
          4. ตัวอย่างการคำนวณในงานจริง
        </h3>
        <div class="bg-slate-900/80 border border-amber-500/30 rounded-xl p-5 shadow-lg">
          <h4 class="text-amber-300 font-semibold mb-2">โจทย์ตัวอย่าง:</h4>
          <p class="text-slate-300 text-sm mb-3">
            หม้อแปลงไฟฟ้าจ่ายแรงดันด้านทุติยภูมิ \(24\,V_{rms}\) ความถี่ \(50\,Hz\) ป้อนเข้าสู่วงจรเรียงกระแสแบบบริดจ์ ต่อเข้ากับโหลดตัวต้านทาน \(R_L = 100\,\Omega\) (กำหนดให้ไดโอดมีแรงดันตกคร่อม \(0.7\,V\) ต่อตัว)
            <br>จงหา: (1) แรงดันยอด \(V_m\) (2) แรงดันเฉลี่ยที่โหลด \(V_{dc}\) (3) ความถี่ริปเปิล \(f_r\)
          </p>
          <div class="border-t border-slate-700 pt-3 text-sm text-slate-300 space-y-2">
            <div><strong>วิธีทำ:</strong></div>
            <div>(1) คำนวณแรงดันยอด \(V_m\):
              <div class="pl-4 text-sky-300">\(V_m = \sqrt{2} \times V_{rms} = 1.414 \times 24\,V \approx 33.94\,V\)</div>
            </div>
            <div>(2) หักลบแรงดันตกคร่อมไดโอด 2 ตัว (\(2 \times 0.7 = 1.4\,V\)):
              <div class="pl-4 text-sky-300">\(V_{m(load)} = 33.94 - 1.4 = 32.54\,V\)</div>
              <div class="pl-4 text-sky-300">\(V_{dc} = \frac{2 \times V_{m(load)}}{\pi} = \frac{2 \times 32.54}{3.1416} \approx 20.72\,V\)</div>
            </div>
            <div>(3) ความถี่ระลอกคลื่น (Ripple Frequency):
              <div class="pl-4 text-sky-300">\(f_r = 2 \times f_{in} = 2 \times 50\,Hz = 100\,Hz\)</div>
            </div>
          </div>
        </div>
      </section>
    `
  },
  {
    id: 2,
    title: "วงจรแหล่งจ่ายไฟฟ้ากระแสตรงควบคุมได้และควบคุมไม่ได้",
    enTitle: "Controlled and Uncontrolled DC Power Supply",
    icon: "sliders",
    badge: "หน่วยที่ 2",
    summary: "ศึกษาความแตกต่างระหว่างไดโอด (Uncontrolled) และ SCR (Controlled Rectifier) การควบคุมมุมจุดชนวน (Firing Angle: α) การคำนวณแรงดันเฉลี่ย Vdc ตามมุมจุดชนวน วงจร Semi-converter และ Full-converter",
    objectives: [
      "เปรียบเทียบข้อแตกต่างระหว่างไดโอดและ SCR ได้อย่างถูกต้อง",
      "อธิบายความหมายของมุมจุดชนวน (Firing Angle: α) และมุมนำกระแส (Conduction Angle: θ) ได้",
      "คำนวณแรงดันเฉลี่ย Vdc เมื่อปรับมุมจุดชนวนที่โหลดความต้านทานและโหลดเหนี่ยวนำได้",
      "อธิบายหน้าที่ของไดโอดลัดวงจรย้อนกลับ (Freewheeling Diode) ได้"
    ],
    formulas: [
      { name: "แรงดันเฉลี่ยครึ่งคลื่นควบคุมได้ (1-Phase Half-Wave SCR)", formula: "V_{dc} = \\frac{V_m}{2\\pi}(1 + \\cos\\alpha)", note: "เมื่อ α คือมุมจุดชนวน (0° ถึง 180°)" },
      { name: "แรงดันเฉลี่ยเต็มคลื่นควบคุมได้ (1-Phase Full-Wave SCR - R Load)", formula: "V_{dc} = \\frac{V_m}{\\pi}(1 + \\cos\\alpha)", note: "โหลด R กระแสหยุดเมื่อแรงดันเป็นศูนย์" },
      { name: "แรงดันเฉลี่ยเต็มคลื่นกระแสต่อเนื่อง (Full Converter - RL Load)", formula: "V_{dc} = \\frac{2V_m}{\\pi}\\cos\\alpha", note: "เมื่อกระแสไหลต่อเนื่อง (Continuous Conduction)" },
      { name: "มุมนำกระแส (Conduction Angle: θ)", formula: "\\theta = 180^\\circ - \\alpha", note: "ช่วงเวลาที่ SCR นำกระแสในแต่ละไซเคิล" }
    ],
    contentHtml: `
      <section class="mb-8">
        <h3 class="text-xl font-bold text-sky-400 mb-3 flex items-center gap-2">
          <span class="w-2 h-6 bg-sky-500 rounded-full inline-block"></span>
          1. ความแตกต่างระหว่าง Uncontrolled และ Controlled Rectifier
        </h3>
        <p class="text-slate-300 leading-relaxed mb-4">
          วงจรควบคุมไม่ได้ (Uncontrolled) ใช้ <strong>ไดโอด (Diode)</strong> เป็นตัวเรียงกระแส ซึ่งจะนำกระแสทันทีเมื่อแรงดันขั้วแอโนดเป็นบวกมากกว่าแคโทด (ไบแอสตรง) ไม่สามารถปรับเปลี่ยนระดับแรงดันเฉลี่ยที่เอาต์พุตได้ตามใจชอบ
          <br><br>
          ในทางตรงกันข้าม วงจรควบคุมได้ (Controlled) จะเปลี่ยนมาใช้ <strong>SCR (Silicon Controlled Rectifier)</strong> หรือไทริสเตอร์ โดยแม้ว่าขั้วแอโนดจะเป็นบวกแล้ว แต่ SCR จะยังไม่นำกระแสจนกว่าจะมีสัญญาณพัลส์แรงดันบวกกระตุ้นเข้าที่ <strong>ขั้วเกต (Gate)</strong> ทำให้เราสามารถหน่วงเวลาหรือเลือกจังหวะการนำกระแสได้ตามต้องการ
        </p>

        <!-- Waveform Simulation SVG -->
        <div class="my-6 bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-xl">
          <div class="text-center font-semibold text-sky-300 mb-2 text-sm">รูปคลื่นแรงดันเอาต์พุตของ SCR เมื่อถูกทริกเกอร์ที่มุม α = 60°</div>
          <svg class="w-full max-w-2xl mx-auto h-44" viewBox="0 0 600 180" xmlns="http://www.w3.org/2000/svg">
            <line x1="40" y1="90" x2="560" y2="90" stroke="#475569" stroke-width="2" />
            <line x1="40" y1="10" x2="40" y2="160" stroke="#475569" stroke-width="2" />
            
            <!-- AC reference -->
            <path d="M 40 90 Q 95 10 150 90 T 260 90 T 370 90 T 480 90" fill="none" stroke="#64748b" stroke-dasharray="3,3" />
            
            <!-- Cut waveform for SCR alpha = 60 deg -->
            <!-- Half 1: flat from 40 to 76 (alpha=60), then curve from 76 to 150 -->
            <path d="M 40 90 L 77 90 L 77 22 Q 113 30 150 90 L 260 90 L 297 90 L 297 22 Q 333 30 370 90 L 480 90" fill="rgba(6, 182, 212, 0.15)" stroke="#06b6d4" stroke-width="2.5" />
            
            <!-- Trigger Pulse Indicators -->
            <line x1="77" y1="90" x2="77" y2="20" stroke="#f59e0b" stroke-width="2" stroke-dasharray="2,2" />
            <polygon points="74,25 80,25 77,15" fill="#f59e0b" />
            <text x="82" y="35" fill="#f59e0b" font-size="11" font-weight="bold">Gate Pulse (α = 60°)</text>
            
            <line x1="297" y1="90" x2="297" y2="20" stroke="#f59e0b" stroke-width="2" stroke-dasharray="2,2" />
            <polygon points="294,25 300,25 297,15" fill="#f59e0b" />
            <text x="302" y="35" fill="#f59e0b" font-size="11" font-weight="bold">Gate Pulse (180°+α)</text>
            
            <text x="110" y="125" fill="#38bdf8" font-size="11">มุมนำกระแส θ = 120°</text>
          </svg>
        </div>
      </section>

      <section class="mb-8">
        <h3 class="text-xl font-bold text-sky-400 mb-3 flex items-center gap-2">
          <span class="w-2 h-6 bg-sky-500 rounded-full inline-block"></span>
          2. เงื่อนไขและคุณลักษณะการทำงานของ SCR
        </h3>
        <p class="text-slate-300 leading-relaxed mb-3">
          การทำให้ SCR เริ่มนำกระแส (Turn-On) และการหยุดนำกระแส (Turn-Off) มีหลักการเฉพาะทางดังนี้:
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="p-4 bg-slate-900 border border-slate-700/80 rounded-lg">
            <h4 class="font-semibold text-emerald-400 mb-2">การเปิดนำกระแส (Turn-ON)</h4>
            <ul class="text-xs text-slate-300 space-y-1.5">
              <li>1. ขั้วแอโนด (A) ต้องเป็นบวกเมื่อเทียบกับแคโทด (K)</li>
              <li>2. มีพัลส์กระแสบวกป้อนเข้าขาเกต (Gate Current \(I_G\))</li>
              <li>3. กระแสแอโนดต้องสูงเกินกว่า <strong>กระแสล็อค (Latching Current : \(I_L\))</strong> ก่อนที่สัญญาณเกตจะตัดหายไป</li>
            </ul>
          </div>
          <div class="p-4 bg-slate-900 border border-slate-700/80 rounded-lg">
            <h4 class="font-semibold text-rose-400 mb-2">การปิดหรือหยุดนำกระแส (Turn-OFF)</h4>
            <ul class="text-xs text-slate-300 space-y-1.5">
              <li>1. สัญญาณเกต<strong>ไม่สามารถ</strong>สั่งให้ SCR ดับลงได้ (เมื่อติดแล้ว เกตจะหมดอำนาจควบคุม)</li>
              <li>2. ต้องทำให้กระแสแอโนดลดลงต่ำกว่า <strong>กระแสยึดเหนี่ยว (Holding Current : \(I_H\))</strong></li>
              <li>3. ในระบบไฟสลับ SCR จะดับเองตามธรรมชาติเมื่อแรงดันผ่านจุดศูนย์ (Natural / Line Commutation)</li>
            </ul>
          </div>
        </div>
      </section>

      <section class="mb-8">
        <h3 class="text-xl font-bold text-sky-400 mb-3 flex items-center gap-2">
          <span class="w-2 h-6 bg-sky-500 rounded-full inline-block"></span>
          3. หน้าที่ของฟรีวีลลิงไดโอด (Freewheeling Diode)
        </h3>
        <p class="text-slate-300 leading-relaxed mb-3">
          เมื่อโหลดเป็นขดลวดเหนี่ยวนำ เช่น มอเตอร์ไฟฟ้ากระแสตรง (DC Motor) หรือโซลินอยด์ เมื่อแรงดันไฟฟ้าสลับข้ามเข้าสู่ซีกไฟลบ ขดลวดจะคายพลังงานสนามแม่เหล็กออกมา ทำให้เกิดแรงดันเหนี่ยวนำย้อนกลับ (Back EMF) ส่งผลให้ SCR ยังคงนำกระแสต่อไปแม้แรงดันอินพุตจะติดลบ ทำให้แรงดันเฉลี่ย \(V_{dc}\) ลดลง
        </p>
        <div class="p-4 bg-amber-950/30 border border-amber-600/40 rounded-lg text-sm text-amber-200">
          <strong>ประโยชน์ของการต่อไดโอด Freewheeling ขนานกลับขั้วกับโหลด:</strong>
          <ul class="list-disc list-inside mt-2 space-y-1 text-slate-300">
            <li>ป้องกันไม่ให้แรงดันตกคร่อมโหลดติดลบในช่วงไซเคิลลบ</li>
            <li>ช่วยให้กระแสโหลดไหลวนและราบเรียบอย่างต่อเนื่อง</li>
            <li>ช่วยตัดกระแสให้ SCR ดับลงตามธรรมชาติอย่างสมบูรณ์เมื่อสิ้นสุดไซเคิลบวก</li>
          </ul>
        </div>
      </section>
    `
  },
  {
    id: 3,
    title: "วงจรแหล่งจ่ายไฟฟ้ากระแสสลับแบบปรับแรงดันไฟฟ้าได้",
    enTitle: "AC Voltage Controller (AC Regulators)",
    icon: "zap",
    badge: "หน่วยที่ 3",
    summary: "ศึกษาการควบคุมแรงดันไฟฟ้ากระแสสลับ (AC-to-AC) โดยยังคงความถี่เดิม การควบคุมมุมเฟส (Phase Control) ด้วย TRIAC และ DIAC การควบคุมแบบเปิดปิดรอบคลื่น (Integral Cycle Control) สำหรับโหลดความร้อน",
    objectives: [
      "อธิบายหลักการทำงานของวงจรควบคุมแรงดันไฟฟ้ากระแสสลับได้",
      "อธิบายคุณลักษณะและการทำงานของ TRIAC และ DIAC ในวงจรควบคุมแรงดันได้",
      "เปรียบเทียบข้อดีและข้อเสียของการควบคุมแบบมุมเฟสกับการควบคุมแบบรอบคลื่นได้",
      "เข้าใจปัญหาฮาร์มอนิกส์และวงจรเสนับเบอร์ (Snubber Circuit) ในระบบไฟฟ้ากำลัง"
    ],
    formulas: [
      { name: "แรงดันประสิทธิผลที่โหลด (Vrms - Full-Wave Phase Control)", formula: "V_{rms} = V_s \\sqrt{1 - \\frac{\\alpha}{\\pi} + \\frac{\\sin(2\\alpha)}{2\\pi}}", note: "เมื่อ α เป็นเรเดียน, Vs คือแรงดันอินพุต RMS" },
      { name: "มุมเฟส α = 0°", formula: "V_{rms} = V_s", note: "จ่ายแรงดันเต็มรูปคลื่น" },
      { name: "มุมเฟส α = 90° (π/2)", formula: "V_{rms} = \\frac{V_s}{\\sqrt{2}} \\approx 0.707 V_s", note: "กำลังงานลดลงเหลือครึ่งหนึ่ง (50%)" }
    ],
    contentHtml: `
      <section class="mb-8">
        <h3 class="text-xl font-bold text-sky-400 mb-3 flex items-center gap-2">
          <span class="w-2 h-6 bg-sky-500 rounded-full inline-block"></span>
          1. หลักการทำงานของ AC Voltage Controller
        </h3>
        <p class="text-slate-300 leading-relaxed mb-4">
          วงจรควบคุมแรงดันไฟฟ้ากระแสสลับ (AC Voltage Controller) ทำหน้าที่ปรับเปลี่ยนขนาดของแรงดันประสิทธิผล (RMS Voltage) ที่จ่ายให้กับโหลด โดยที่ <strong>ความถี่ของแหล่งจ่ายยังคงที่เท่าเดิม</strong> นิยมใช้งานอย่างกว้างขวางในระบบควบคุมความร้อนของฮีตเตอร์ในโรงงาน ระบบควบคุมความเร็วมอเตอร์สากล และสวิตช์หรี่ไฟตามบ้าน
        </p>

        <!-- TRIAC & DIAC Symbol Graphic -->
        <div class="my-6 bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-xl text-center">
          <div class="text-sky-300 font-semibold mb-3 text-sm">สัญลักษณ์และโครงสร้างวงจรควบคุมมุมเฟสด้วย TRIAC และ DIAC</div>
          <svg class="w-full max-w-lg mx-auto h-40" viewBox="0 0 500 150" xmlns="http://www.w3.org/2000/svg">
            <!-- AC Source -->
            <circle cx="60" cy="75" r="22" fill="none" stroke="#38bdf8" stroke-width="2" />
            <path d="M 50 75 Q 55 65 60 75 T 70 75" fill="none" stroke="#38bdf8" stroke-width="2" />
            <text x="60" y="115" fill="#94a3b8" font-size="11" text-anchor="middle">220VAC</text>
            
            <line x1="82" y1="75" x2="160" y2="75" stroke="#94a3b8" stroke-width="2" />
            
            <!-- Load Resistor -->
            <rect x="160" y="65" width="60" height="20" fill="#1e293b" stroke="#f59e0b" stroke-width="2" />
            <text x="190" y="79" fill="#f59e0b" font-size="11" text-anchor="middle" font-weight="bold">LOAD</text>
            
            <line x1="220" y1="75" x2="310" y2="75" stroke="#94a3b8" stroke-width="2" />
            
            <!-- TRIAC Symbol -->
            <polygon points="310,60 310,90 330,75" fill="#06b6d4" />
            <polygon points="330,60 330,90 310,75" fill="#06b6d4" />
            <line x1="310" y1="60" x2="310" y2="90" stroke="#06b6d4" stroke-width="2" />
            <line x1="330" y1="60" x2="330" y2="90" stroke="#06b6d4" stroke-width="2" />
            <!-- Gate -->
            <line x1="320" y1="83" x2="320" y2="120" stroke="#06b6d4" stroke-width="2" />
            <line x1="320" y1="120" x2="270" y2="120" stroke="#06b6d4" stroke-width="2" />
            
            <!-- DIAC Symbol -->
            <polygon points="250,110 250,130 265,120" fill="#a855f7" />
            <polygon points="265,110 265,130 250,120" fill="#a855f7" />
            <text x="257" y="145" fill="#a855f7" font-size="10" text-anchor="middle">DIAC</text>
            
            <!-- Return line -->
            <line x1="330" y1="75" x2="420" y2="75" stroke="#94a3b8" stroke-width="2" />
            <line x1="420" y1="75" x2="420" y2="135" stroke="#94a3b8" stroke-width="2" />
            <line x1="420" y1="135" x2="60" y2="135" stroke="#94a3b8" stroke-width="2" />
            <line x1="60" y1="135" x2="60" y2="97" stroke="#94a3b8" stroke-width="2" />
            
            <text x="320" y="52" fill="#06b6d4" font-weight="bold" font-size="12" text-anchor="middle">TRIAC</text>
            <text x="300" y="65" fill="#94a3b8" font-size="10">MT1</text>
            <text x="345" y="65" fill="#94a3b8" font-size="10">MT2</text>
          </svg>
        </div>
      </section>

      <section class="mb-8">
        <h3 class="text-xl font-bold text-sky-400 mb-3 flex items-center gap-2">
          <span class="w-2 h-6 bg-sky-500 rounded-full inline-block"></span>
          2. สองวิธีการควบคุมหลักในงานอุตสาหกรรม
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="p-4 bg-slate-900 border border-slate-700 rounded-xl">
            <h4 class="font-bold text-sky-400 mb-2">1. การควบคุมมุมเฟส (Phase Angle Control)</h4>
            <p class="text-xs text-slate-300 leading-relaxed mb-2">
              ทำการตัดคลื่นรูปไซน์ในแต่ละครึ่งไซเคิลด้วยมุมหน่วง α ควบคุมกำลังงานได้อย่างละเอียด ต่อเนื่องและรวดเร็ว
            </p>
            <div class="text-xs text-amber-300">
              <strong>ข้อเสีย:</strong> ก่อให้เกิดสัญญาณรบกวนคลื่นแม่เหล็กไฟฟ้า (EMI) และฮาร์มอนิกส์สูงมาก ต้องต่อวงจรฟิลเตอร์กรองสัญญาณรบกวนเสมอ
            </div>
          </div>
          <div class="p-4 bg-slate-900 border border-slate-700 rounded-xl">
            <h4 class="font-bold text-emerald-400 mb-2">2. การควบคุมแบบรอบคลื่น (Integral Cycle / On-Off)</h4>
            <p class="text-xs text-slate-300 leading-relaxed mb-2">
              ปล่อยให้คลื่นรูปไซน์ไหลผ่านเต็มลูกเป็นเวลาหลายๆ ไซเคิล (On-time) แล้วสั่งปิดเป็นเวลาหลายๆ ไซเคิล (Off-time) สลับกันไป
            </p>
            <div class="text-xs text-emerald-300">
              <strong>ข้อดี:</strong> การเปิดปิดเกิดขึ้นที่จุดตัดศูนย์ (Zero Crossing) จึงแทบไม่มีสัญญาณรบกวน EMI เลย เหมาะมากกับเตาหลอมและฮีตเตอร์
            </div>
          </div>
        </div>
      </section>
    `
  },
  {
    id: 4,
    title: "วงจรแหล่งจ่ายไฟฟ้าแบบเชิงเส้นและแบบสวิตชิง",
    enTitle: "Linear and Switching Power Supplies (SMPS)",
    icon: "cpu",
    badge: "หน่วยที่ 4",
    summary: "ศึกษาเปรียบเทียบแหล่งจ่ายไฟเชิงเส้น (Linear Regulator) เช่น ตระกูล 78xx, 79xx, LM317 กับแหล่งจ่ายไฟแบบสวิตชิ่ง (Switched-Mode Power Supply : SMPS) ประสิทธิภาพ ขนาด น้ำหนัก และการรบกวนทางแม่เหล็กไฟฟ้า",
    objectives: [
      "อธิบายหลักการทำงานและข้อแตกต่างของ Linear Power Supply และ SMPS ได้",
      "คำนวณกำลังงานสูญเสีย (Power Loss) และประสิทธิภาพของ Linear Regulator ได้",
      "อธิบายหน้าที่ของหม้อแปลงความถี่สูงและอุปกรณ์สวิตชิ่งในวงจร SMPS ได้",
      "เลือกใช้แหล่งจ่ายไฟให้เหมาะสมกับลักษณะงานอิเล็กทรอนิกส์แต่ละประเภทได้"
    ],
    formulas: [
      { name: "กำลังงานสูญเสียในเชิงเส้น (Linear Power Loss)", formula: "P_{loss} = (V_{in} - V_{out}) \\times I_{load}", note: "เปลี่ยนแรงดันส่วนเกินเป็นพลังงานความร้อน" },
      { name: "ประสิทธิภาพ (Efficiency: η)", formula: "\\eta = \\frac{P_{out}}{P_{in}} \\times 100\\% = \\frac{V_{out} \\times I_{load}}{V_{in} \\times I_{in}} \\times 100\\%", note: "Linear ได้ประมาณ 30-50% ส่วน SMPS ได้ 80-95%" },
      { name: "แรงดันเอาต์พุต LM317", formula: "V_{out} = 1.25V \\left(1 + \\frac{R_2}{R_1}\\right) + I_{adj} R_2", note: "ไอซีควบคุมแรงดันบวกแบบปรับค่าได้" }
    ],
    contentHtml: `
      <section class="mb-8">
        <h3 class="text-xl font-bold text-sky-400 mb-3 flex items-center gap-2">
          <span class="w-2 h-6 bg-sky-500 rounded-full inline-block"></span>
          1. การเปรียบเทียบเชิงลึก: Linear vs SMPS
        </h3>
        <p class="text-slate-300 leading-relaxed mb-4">
          แหล่งจ่ายไฟคือหัวใจสำคัญของอุปกรณ์ไฟฟ้าทุกชนิด ในอดีตแหล่งจ่ายไฟแบบเชิงเส้น (Linear Power Supply) เป็นที่นิยมมากเนื่องจากวงจรไม่ซับซ้อน แต่ปัจจุบันแทบทั้งหมดถูกแทนที่ด้วยแหล่งจ่ายไฟแบบสวิตชิ่ง (SMPS) ด้วยเหตุผลด้านขนาด น้ำหนัก และการประหยัดพลังงาน
        </p>

        <div class="overflow-x-auto my-4">
          <table class="w-full text-left text-xs text-slate-300 border border-slate-700 rounded-lg overflow-hidden">
            <thead class="bg-slate-800 text-sky-300 uppercase font-semibold">
              <tr>
                <th class="p-3 border-b border-slate-700">หัวข้อเปรียบเทียบ</th>
                <th class="p-3 border-b border-slate-700 text-amber-300">แบบเชิงเส้น (Linear)</th>
                <th class="p-3 border-b border-slate-700 text-emerald-300">แบบสวิตชิ่ง (SMPS)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800">
              <tr class="hover:bg-slate-800/40">
                <td class="p-3 font-medium text-slate-200">ประสิทธิภาพ (Efficiency)</td>
                <td class="p-3 text-rose-400">ต่ำ (30% - 50%) ร้อนจัด</td>
                <td class="p-3 text-emerald-400">สูงมาก (80% - 95%) เกิดความร้อนน้อย</td>
              </tr>
              <tr class="hover:bg-slate-800/40">
                <td class="p-3 font-medium text-slate-200">ขนาดและน้ำหนัก</td>
                <td class="p-3">ใหญ่และหนักมาก (ใช้หม้อแปลงเหล็ก 50Hz)</td>
                <td class="p-3">กะทัดรัด เบามาก (ใช้หม้อแปลงเฟอร์ไรต์ความถี่สูง)</td>
              </tr>
              <tr class="hover:bg-slate-800/40">
                <td class="p-3 font-medium text-slate-200">สัญญาณรบกวน (Noise & Ripple)</td>
                <td class="p-3 text-emerald-400">ต่ำมาก (Ultra-low noise, ระดับ microvolt)</td>
                <td class="p-3 text-rose-400">มีสัญญาณรบกวนสวิตชิ่งความถี่สูง (EMI)</td>
              </tr>
              <tr class="hover:bg-slate-800/40">
                <td class="p-3 font-medium text-slate-200">ความซับซ้อนของวงจร</td>
                <td class="p-3">เรียบง่าย อุปกรณ์น้อย ช่างซ่อมได้ง่าย</td>
                <td class="p-3">ซับซ้อน มีวงจร Feedback PWM และความปลอดภัยสูง</td>
              </tr>
              <tr class="hover:bg-slate-800/40">
                <td class="p-3 font-medium text-slate-200">การนำไปใช้งาน</td>
                <td class="p-3">เครื่องเสียงไฮเอนด์, เครื่องมือวัดความแม่นยำสูง</td>
                <td class="p-3">คอมพิวเตอร์, มือถือ, โทรทัศน์, หุ่นยนต์, เครื่องจักร</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="mb-8">
        <h3 class="text-xl font-bold text-sky-400 mb-3 flex items-center gap-2">
          <span class="w-2 h-6 bg-sky-500 rounded-full inline-block"></span>
          2. หลักการทำงานของ SMPS ที่ทำให้หม้อแปลงมีขนาดเล็ก
        </h3>
        <p class="text-slate-300 leading-relaxed mb-3">
          ตามสมการกฎการเหนี่ยวนำแม่เหล็กของฟาราเดย์ พื้นที่หน้าตัดของแกนหม้อแปลงไฟฟ้า (\(A_{core}\)) จะแปรผกผันกับความถี่ในการทำงาน:
        </p>
        <div class="p-3 bg-slate-900 border border-slate-700 rounded-lg text-center font-mono text-sky-300 text-sm mb-3">
          A_{core} \\propto \\frac{1}{f \\cdot B_{max}}
        </div>
        <p class="text-slate-300 leading-relaxed text-sm">
          หม้อแปลงแบบเดิมทำงานที่ความถี่ไฟบ้าน <strong>50 Hz</strong> จึงต้องใช้แกนเหล็กขนาดใหญ่และขดลวดหนาเตอะ แต่ใน SMPS ไฟฟ้าจะถูกแปลงเป็นไฟตรงก่อน แล้วใช้ทรานซิสเตอร์สวิตชิ่งสับสวิตช์ที่ความถี่สูงถึง <strong>50,000 Hz ถึง 500,000 Hz (50kHz - 500kHz)</strong> ส่งผลให้แกนหม้อแปลงเฟอร์ไรต์มีขนาดเล็กลงเหลือเพียงขนาดเท่าปลายนิ้วมือ และมีน้ำหนักเบาลงหลายเท่าตัว
        </p>
      </section>
    `
  },
  {
    id: 5,
    title: "วงจรทวีแรงดันไฟฟ้า",
    enTitle: "Voltage Multipliers",
    icon: "trending-up",
    badge: "หน่วยที่ 5",
    summary: "ศึกษาหลักการยกระดับแรงดันไฟตรงด้วยวงจรทวีแรงดัน (Voltage Doubler, Tripler, Quadrupler) โดยใช้ไดโอดและตัวเก็บประจุแบบคาสเคด (Cockcroft-Walton Cascade) การประยุกต์ใช้ในเครื่องดักแมลง หลอด CRT และเครื่องกำเนิดประจุไฟฟ้าสถิต",
    objectives: [
      "อธิบายหลักการประจุและเสริมแรงดันของตัวเก็บประจุในวงจรทวีแรงดันได้",
      "จำแนกวงจรทวีแรงดัน 2 เท่าแบบครึ่งคลื่นและแบบเต็มคลื่นได้",
      "คำนวณหาแรงดันเอาต์พุตและค่าพิกัดแรงดัน PIV ของไดโอดในวงจรได้",
      "วิเคราะห์ข้อจำกัดด้านการจ่ายกระแสและการตกของแรงดัน (Voltage Regulation) ได้"
    ],
    formulas: [
      { name: "แรงดันเอาต์พุตทวี 2 เท่า (Voltage Doubler)", formula: "V_{out} = 2V_m", note: "Vm คือแรงดันยอดของไฟสลับอินพุต" },
      { name: "แรงดันเอาต์พุตทวี 3 เท่า (Voltage Tripler)", formula: "V_{out} = 3V_m", note: "วัดเทียบกับขั้วอ้างอิง" },
      { name: "แรงดันเอาต์พุตทวี 4 เท่า (Voltage Quadrupler)", formula: "V_{out} = 4V_m", note: "ต่อไดโอดและคาปาซิเตอร์ 4 คู่" },
      { name: "พิกัดทนแรงดันของไดโอดและคาปาซิเตอร์", formula: "PIV \\ge 2V_m,\\quad V_{cap} \\ge 2V_m", note: "ยกเว้น C1 ตัวแรกในแบบครึ่งคลื่นที่รับ Vm" }
    ],
    contentHtml: `
      <section class="mb-8">
        <h3 class="text-xl font-bold text-sky-400 mb-3 flex items-center gap-2">
          <span class="w-2 h-6 bg-sky-500 rounded-full inline-block"></span>
          1. บทนำและหลักการพื้นฐาน
        </h3>
        <p class="text-slate-300 leading-relaxed mb-4">
          วงจรทวีแรงดันไฟฟ้า (Voltage Multiplier) คือวงจรเรียงกระแสชนิดพิเศษที่สามารถผลิตแรงดันไฟฟ้ากระแสตรง (DC) เอาต์พุตสูงเป็นจำนวนเท่า (2 เท่า, 3 เท่า, 4 เท่า หรือมากกว่า) ของแรงดันยอดอินพุต (\(V_m\)) โดย <strong>ไม่ต้องใช้หม้อแปลงแรงดันสูง (Step-up Transformer)</strong> ที่มีขนาดใหญ่ หนัก และเสี่ยงต่อการเกิดอาร์กไฟฟ้า
        </p>

        <!-- Multiplier SVG Diagram -->
        <div class="my-6 bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-xl text-center">
          <div class="text-sky-300 font-semibold mb-3 text-sm">วงจรทวีแรงดัน 2 เท่าแบบครึ่งคลื่น (Half-Wave Voltage Doubler)</div>
          <svg class="w-full max-w-lg mx-auto h-40" viewBox="0 0 500 150" xmlns="http://www.w3.org/2000/svg">
            <!-- AC Source -->
            <circle cx="60" cy="75" r="20" fill="none" stroke="#38bdf8" stroke-width="2" />
            <path d="M 50 75 Q 55 65 60 75 T 70 75" fill="none" stroke="#38bdf8" stroke-width="2" />
            <text x="60" y="115" fill="#94a3b8" font-size="11" text-anchor="middle">Vs (Vm)</text>
            
            <!-- C1 -->
            <line x1="80" y1="50" x2="160" y2="50" stroke="#94a3b8" stroke-width="2" />
            <line x1="160" y1="40" x2="160" y2="60" stroke="#06b6d4" stroke-width="3" />
            <line x1="170" y1="40" x2="170" y2="60" stroke="#06b6d4" stroke-width="3" />
            <text x="165" y="32" fill="#06b6d4" font-size="11" text-anchor="middle">C1 (ชาร์จ Vm)</text>
            
            <!-- Junction to D1 -->
            <line x1="170" y1="50" x2="250" y2="50" stroke="#94a3b8" stroke-width="2" />
            
            <!-- D1 pointing down -->
            <line x1="250" y1="50" x2="250" y2="70" stroke="#94a3b8" stroke-width="2" />
            <polygon points="240,70 260,70 250,85" fill="#f59e0b" />
            <line x1="240" y1="85" x2="260" y2="85" stroke="#f59e0b" stroke-width="2" />
            <line x1="250" y1="85" x2="250" y2="110" stroke="#94a3b8" stroke-width="2" />
            <text x="275" y="80" fill="#f59e0b" font-size="11">D1</text>
            
            <!-- D2 pointing right -->
            <line x1="250" y1="50" x2="310" y2="50" stroke="#94a3b8" stroke-width="2" />
            <polygon points="310,40 310,60 325,50" fill="#10b981" />
            <line x1="325" y1="40" x2="325" y2="60" stroke="#10b981" stroke-width="2" />
            <line x1="325" y1="50" x2="390" y2="50" stroke="#94a3b8" stroke-width="2" />
            <text x="318" y="35" fill="#10b981" font-size="11">D2</text>
            
            <!-- C2 parallel to output -->
            <line x1="390" y1="50" x2="390" y2="70" stroke="#94a3b8" stroke-width="2" />
            <line x1="380" y1="70" x2="400" y2="70" stroke="#06b6d4" stroke-width="3" />
            <line x1="380" y1="80" x2="400" y2="80" stroke="#06b6d4" stroke-width="3" />
            <line x1="390" y1="80" x2="390" y2="110" stroke="#94a3b8" stroke-width="2" />
            <text x="425" y="78" fill="#06b6d4" font-size="11">C2 (2Vm)</text>
            
            <!-- Common Ground Line -->
            <line x1="80" y1="100" x2="80" y2="110" stroke="#94a3b8" stroke-width="2" />
            <line x1="80" y1="110" x2="440" y2="110" stroke="#94a3b8" stroke-width="2" />
            <line x1="390" y1="50" x2="440" y2="50" stroke="#94a3b8" stroke-width="2" />
            
            <!-- Output Marker -->
            <circle cx="440" cy="50" r="4" fill="#38bdf8" />
            <circle cx="440" cy="110" r="4" fill="#38bdf8" />
            <text x="460" y="85" fill="#38bdf8" font-weight="bold" font-size="13">Vout = 2Vm</text>
          </svg>
        </div>
      </section>

      <section class="mb-8">
        <h3 class="text-xl font-bold text-sky-400 mb-3 flex items-center gap-2">
          <span class="w-2 h-6 bg-sky-500 rounded-full inline-block"></span>
          2. การทำงานในแต่ละไซเคิล
        </h3>
        <ul class="list-disc list-inside space-y-2 text-slate-300 text-sm pl-2">
          <li><strong>ครึ่งไซเคิลลบ:</strong> ไดโอด D1 ได้รับไบแอสตรง นำกระแสชาร์จประจุเข้าตัวเก็บประจุ C1 จนเต็มถึงค่าแรงดันยอด \(V_m\) โดยมีขั้วบวกอยู่ฝั่งขวา</li>
          <li><strong>ครึ่งไซเคิลบวก:</strong> ไดโอด D1 ได้รับไบแอสกลับหยุดทำงาน ขณะที่แรงดันจากแหล่งจ่าย (\(V_m\)) จะต่ออนุกรมเสริมขั้วกับแรงดันที่สะสมใน C1 (\(V_m\)) รวมเป็น \(2V_m\) ส่งผ่านไดโอด D2 เข้าไปชาร์จให้กับตัวเก็บประจุ C2 ทำให้เกิดแรงดันตกคร่อมที่เอาต์พุตเท่ากับ \(2V_m\)</li>
        </ul>
        <div class="mt-4 p-4 bg-rose-950/30 border border-rose-700/50 rounded-xl text-rose-200 text-xs leading-relaxed">
          <strong>ข้อจำกัดสำคัญ:</strong> วงจรทวีแรงดันจ่ายกระแสโหลดได้ต่ำมาก (ระดับ microampere ถึง milliampere) หากโหลดดึงกระแสมาก แรงดันจะตกฮวบลงอย่างรวดเร็ว จึงเหมาะเฉพาะงานไฟฟ้าสถิต เครื่องดักยุง หรือเครื่องจ่ายไฟหลอดรังสีเท่านั้น
        </div>
      </section>
    `
  },
  {
    id: 6,
    title: "วงจรอินเวอร์เตอร์",
    enTitle: "Inverters (DC to AC Converters)",
    icon: "repeat",
    badge: "หน่วยที่ 6",
    summary: "ศึกษาหลักการแปลงไฟฟ้ากระแสตรงเป็นไฟฟ้ากระแสสลับ รูปคลื่น Square wave, Modified Sine wave, Pure Sine wave โทโปโลยี Half-bridge และ Full-bridge (H-Bridge) เทคนิค SPWM และระบบโซลาร์เซลล์ On-Grid / Off-Grid",
    objectives: [
      "อธิบายหลักการแปลงพลังงานจากไฟตรงเป็นไฟสลับด้วยวงจรอินเวอร์เตอร์ได้",
      "เปรียบเทียบคุณภาพของรูปคลื่น Square, Modified Sine และ Pure Sine Wave ได้",
      "อธิบายการทำงานของวงจร H-Bridge และความสำคัญของช่วงเวลา Dead Time ได้",
      "เข้าใจเทคนิคการมอดูเลต Sinusoidal Pulse Width Modulation (SPWM) ได้"
    ],
    formulas: [
      { name: "แรงดันเอาต์พุต RMS ของ Full-Bridge (Square Wave)", formula: "V_{o,rms} = V_{dc}", note: "แรงดันยอดเท่ากับ Vdc" },
      { name: "แรงดันความถี่มูลฐาน (Fundamental Component - Square)", formula: "V_{1,rms} = \\frac{4 V_{dc}}{\\sqrt{2} \\pi} \\approx 0.90 V_{dc}", note: "ฮาร์มอนิกส์อันดับที่ 3, 5, 7 ปนอยู่สูงมาก" },
      { name: "ดัชนีการมอดูเลตแอมพลิจูด (Modulation Index: ma)", formula: "m_a = \\frac{V_{control}}{V_{tri}}", note: "หาก ma ≤ 1 วงจรจะอยู่ในย่านเชิงเส้น" }
    ],
    contentHtml: `
      <section class="mb-8">
        <h3 class="text-xl font-bold text-sky-400 mb-3 flex items-center gap-2">
          <span class="w-2 h-6 bg-sky-500 rounded-full inline-block"></span>
          1. โครงสร้างและหลักการทำงานของ H-Bridge Inverter
        </h3>
        <p class="text-slate-300 leading-relaxed mb-4">
          วงจรอินเวอร์เตอร์แบบเต็มบริดจ์ 1 เฟส (Full-Bridge หรือ H-Bridge) ประกอบด้วยสวิตช์สารกึ่งตัวนำ 4 ตัว (เช่น Power MOSFET หรือ IGBT) ต่อในรูปแบบอักษรตัว <strong>H</strong> โดยสวิตช์จะทำงานเป็นคู่ทแยงมุมสลับกัน เพื่อกลับทิศทางการไหลของกระแสผ่านโหลด ทำให้เกิดแรงดันสลับตกคร่อมโหลด
        </p>

        <!-- H-Bridge Circuit Diagram -->
        <div class="my-6 bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-xl text-center">
          <div class="text-sky-300 font-semibold mb-3 text-sm">แผนผังวงจร Single-Phase Full-Bridge (H-Bridge) Inverter</div>
          <svg class="w-full max-w-md mx-auto h-52" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
            <!-- DC Bus Lines -->
            <line x1="50" y1="20" x2="350" y2="20" stroke="#ef4444" stroke-width="3" />
            <text x="35" y="25" fill="#ef4444" font-weight="bold">+Vdc</text>
            <line x1="50" y1="180" x2="350" y2="180" stroke="#3b82f6" stroke-width="3" />
            <text x="35" y="185" fill="#3b82f6" font-weight="bold">-GND</text>
            
            <!-- Left Leg: S1 & S2 -->
            <rect x="100" y="40" width="40" height="30" rx="4" fill="#1e293b" stroke="#06b6d4" stroke-width="2" />
            <text x="120" y="60" fill="#06b6d4" font-weight="bold" font-size="12" text-anchor="middle">S1</text>
            <line x1="120" y1="20" x2="120" y2="40" stroke="#94a3b8" stroke-width="2" />
            <line x1="120" y1="70" x2="120" y2="130" stroke="#94a3b8" stroke-width="2" />
            <rect x="100" y="130" width="40" height="30" rx="4" fill="#1e293b" stroke="#06b6d4" stroke-width="2" />
            <text x="120" y="150" fill="#06b6d4" font-weight="bold" font-size="12" text-anchor="middle">S2</text>
            <line x1="120" y1="160" x2="120" y2="180" stroke="#94a3b8" stroke-width="2" />
            
            <!-- Right Leg: S3 & S4 -->
            <rect x="260" y="40" width="40" height="30" rx="4" fill="#1e293b" stroke="#06b6d4" stroke-width="2" />
            <text x="280" y="60" fill="#06b6d4" font-weight="bold" font-size="12" text-anchor="middle">S3</text>
            <line x1="280" y1="20" x2="280" y2="40" stroke="#94a3b8" stroke-width="2" />
            <line x1="280" y1="70" x2="280" y2="130" stroke="#94a3b8" stroke-width="2" />
            <rect x="260" y="130" width="40" height="30" rx="4" fill="#1e293b" stroke="#06b6d4" stroke-width="2" />
            <text x="280" y="150" fill="#06b6d4" font-weight="bold" font-size="12" text-anchor="middle">S4</text>
            <line x1="280" y1="160" x2="280" y2="180" stroke="#94a3b8" stroke-width="2" />
            
            <!-- AC Load in between -->
            <line x1="120" y1="100" x2="160" y2="100" stroke="#94a3b8" stroke-width="2" />
            <rect x="160" y="85" width="80" height="30" rx="4" fill="#334155" stroke="#f59e0b" stroke-width="2" />
            <text x="200" y="105" fill="#f59e0b" font-weight="bold" font-size="12" text-anchor="middle">AC LOAD</text>
            <line x1="240" y1="100" x2="280" y2="100" stroke="#94a3b8" stroke-width="2" />
          </svg>
          <div class="text-xs text-slate-400 mt-2">
            <strong>สภาวะที่ 1:</strong> S1 และ S4 เปิด (ON) กระแสไหลจากซ้ายไปขวา (+Vdc)<br>
            <strong>สภาวะที่ 2:</strong> S3 และ S2 เปิด (ON) กระแสไหลจากขวาไปซ้าย (-Vdc)
          </div>
        </div>
      </section>

      <section class="mb-8">
        <h3 class="text-xl font-bold text-sky-400 mb-3 flex items-center gap-2">
          <span class="w-2 h-6 bg-sky-500 rounded-full inline-block"></span>
          2. อันตรายจากการลัดวงจรแบบ Shoot-Through และ Dead Time
        </h3>
        <p class="text-slate-300 leading-relaxed mb-3">
          ในวงจร H-Bridge <strong>ห้ามเปิดสวิตช์ S1 และ S2 พร้อมกันเด็ดขาด</strong> (รวมถึงคู่ S3 และ S4) เพราะจะทำให้แหล่งจ่ายไฟบวกต่อตรงลงกราวด์ทันที เรียกว่าเกิดภาวะ <em>Shoot-Through</em> ทำให้สวิตช์ระเบิดพังเสียหายในทันที
        </p>
        <div class="p-4 bg-sky-950/40 border border-sky-800 rounded-lg text-xs text-sky-200">
          <strong>การป้องกันด้วย Dead Time:</strong> สวิตช์จริงมีเวลาในการปิด (Turn-off delay) ช้ากว่าการเปิด ดังนั้นวงจรควบคุมจึงต้องแทรกช่วงเวลาหยุดสั่งงาน (Dead Time ประมาณ 1 ถึง 3 ไมโครวินาที) ที่สวิตช์ทั้งสองตัวถูกสั่ง OFF พร้อมกัน ก่อนจะสลับไปเปิดสวิตช์อีกตัว
        </div>
      </section>
    `
  },
  {
    id: 7,
    title: "วงจรคอนเวอร์เตอร์",
    enTitle: "DC-DC Converters (Choppers)",
    icon: "shuffle",
    badge: "หน่วยที่ 7",
    summary: "ศึกษาหลักการแปลงระดับแรงดันไฟตรงด้วยวงจรช็อปเปอร์และคอนเวอร์เตอร์ความถี่สูง วงจร Buck (Step-Down), Boost (Step-Up) และ Buck-Boost Converter การคำนวณ Duty Cycle (D) และโหมดนำกระแสต่อเนื่อง (CCM)",
    objectives: [
      "อธิบายหลักการทำงานของ Buck, Boost และ Buck-Boost Converter ได้",
      "คำนวณหาค่า Duty Cycle (D), แรงดันเอาต์พุต และกระแสในวงจรได้",
      "วิเคราะห์บทบาทของตัวเหนี่ยวนำ (L) และตัวเก็บประจุ (C) ในการสะสมพลังงานได้",
      "เข้าใจความแตกต่างระหว่างโหมดการทำงาน CCM และ DCM ได้"
    ],
    formulas: [
      { name: "ดิวตี้ไซเคิล (Duty Cycle)", formula: "D = \\frac{T_{on}}{T} = \\frac{T_{on}}{T_{on} + T_{off}} = T_{on} \\times f_s", note: "มีค่าตั้งแต่ 0 ถึง 1 (0% ถึง 100%)" },
      { name: "Buck Converter (Step-Down)", formula: "V_{out} = D \\times V_{in}", note: "แรงดันเอาต์พุตต่ำกว่าอินพุตเสมอ" },
      { name: "Boost Converter (Step-Up)", formula: "V_{out} = \\frac{V_{in}}{1 - D}", note: "แรงดันเอาต์พุตสูงกว่าอินพุตเสมอ" },
      { name: "Buck-Boost Converter", formula: "V_{out} = - V_{in} \\left(\\frac{D}{1 - D}\\right)", note: "แรงดันกลับขั้วเป็นลบ (Inverting)" }
    ],
    contentHtml: `
      <section class="mb-8">
        <h3 class="text-xl font-bold text-sky-400 mb-3 flex items-center gap-2">
          <span class="w-2 h-6 bg-sky-500 rounded-full inline-block"></span>
          1. บทนำและโทโปโลยีของ DC-DC Converter
        </h3>
        <p class="text-slate-300 leading-relaxed mb-4">
          วงจรคอนเวอร์เตอร์กระแสตรง (DC-DC Converter) ทำหน้าที่แปลงแรงดันไฟตรงระดับหนึ่งให้เป็นอีกระดับหนึ่งได้อย่างมีประสิทธิภาพสูง โดยอาศัยการสะสมพลังงานในสนามแม่เหล็กของขดลวดตัวเหนี่ยวนำ (Inductor : L) ร่วมกับการสลับสวิตช์อย่างรวดเร็วของ MOSFET
        </p>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
          <div class="p-4 bg-slate-900 border border-slate-700 rounded-xl">
            <h4 class="font-bold text-sky-400 mb-1">Buck (Step-Down)</h4>
            <div class="text-xs text-sky-300 font-mono mb-2">Vout = D × Vin</div>
            <p class="text-xs text-slate-300">
              ลดแรงดันลง เช่น แปลงไฟ 24V จากแบตเตอรี่เป็น 5V สำหรับวงจรไมโครคอนโทรลเลอร์
            </p>
          </div>
          <div class="p-4 bg-slate-900 border border-slate-700 rounded-xl">
            <h4 class="font-bold text-amber-400 mb-1">Boost (Step-Up)</h4>
            <div class="text-xs text-amber-300 font-mono mb-2">Vout = Vin / (1 - D)</div>
            <p class="text-xs text-slate-300">
              เพิ่มแรงดันขึ้น เช่น แปลงไฟ 12V จากรถยนต์เป็น 48V เพื่อขับแอมป์ หรือ 400V ในรถยนต์ EV
            </p>
          </div>
          <div class="p-4 bg-slate-900 border border-slate-700 rounded-xl">
            <h4 class="font-bold text-purple-400 mb-1">Buck-Boost</h4>
            <div class="text-xs text-purple-300 font-mono mb-2">Vout = -Vin × D / (1-D)</div>
            <p class="text-xs text-slate-300">
              ปรับเพิ่มหรือลดแรงดันก็ได้ โดยมีขั้วแรงดันกลับทิศ (Negative Voltage)
            </p>
          </div>
        </div>
      </section>

      <section class="mb-8">
        <h3 class="text-xl font-bold text-sky-400 mb-3 flex items-center gap-2">
          <span class="w-2 h-6 bg-sky-500 rounded-full inline-block"></span>
          2. ตัวอย่างการคำนวณในระบบพลังงานแสงอาทิตย์ (MPPT)
        </h3>
        <div class="bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-lg text-sm text-slate-300">
          <p class="mb-2"><strong>โจทย์:</strong> แผงโซลาร์เซลล์จ่ายแรงดัน \(V_{in} = 30\,V\) ต้องการแปลงลดแรงดันลงมาประจุแบตเตอรี่ \(12\,V\) โดยใช้วงจร Buck Converter จงหาค่า Duty Cycle (D) ในทางทฤษฎี</p>
          <div class="border-t border-slate-700 pt-2 text-sky-300 space-y-1">
            <div>จากสูตร: \(V_{out} = D \times V_{in}\)</div>
            <div>แทนค่า: \(12 = D \times 30\)</div>
            <div>\(D = \frac{12}{30} = 0.40\) หรือ \(40\%\)</div>
            <div class="text-slate-400 text-xs mt-1">หมายความว่า ใน 1 คาบเวลา สวิตช์จะต้องเปิดนำกระแสเป็นระยะเวลา 40% ของคาบทั้งหมด</div>
          </div>
        </div>
      </section>
    `
  },
  {
    id: 8,
    title: "โซลิดสเตตรีเลย์",
    enTitle: "Solid State Relays (SSR)",
    icon: "toggle-right",
    badge: "หน่วยที่ 8",
    summary: "ศึกษาโครงสร้างและหลักการทำงานของ Solid State Relay (SSR) การแยกสัญญาณด้วย Optocoupler ชนิด Zero-Crossing และ Random Turn-On การเปรียบเทียบกับ Electromechanical Relay และการระบายความร้อน",
    objectives: [
      "อธิบายข้อดีและข้อจำกัดของ SSR เปรียบเทียบกับรีเลย์แบบกลไกแม่เหล็กได้",
      "จำแนกความแตกต่างระหว่าง Zero-Crossing SSR และ Random SSR ได้",
      "อธิบายวงจรแยกทางไฟฟ้า (Optocoupler Isolation) ภายใน SSR ได้",
      "คำนวณความร้อนสูญเสียและการเลือกขนาดแผ่นระบายความร้อน (Heatsink) ได้"
    ],
    formulas: [
      { name: "กำลังงานสูญเสียในตัว SSR (Power Dissipation)", formula: "P_{loss} \\approx V_{on} \\times I_{load}", note: "Von ประมาณ 1.2V ถึง 1.6V" },
      { name: "ความต้านทานความร้อนของแผ่นระบาย (Thermal Resistance: Rth)", formula: "R_{\\theta,sa} = \\frac{T_{j,max} - T_{amb}}{P_{loss}} - (R_{\\theta,jc} + R_{\\theta,cs})", note: "ใช้เลือกขนาดฮีตซิงก์ป้องกันสารกึ่งตัวนำไหม้" }
    ],
    contentHtml: `
      <section class="mb-8">
        <h3 class="text-xl font-bold text-sky-400 mb-3 flex items-center gap-2">
          <span class="w-2 h-6 bg-sky-500 rounded-full inline-block"></span>
          1. โครงสร้างภายในของ Solid State Relay (SSR)
        </h3>
        <p class="text-slate-300 leading-relaxed mb-4">
          โซลิดสเตตรีเลย์ (SSR) คือสวิตช์อิเล็กทรอนิกส์ที่ไม่มีชิ้นส่วนกลไกเคลื่อนไหว ทำงานแทนรีเลย์แบบเดิม โดยใช้ <strong>ออปโตคัปเปลอร์ (Optocoupler)</strong> แยกความปลอดภัยทางไฟฟ้าระหว่างฝั่งควบคุมแรงดันต่ำ (เช่น 3-32VDC จาก PLC) กับฝั่งกำลังงานแรงดันสูง (เช่น 220-380VAC) ด้วยแสง
        </p>

        <!-- SSR Internal Diagram SVG -->
        <div class="my-6 bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-xl text-center">
          <div class="text-sky-300 font-semibold mb-3 text-sm">บล็อกไดอะแกรมโครงสร้างภายในของ Zero-Crossing AC SSR</div>
          <svg class="w-full max-w-lg mx-auto h-40" viewBox="0 0 500 150" xmlns="http://www.w3.org/2000/svg">
            <!-- Input Terminal -->
            <rect x="20" y="35" width="80" height="80" rx="8" fill="#1e293b" stroke="#3b82f6" stroke-width="2" />
            <text x="60" y="65" fill="#3b82f6" font-size="11" text-anchor="middle" font-weight="bold">INPUT</text>
            <text x="60" y="85" fill="#94a3b8" font-size="10" text-anchor="middle">3-32 VDC</text>
            <circle cx="60" cy="100" r="5" fill="#10b981" />
            
            <!-- Opto Isolation Barrier (Dashed Line) -->
            <line x1="160" y1="20" x2="160" y2="130" stroke="#f59e0b" stroke-dasharray="4,4" stroke-width="2" />
            <text x="160" y="15" fill="#f59e0b" font-size="10" text-anchor="middle">Optical Isolation (>2500V)</text>
            
            <!-- LED & Phototriac -->
            <circle cx="130" cy="75" r="14" fill="#3b82f6" opacity="0.3" />
            <text x="130" y="79" fill="#60a5fa" font-size="9" text-anchor="middle">LED</text>
            
            <!-- Arrows for Light -->
            <path d="M 148 70 L 172 70 M 148 80 L 172 80" stroke="#facc15" stroke-width="2" marker-end="url(#arrow)" />
            
            <!-- Zero Cross Circuit Box -->
            <rect x="190" y="45" width="90" height="60" rx="6" fill="#1e293b" stroke="#06b6d4" stroke-width="2" />
            <text x="235" y="72" fill="#06b6d4" font-size="10" text-anchor="middle" font-weight="bold">Zero Crossing</text>
            <text x="235" y="88" fill="#94a3b8" font-size="9" text-anchor="middle">Detector</text>
            
            <!-- Power Switch (Back-to-Back SCR / TRIAC) -->
            <rect x="310" y="45" width="80" height="60" rx="6" fill="#1e293b" stroke="#ec4899" stroke-width="2" />
            <text x="350" y="72" fill="#ec4899" font-size="11" text-anchor="middle" font-weight="bold">TRIAC /</text>
            <text x="350" y="88" fill="#ec4899" font-size="10" text-anchor="middle">SCR Power</text>
            
            <!-- Output Terminal -->
            <rect x="420" y="35" width="70" height="80" rx="8" fill="#1e293b" stroke="#10b981" stroke-width="2" />
            <text x="455" y="65" fill="#10b981" font-size="11" text-anchor="middle" font-weight="bold">LOAD</text>
            <text x="455" y="85" fill="#94a3b8" font-size="10" text-anchor="middle">AC 220V</text>
            
            <line x1="280" y1="75" x2="310" y2="75" stroke="#94a3b8" stroke-width="2" />
            <line x1="390" y1="75" x2="420" y2="75" stroke="#94a3b8" stroke-width="2" />
          </svg>
        </div>
      </section>

      <section class="mb-8">
        <h3 class="text-xl font-bold text-sky-400 mb-3 flex items-center gap-2">
          <span class="w-2 h-6 bg-sky-500 rounded-full inline-block"></span>
          2. Zero-Crossing SSR vs Random Turn-on SSR
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
          <div class="p-4 bg-slate-900 border border-slate-700 rounded-xl">
            <h4 class="font-bold text-emerald-400 text-sm mb-2">Zero-Crossing SSR</h4>
            <p class="leading-relaxed mb-2">
              จะรอจนกระทั่งรูปคลื่นไซน์ของแรงดันไฟสลับตัดผ่าน 0V ก่อน จึงจะสั่งให้อุปกรณ์สลับสวิตช์นำกระแส
            </p>
            <div class="text-emerald-300 font-semibold">
              ✓ ข้อดี: ลดกระแสกระชาก (Inrush) และลดสัญญาณรบกวน EMI ได้เกือบ 100% เหมาะกับฮีตเตอร์และโหลดทั่วไป
            </div>
          </div>
          <div class="p-4 bg-slate-900 border border-slate-700 rounded-xl">
            <h4 class="font-bold text-amber-400 text-sm mb-2">Random / Instantaneous SSR</h4>
            <p class="leading-relaxed mb-2">
              เปิดสวิตช์ทันทีที่สัญญาณอินพุตเข้ามาโดยไม่ต้องรอให้แรงดันผ่านจุดศูนย์
            </p>
            <div class="text-amber-300 font-semibold">
              ✓ เหมาะกับการควบคุมมุมเฟส (Phase Control) สำหรับหรี่ไฟ หรือโหลดที่มีความเป็นตัวเหนี่ยวนำสูง (L-Load)
            </div>
          </div>
        </div>
      </section>
    `
  },
  {
    id: 9,
    title: "วงจรกรองสัญญาณ",
    enTitle: "Filter Circuits in Power Electronics",
    icon: "filter",
    badge: "หน่วยที่ 9",
    summary: "ศึกษาการลดทอนแรงดันกระเพื่อม (Ripple) ด้วยวงจรกรองตัวเก็บประจุ (C-Filter), ตัวเหนี่ยวนำ (L-Filter), แบบ LC และแบบพาย (Pi-Filter) รวมถึงการกำจัดสัญญาณรบกวน EMI ด้วย Common-Mode Choke และ X/Y Capacitors",
    objectives: [
      "อธิบายหลักการทำงานของตัวเก็บประจุและตัวเหนี่ยวนำในการกรองกระแสได้",
      "คำนวณหาค่าแรงดันกระเพื่อม (Ripple Voltage) และตัวประกอบการกระเพื่อม (Ripple Factor) ได้",
      "เปรียบเทียบข้อดีและข้อจำกัดของวงจรกรองแบบ C, L, LC และ Pi (CLC) ได้",
      "อธิบายโครงสร้างและหน้าที่ของวงจรกรองสัญญาณรบกวน EMI Filter ได้"
    ],
    formulas: [
      { name: "แรงดันกระเพื่อมยอดถึงยอด (Peak-to-Peak Ripple - C Filter)", formula: "V_{r(p-p)} = \\frac{I_{dc}}{2 f C} = \\frac{V_{dc}}{2 f R_L C}", note: "สำหรับวงจรเรียงกระแสแบบเต็มคลื่น" },
      { name: "แรงดันกระแสตรงเฉลี่ยเมื่อมี C-Filter", formula: "V_{dc} \\approx V_m - \\frac{V_{r(p-p)}}{2} = V_m - \\frac{I_{dc}}{4 f C}", note: "เมื่อไม่มีโหลด Vdc จะพุ่งสูงถึงค่า Vm" },
      { name: "ตัวประกอบการกระเพื่อม (Ripple Factor: γ)", formula: "\\gamma = \\frac{V_{r,rms}}{V_{dc}} = \\frac{1}{4\\sqrt{3} f C R_L}", note: "ค่ายิ่งน้อย ไฟตรงยิ่งเรียบสม่ำเสมอ" }
    ],
    contentHtml: `
      <section class="mb-8">
        <h3 class="text-xl font-bold text-sky-400 mb-3 flex items-center gap-2">
          <span class="w-2 h-6 bg-sky-500 rounded-full inline-block"></span>
          1. ประเภทของวงจรกรองในภาคจ่ายไฟกระแสตรง
        </h3>
        <p class="text-slate-300 leading-relaxed mb-4">
          แรงดันที่ได้จากวงจรเรียงกระแสจะเป็นแบบพัลส์กระเพื่อม (Pulsating DC) ไม่สามารถนำไปจ่ายให้วงจรไมโครคอนโทรลเลอร์หรือเครื่องเสียงได้โดยตรง วงจรกรองจึงทำหน้าที่เก็บสะสมและคายประจุเพื่อทำให้แรงดันราบเรียบสม่ำเสมอ
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
          <div class="p-4 bg-slate-900 border border-slate-700 rounded-xl">
            <h4 class="font-bold text-sky-400 mb-2">1. ตัวเก็บประจุกรอง (C-Filter)</h4>
            <p class="text-xs text-slate-300 leading-relaxed">
              ต่อขนานกับโหลด เป็นวงจรที่นิยมใช้มากที่สุด ให้แรงดันเอาต์พุตสูงใกล้เคียง \(V_m\) เหมาะกับโหลดกระแสต่ำถึงปานกลาง ยิ่งใช้ C ค่ามาก ริปเปิลยิ่งลดลง
            </p>
          </div>
          <div class="p-4 bg-slate-900 border border-slate-700 rounded-xl">
            <h4 class="font-bold text-amber-400 mb-2">2. ตัวเหนี่ยวนำกรอง (L-Filter / Choke)</h4>
            <p class="text-xs text-slate-300 leading-relaxed">
              ต่ออนุกรมกับโหลด อาศัยคุณสมบัติต้านการเปลี่ยนแปลงกระแส (\(e = -L \\frac{di}{dt}\)) ประสิทธิภาพการกรองจะดีขึ้นเมื่อโหลดดึงกระแสสูง เหมาะกับโหลดหนักในโรงงาน
            </p>
          </div>
          <div class="p-4 bg-slate-900 border border-slate-700 rounded-xl">
            <h4 class="font-bold text-purple-400 mb-2">3. วงจรกรองแบบ LC (L-Section Filter)</h4>
            <p class="text-xs text-slate-300 leading-relaxed">
              นำ L ต่ออนุกรมและตามด้วย C ขนานกับโหลด รวมข้อดีของทั้งสองชนิด ทำให้ค่าแรงดันกระเพื่อมแทบไม่ขึ้นกับขนาดของกระแสโหลด
            </p>
          </div>
          <div class="p-4 bg-slate-900 border border-slate-700 rounded-xl">
            <h4 class="font-bold text-emerald-400 mb-2">4. วงจรกรองแบบพาย (Pi หรือ CLC Filter)</h4>
            <p class="text-xs text-slate-300 leading-relaxed">
              ประกอบด้วย C1 ขนาน + L อนุกรม + C2 ขนาน ได้ค่า Ripple Factor ต่ำที่สุดและแรงดันสูงที่สุด นิยมใช้ในภาคจ่ายไฟของเครื่องมือวัดและเครื่องเสียง
            </p>
          </div>
        </div>
      </section>

      <section class="mb-8">
        <h3 class="text-xl font-bold text-sky-400 mb-3 flex items-center gap-2">
          <span class="w-2 h-6 bg-sky-500 rounded-full inline-block"></span>
          2. วงจรกรองสัญญาณรบกวนคลื่นแม่เหล็กไฟฟ้า (EMI Filter)
        </h3>
        <p class="text-slate-300 leading-relaxed mb-3">
          ในแหล่งจ่ายไฟสวิตชิ่งและอุปกรณ์อิเล็กทรอนิกส์กำลัง วงจร EMI Filter ที่อยู่ตรงทางเข้าสายไฟ AC ทำหน้าที่สำคัญ 2 ประการ:
        </p>
        <ul class="list-disc list-inside text-xs text-slate-300 space-y-1 mb-3 pl-2">
          <li>ป้องกันคลื่นสัญญาณรบกวนภายนอกจากสายไฟบ้านไม่ให้เข้ามาทำให้อุปกรณ์ทำงานผิดพลาด</li>
          <li>กักเก็บสัญญาณรบกวนความถี่สูงที่เกิดจากการสวิตชิ่งภายใน ไม่ให้แพร่กระจายย้อนกลับเข้าสู่สายไฟสาธารณะ</li>
        </ul>
        <div class="p-4 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 space-y-2">
          <div><strong class="text-amber-400">• Common-Mode Choke:</strong> ขดลวดคู่บนแกนเฟอร์ไรต์ พันให้ทิศทางสนามแม่เหล็กหักล้างสัญญาณรบกวนที่ไหลมาพร้อมกันทั้งสาย L และ N</div>
          <div><strong class="text-sky-400">• X-Capacitor:</strong> ต่อคร่อมสาย L และ N เพื่อดูดซับสัญญาณรบกวนแบบ Differential-mode</div>
          <div><strong class="text-emerald-400">• Y-Capacitor:</strong> ต่อระหว่างสายไฟลงสายดิน (L-to-Ground และ N-to-Ground) เพื่อดูดซับสัญญาณรบกวนแบบ Common-mode</div>
        </div>
      </section>
    `
  },
  {
    id: 10,
    title: "วงจรหรี่ไฟฟ้า",
    enTitle: "Light Dimmer Circuits and Phase Angle Control",
    icon: "sun",
    badge: "หน่วยที่ 10",
    summary: "ศึกษาการประยุกต์ใช้งานวงจรควบคุมมุมเฟสในชีวิตประจำวัน โครงสร้างวงจรหรี่ไฟด้วย DIAC-TRIAC วงจรหน่วงเวลา RC ปรากฏการณ์ Hysteresis วงจร Snubber ป้องกันการกวนสัญญาณ และความแตกต่างของหลอดไส้และหลอด LED หรี่แสงได้",
    objectives: [
      "อธิบายวงจรและหลักการทำงานของสวิตช์หรี่ไฟแบบ DIAC-TRIAC ได้อย่างละเอียด",
      "อธิบายบทบาทของตัวเก็บประจุและตัวต้านทานปรับค่าได้ (VR) ในการหน่วงเวลาจุดชนวนได้",
      "วิเคราะห์ปัญหา Hysteresis Effect และแนวทางการแก้ไขด้วยวงจร Double Time-Constant ได้",
      "เข้าใจข้อจำกัดและความปลอดภัยในการนำวงจรหรี่ไฟไปใช้กับหลอด LED และมอเตอร์สว่านไฟฟ้า"
    ],
    formulas: [
      { name: "ค่าคงที่เวลาการประจุ (Time Constant)", formula: "\\tau = R \\times C = (R_{fixed} + VR) \\times C", note: "ปรับ VR มาก ค่า τ สูง มุม α กว้าง หลอดหรี่ลง" },
      { name: "แรงดันจุดชนวน DIAC (Breakover Voltage)", formula: "V_{BO} \\approx 28V - 36V", note: "เมื่อแรงดันใน C สูงถึง VBO ไดแอกจะนำกระแสทันที" },
      { name: "กำลังงานไฟฟ้าเฉลี่ยที่ส่งไปยังหลอดไฟ", formula: "P_{load} = \\frac{V_{rms}^2}{R_{lamp}}", note: "แปรผันตามมุมตัดคลื่นเฟส α" }
    ],
    contentHtml: `
      <section class="mb-8">
        <h3 class="text-xl font-bold text-sky-400 mb-3 flex items-center gap-2">
          <span class="w-2 h-6 bg-sky-500 rounded-full inline-block"></span>
          1. วงจรหรี่ไฟพื้นฐานด้วย DIAC และ TRIAC
        </h3>
        <p class="text-slate-300 leading-relaxed mb-4">
          วงจรหรี่ไฟ (Light Dimmer) เป็นตัวอย่างการประยุกต์ใช้อิเล็กทรอนิกส์กำลังที่คลาสสิกและพบได้ในทุกครัวเรือน ทำงานโดยการตัดมุมเฟส (Leading-Edge Phase Cut) ของไฟฟ้า 220VAC ทำให้แรงดันประสิทธิผลที่ตกคร่อมหลอดไฟลดลง โดยอุปกรณ์สวิตชิ่งแทบไม่มีความร้อนสูญเสีย
        </p>

        <!-- Dimmer Schematic SVG -->
        <div class="my-6 bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-xl text-center">
          <div class="text-sky-300 font-semibold mb-3 text-sm">วงจรแผนผังสวิตช์หรี่ไฟมาตรฐาน (Standard TRIAC Light Dimmer)</div>
          <svg class="w-full max-w-lg mx-auto h-48" viewBox="0 0 520 180" xmlns="http://www.w3.org/2000/svg">
            <!-- AC Input -->
            <circle cx="50" cy="80" r="20" fill="none" stroke="#38bdf8" stroke-width="2" />
            <path d="M 40 80 Q 45 70 50 80 T 60 80" fill="none" stroke="#38bdf8" stroke-width="2" />
            <text x="50" y="120" fill="#94a3b8" font-size="10" text-anchor="middle">220VAC L-N</text>
            
            <!-- Lamp -->
            <line x1="70" y1="50" x2="130" y2="50" stroke="#94a3b8" stroke-width="2" />
            <circle cx="150" cy="50" r="16" fill="#1e293b" stroke="#f59e0b" stroke-width="2" />
            <line x1="140" y1="40" x2="160" y2="60" stroke="#f59e0b" stroke-width="2" />
            <line x1="140" y1="60" x2="160" y2="40" stroke="#f59e0b" stroke-width="2" />
            <text x="150" y="25" fill="#f59e0b" font-size="11" text-anchor="middle" font-weight="bold">หลอดไฟ (LAMP)</text>
            
            <line x1="166" y1="50" x2="240" y2="50" stroke="#94a3b8" stroke-width="2" />
            
            <!-- VR and R -->
            <line x1="240" y1="50" x2="240" y2="80" stroke="#94a3b8" stroke-width="2" />
            <rect x="230" y="80" width="20" height="40" fill="#1e293b" stroke="#06b6d4" stroke-width="2" />
            <line x1="220" y1="110" x2="260" y2="90" stroke="#06b6d4" stroke-width="2" marker-end="url(#arrow)" />
            <text x="275" y="105" fill="#06b6d4" font-size="11">VR (250kΩ)</text>
            
            <!-- Capacitor C1 -->
            <line x1="240" y1="120" x2="240" y2="135" stroke="#94a3b8" stroke-width="2" />
            <line x1="230" y1="135" x2="250" y2="135" stroke="#38bdf8" stroke-width="3" />
            <line x1="230" y1="142" x2="250" y2="142" stroke="#38bdf8" stroke-width="3" />
            <text x="275" y="145" fill="#38bdf8" font-size="11">C1 (0.1µF)</text>
            <line x1="240" y1="142" x2="240" y2="160" stroke="#94a3b8" stroke-width="2" />
            
            <!-- DIAC -->
            <line x1="240" y1="130" x2="310" y2="130" stroke="#94a3b8" stroke-width="2" />
            <polygon points="310,120 310,140 325,130" fill="#a855f7" />
            <polygon points="325,120 325,140 310,130" fill="#a855f7" />
            <text x="317" y="155" fill="#a855f7" font-size="10" text-anchor="middle">DIAC DB3</text>
            <line x1="325" y1="130" x2="370" y2="130" stroke="#94a3b8" stroke-width="2" />
            
            <!-- TRIAC -->
            <line x1="240" y1="50" x2="380" y2="50" stroke="#94a3b8" stroke-width="2" />
            <line x1="380" y1="50" x2="380" y2="70" stroke="#94a3b8" stroke-width="2" />
            <polygon points="370,70 390,70 380,85" fill="#ec4899" />
            <polygon points="380,85 370,100 390,100" fill="#ec4899" />
            <line x1="380" y1="100" x2="380" y2="160" stroke="#94a3b8" stroke-width="2" />
            <!-- Gate connection -->
            <line x1="370" y1="130" x2="375" y2="92" stroke="#ec4899" stroke-width="2" />
            <text x="415" y="85" fill="#ec4899" font-size="11" font-weight="bold">TRIAC</text>
            
            <!-- Ground / Return Line -->
            <line x1="70" y1="110" x2="70" y2="160" stroke="#94a3b8" stroke-width="2" />
            <line x1="70" y1="160" x2="440" y2="160" stroke="#94a3b8" stroke-width="2" />
            <line x1="380" y1="160" x2="440" y2="160" stroke="#94a3b8" stroke-width="2" />
          </svg>
        </div>
      </section>

      <section class="mb-8">
        <h3 class="text-xl font-bold text-sky-400 mb-3 flex items-center gap-2">
          <span class="w-2 h-6 bg-sky-500 rounded-full inline-block"></span>
          2. ลำดับการทำงานทีละขั้นตอน
        </h3>
        <ol class="list-decimal list-inside space-y-2 text-slate-300 text-sm pl-2 mb-4">
          <li>เมื่อแรงดันไฟสลับเริ่มต้นที่ 0V ตัว TRIAC ยังไม่นำกระแส กระแสไฟฟ้าขนาดเล็กจะไหลผ่านหลอดไฟและโพเทนชิโอมิเตอร์ VR เพื่อชาร์จประจุเข้าตัวเก็บประจุ C1</li>
          <li>แรงดันตกคร่อมตัวเก็บประจุ C1 จะค่อยๆ ไต่ระดับขึ้นตามค่าคงที่เวลา \(\\tau = (R + VR) \\times C\)</li>
          <li>เมื่อแรงดันใน C1 เพิ่มสูงถึงจุด Breakover Voltage ของ DIAC (ประมาณ 32V) ตัวไดแอกจะ 'พังทะลุ' และเปลี่ยนสภาพเป็นตัวนำทันที</li>
          <li>ประจุที่กักเก็บใน C1 จะคายประจุอย่างรวดเร็วเป็นพัลส์กระแสที่รุนแรงและฉับไวส่งเข้าสู่ขั้วเกต (Gate) ของ TRIAC</li>
          <li>TRIAC สลับสภาวะเป็นเปิดวงจร (ON) กระแสโหลดเต็มที่จึงไหลผ่านหลอดไฟ ทำให้หลอดไฟสว่างขึ้น และ TRIAC จะคงสภาวะ ON จนกระทั่งสิ้นสุดครึ่งไซเคิล</li>
        </ol>
      </section>

      <section class="mb-8">
        <h3 class="text-xl font-bold text-sky-400 mb-3 flex items-center gap-2">
          <span class="w-2 h-6 bg-sky-500 rounded-full inline-block"></span>
          3. ข้อควรระวังในงานติดตั้งและความปลอดภัย
        </h3>
        <div class="p-4 bg-amber-950/40 border border-amber-500/50 rounded-xl text-amber-200 text-xs space-y-2">
          <div><strong>1. อันตรายจากไฟฟ้าดูด:</strong> วงจรดิมเมอร์ทั่วไปไม่มีหม้อแปลงแยกขด (Non-isolated) อุปกรณ์ทุกชิ้นมีศักย์ไฟฟ้า 220V ต่อเทียบกับดิน แกนหมุนของ VR จะต้องสวมลูกบิดพลาสติกที่มีฉนวนหนาแน่นเสมอ</div>
          <div><strong>2. การใช้งานกับหลอดไฟ LED:</strong> หลอด LED ทั่วไปไม่สามารถใช้กับดิมเมอร์ชนิดนี้ได้ จะเกิดการกระพริบและทำให้ไดรเวอร์พัง ต้องเลือกใช้หลอดที่มีป้ายกำกับว่า <em>"Dimmable LED"</em> เท่านั้น</div>
          <div><strong>3. สัญญาณรบกวนวิทยุ (RFI):</strong> การตัดต่ออย่างรวดเร็วทำให้เกิดสัญญาณรบกวนคลื่นวิทยุกระจายเข้าสายไฟบ้าน ดิมเมอร์ที่มีมาตรฐานจึงต้องมีวงจร RC Snubber และตัวเหนี่ยวนำขดลวด Toroid เพื่อกรอง EMI เสมอ</div>
        </div>
      </section>
    `
  }
];
