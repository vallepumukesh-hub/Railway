/* ══════════════════════════════════════════
   RAILCONNECT INDIA — script.js
   Include this at the bottom of index.html:
   <script src="script.js"></script>
══════════════════════════════════════════ */

/* ══════════════════════════════════════════
   TRAIN DATA
   Add / edit trains in this array to update
   the search results dynamically.
══════════════════════════════════════════ */
const TRAINS = [
  {
    num: '12951', name: 'Mumbai Rajdhani Express',
    dep: '16:55', arr: '08:35', dur: '15h 40m', stops: 5,
    from: 'NDLS', to: 'CSMT', tags: ['popular'],
    classes: [
      { c: '2A', p: 2385, a: 'Available' },
      { c: '3A', p: 1590, a: 'Available' },
      { c: 'SL', p: 590,  a: 'WL 12' }
    ]
  },
  {
    num: '12259', name: 'Sealdah Duronto Express',
    dep: '20:05', arr: '09:55', dur: '13h 50m', stops: 2,
    from: 'NDLS', to: 'SDAH', tags: ['fast'],
    classes: [
      { c: '1A', p: 4560, a: 'Available' },
      { c: '2A', p: 2780, a: 'Available' },
      { c: '3A', p: 1850, a: 'RAC 3' }
    ]
  },
  {
    num: '12002', name: 'Bhopal Shatabdi Express',
    dep: '06:00', arr: '14:25', dur: '8h 25m', stops: 8,
    from: 'NDLS', to: 'BPL', tags: ['fast', 'popular'],
    classes: [
      { c: 'CC', p: 920,  a: 'Available' },
      { c: 'EC', p: 1850, a: 'Available' }
    ]
  },
  {
    num: '12625', name: 'Kerala Express',
    dep: '11:35', arr: '19:10', dur: '31h 35m', stops: 22,
    from: 'NDLS', to: 'TVC', tags: [],
    classes: [
      { c: 'SL', p: 455,  a: 'Available' },
      { c: '3A', p: 1180, a: 'WL 4' },
      { c: '2A', p: 1720, a: 'Available' }
    ]
  },
  {
    num: '12627', name: 'Karnataka Express',
    dep: '22:30', arr: '10:00', dur: '35h 30m', stops: 18,
    from: 'NDLS', to: 'SBC', tags: ['popular'],
    classes: [
      { c: 'SL', p: 510,  a: 'Available' },
      { c: '3A', p: 1340, a: 'RAC 8' },
      { c: '2A', p: 1890, a: 'Available' }
    ]
  }
];

/* ── Currently selected train (used in booking modal) ── */
let currentTrain = null;

/* ══════════════════════════════════════════
   NAVIGATION
   go('screenId') — switches visible screen
══════════════════════════════════════════ */
function go(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
}

/* ══════════════════════════════════════════
   SEARCH TABS (One Way / Round Trip / Multi)
══════════════════════════════════════════ */
function setTab(el, type) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
}

/* ══════════════════════════════════════════
   AUTH TABS (Login / Create Account)
══════════════════════════════════════════ */
function switchAuth(formId, el) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('login-form').style.display  = 'none';
  document.getElementById('signup-form').style.display = 'none';
  document.getElementById('authSuccess').classList.remove('visible');
  document.getElementById(formId).style.display = 'block';
}

/* ══════════════════════════════════════════
   SWAP STATIONS (From ⇄ To)
══════════════════════════════════════════ */
function swapStations() {
  const a = document.getElementById('fromCity');
  const b = document.getElementById('toCity');
  [a.value, b.value] = [b.value, a.value];
}

/* ══════════════════════════════════════════
   SET DEFAULT JOURNEY DATE (tomorrow)
══════════════════════════════════════════ */
(function setDefaultDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  document.getElementById('journeyDate').value = d.toISOString().split('T')[0];
})();

/* ══════════════════════════════════════════
   SEARCH TRAINS
   Validates inputs then renders train cards.
══════════════════════════════════════════ */
function searchTrains() {
  const from = document.getElementById('fromCity').value.trim();
  const to   = document.getElementById('toCity').value.trim();
  const date = document.getElementById('journeyDate').value;

  if (!from || !to) { showToast('Please enter origin and destination'); return; }
  if (!date)        { showToast('Please select a journey date'); return; }

  const dateStr = new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  document.getElementById('resultsTitle').textContent = `${from} → ${to}`;
  document.getElementById('resultsDate').textContent  = dateStr;
  document.getElementById('resultsCount').textContent = `${TRAINS.length} trains found`;

  const list = document.getElementById('trainsList');
  list.innerHTML = '';

  TRAINS.forEach(t => {
    const tags = t.tags.map(tag =>
      `<span class="tag tag-${tag}">${tag === 'fast' ? '⚡ Fastest' : '🔥 Popular'}</span>`
    ).join('');

    const classesHTML = t.classes.map(cl =>
      `<div class="class-badge">
         <span class="class-name">${cl.c}</span>
         <span class="class-price">₹${cl.p}</span>
         <span class="avail">${cl.a}</span>
       </div>`
    ).join('');

    /* Safely encode train object for onclick attribute */
    const trainJSON = encodeURIComponent(JSON.stringify(t));

    list.innerHTML += `
    <div class="train-card" onclick="openBookingFromEncoded('${trainJSON}')">
      <div>
        <div class="train-name">${t.name} ${tags}</div>
        <div class="train-num">#${t.num}</div>
      </div>
      <div class="time-block">
        <div class="time">${t.dep}</div>
        <div class="station-code">${t.from}</div>
      </div>
      <div class="duration-block">
        <div class="duration-line">
          <div class="d-line"></div>
          <span>${t.dur}</span>
          <div class="d-line"></div>
        </div>
        <div class="stops">${t.stops} stops</div>
      </div>
      <div class="time-block">
        <div class="time">${t.arr}</div>
        <div class="station-code">${t.to}</div>
      </div>
      <div>
        <div class="classes">${classesHTML}</div>
        <button class="book-btn" style="margin-top:10px"
          onclick="event.stopPropagation(); openBookingFromEncoded('${trainJSON}')">
          Book Now
        </button>
      </div>
    </div>`;
  });

  document.getElementById('trainResults').style.display = 'block';
  setTimeout(() => document.getElementById('trainResults').scrollIntoView({ behavior: 'smooth' }), 100);
}

/* ══════════════════════════════════════════
   BOOKING MODAL — OPEN
══════════════════════════════════════════ */

/** Called from HTML onclick via encoded string to avoid quote escaping issues */
function openBookingFromEncoded(encoded) {
  openBooking(JSON.parse(decodeURIComponent(encoded)));
}

function openBooking(train) {
  currentTrain = train;

  /* Populate journey summary */
  document.getElementById('mdDep').textContent   = train.dep;
  document.getElementById('mdArr').textContent   = train.arr;
  document.getElementById('mdFrom').textContent  = train.from;
  document.getElementById('mdTo').textContent    = train.to;
  document.getElementById('mdTrain').textContent = `${train.name} · #${train.num}`;
  document.getElementById('mdClass').textContent = document.getElementById('travelClass').value;
  document.getElementById('mdDate').textContent  = new Date(
    document.getElementById('journeyDate').value
  ).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  /* Calculate fares */
  const base  = train.classes[0].p;
  const gst   = Math.round(base * 0.05);
  const total = base + 40 + gst;
  document.getElementById('baseFare').textContent  = '₹' + base;
  document.getElementById('gstFare').textContent   = '₹' + gst;
  document.getElementById('totalFare').textContent = '₹' + total;

  document.getElementById('bookingModal').classList.add('open');
  resetSteps();
}

/* ══════════════════════════════════════════
   BOOKING MODAL — STEP MANAGEMENT
══════════════════════════════════════════ */
function resetSteps() {
  /* Reset step indicators */
  ['step1', 'step2', 'step3'].forEach((s, i) => {
    const el = document.getElementById(s);
    el.className = 'step' + (i === 0 ? ' active' : '');
    el.textContent = i + 1;
  });
  ['line1', 'line2'].forEach(l => document.getElementById(l).className = 'step-line');

  /* Show only step 1 content */
  document.getElementById('step-1-content').style.display = 'block';
  document.getElementById('step-2-content').style.display = 'none';
  document.getElementById('step-3-content').style.display = 'none';
  document.getElementById('bookingFlow').style.display    = 'block';
  document.getElementById('ticketSuccess').classList.remove('visible');
}

/** Validates step 1 and moves to step 2 (payment) */
function goStep2() {
  const name   = document.getElementById('p1Name').value.trim();
  const age    = document.getElementById('p1Age').value;
  const gender = document.getElementById('p1Gender').value;

  if (!name || !age || !gender) { showToast('Please fill all passenger details'); return; }

  const step1 = document.getElementById('step1');
  step1.className = 'step done'; step1.textContent = '✓';
  document.getElementById('line1').className = 'step-line done';
  document.getElementById('step2').className = 'step active';

  document.getElementById('step-1-content').style.display = 'none';
  document.getElementById('step-2-content').style.display = 'block';
}

/** Highlight selected payment method */
function selectPayment(el) {
  document.querySelectorAll('.social-btn').forEach(b => b.style.borderColor = '');
  el.style.borderColor = 'var(--accent)';
}

/** Simulate payment processing and show ticket confirmation */
function processPayment() {
  const step2 = document.getElementById('step2');
  step2.className = 'step done'; step2.textContent = '✓';
  document.getElementById('line2').className = 'step-line done';
  document.getElementById('step3').className = 'step active';

  document.getElementById('step-2-content').style.display = 'none';
  document.getElementById('step-3-content').style.display = 'block';

  /* Simulate 2.2s processing delay then show confirmation */
  setTimeout(() => {
    const pnr = Math.floor(Math.random() * 9000000000) + 1000000000;
    document.getElementById('pnrCode').textContent     = pnr;
    document.getElementById('confTrain').textContent   = currentTrain ? currentTrain.name : '—';
    document.getElementById('confDate').textContent    = document.getElementById('mdDate').textContent;
    document.getElementById('confAmount').textContent  = document.getElementById('totalFare').textContent;

    document.getElementById('bookingFlow').style.display = 'none';
    document.getElementById('ticketSuccess').classList.add('visible');
  }, 2200);
}

/** Placeholder — in a real app this would add another passenger row */
function addPassenger() {
  showToast('Additional passenger row added');
}

function closeModal() {
  document.getElementById('bookingModal').classList.remove('open');
}

/* ══════════════════════════════════════════
   PNR STATUS CHECK
══════════════════════════════════════════ */
function checkPNR() {
  const pnr = document.getElementById('pnrInput').value.trim();
  if (pnr.length < 10) { showToast('Please enter a valid 10-digit PNR'); return; }
  document.getElementById('pnrResult').classList.add('visible');
  showToast('PNR status fetched successfully');
}

/* ══════════════════════════════════════════
   LOGIN
══════════════════════════════════════════ */
function doLogin() {
  const u = document.getElementById('loginUser').value.trim();
  const p = document.getElementById('loginPass').value;
  if (!u || !p) { showToast('Please fill in all fields'); return; }

  document.getElementById('login-form').style.display  = 'none';
  document.getElementById('successTitle').textContent  = 'Welcome Back!';
  document.getElementById('successSub').textContent    = "You're now logged in to RailConnect. Happy travels!";
  document.getElementById('authSuccess').classList.add('visible');
}

/* ══════════════════════════════════════════
   SIGN UP
══════════════════════════════════════════ */
function doSignup() {
  const first  = document.getElementById('signFirst').value.trim();
  const mobile = document.getElementById('signMobile').value.trim();
  const email  = document.getElementById('signEmail').value.trim();
  const pass   = document.getElementById('signPass').value;
  const terms  = document.getElementById('termsCheck').checked;

  if (!first || !mobile || !email || !pass) { showToast('Please fill in all fields'); return; }
  if (!terms) { showToast('Please accept terms & conditions'); return; }

  document.getElementById('signup-form').style.display = 'none';
  document.getElementById('successTitle').textContent  = `Welcome, ${first}!`;
  document.getElementById('successSub').textContent    = 'Your account has been created. An OTP has been sent to your mobile for verification.';
  document.getElementById('authSuccess').classList.add('visible');
}

/* ══════════════════════════════════════════
   FAQ ACCORDION
══════════════════════════════════════════ */
function toggleFAQ(el) {
  el.parentElement.classList.toggle('open');
}

/* ══════════════════════════════════════════
   OFFER CODE — COPY TO CLIPBOARD
══════════════════════════════════════════ */
function copyCode(code) {
  navigator.clipboard.writeText(code).catch(() => {});
  showToast(`Code "${code}" copied to clipboard!`);
}

/* ══════════════════════════════════════════
   TOAST NOTIFICATION
   showToast(message) — displays a brief popup
   at the bottom of the screen.
══════════════════════════════════════════ */
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}