let tables = [];
let currentStep = 1;
let reservation = { mesa: null, inicio: null, fin: null };

const times = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 15) {
    const hh = String(h).padStart(2, '0');
    const mm = String(m).padStart(2, '0');
    times.push(`${hh}:${mm}`);
  }
}

function save() {
  localStorage.setItem('tables', JSON.stringify(tables));
}

function load() {
  const data = localStorage.getItem('tables');
  if (data) tables = JSON.parse(data);
}

function updateStepper(step) {
  document.querySelectorAll('#stepper .step').forEach((el, idx) => {
    if (idx + 1 <= step) el.classList.add('active');
    else el.classList.remove('active');
  });
}

function showStep(step) {
  document.querySelectorAll('.step-content').forEach(el => el.classList.remove('active'));
  document.getElementById(`step${step}`).classList.add('active');
  updateStepper(step);
  currentStep = step;
}

// Step 1
const numMesasInput = document.getElementById('num-mesas');
const next1 = document.getElementById('next1');
numMesasInput.addEventListener('input', () => {
  next1.disabled = !(parseInt(numMesasInput.value, 10) > 0);
});

next1.addEventListener('click', () => {
  const n = parseInt(numMesasInput.value, 10);
  tables = [];
  for (let i = 1; i <= n; i++) {
    tables.push({ id: i, chairs: 4, premium: false, reservas: [] });
  }
  buildTableConfig();
  showStep(2);
});

// Step 2
const configContainer = document.getElementById('tables-config');
const next2 = document.getElementById('next2');
const back2 = document.getElementById('back2');

function buildTableConfig() {
  configContainer.innerHTML = '';
  tables.forEach(t => {
    const group = document.createElement('div');
    group.className = 'form-group';
    group.innerHTML = `<label>Mesa ${t.id} - Sillas:</label>`;
    const input = document.createElement('input');
    input.type = 'number';
    input.min = 1;
    input.value = t.chairs;
    input.className = 'table-chairs';
    input.dataset.id = t.id;
    const premium = document.createElement('label');
    premium.innerHTML = ` <input type="checkbox" class="premium-check" data-id="${t.id}"> Premium`;
    group.appendChild(input);
    group.appendChild(premium);
    configContainer.appendChild(group);
  });
  validateStep2();
}

function validateStep2() {
  const chairInputs = document.querySelectorAll('.table-chairs');
  let valid = true;
  chairInputs.forEach(inp => {
    if (parseInt(inp.value, 10) < 1) valid = false;
  });
  next2.disabled = !valid;
}

configContainer.addEventListener('input', validateStep2);

next2.addEventListener('click', () => {
  document.querySelectorAll('.table-chairs').forEach(inp => {
    const t = tables.find(tb => tb.id === parseInt(inp.dataset.id, 10));
    t.chairs = parseInt(inp.value, 10);
  });
  document.querySelectorAll('.premium-check').forEach(chk => {
    const t = tables.find(tb => tb.id === parseInt(chk.dataset.id, 10));
    t.premium = chk.checked;
  });
  fillMesaSelect();
  buildTimeGrids();
  showStep(3);
});

back2.addEventListener('click', () => showStep(1));

function fillMesaSelect() {
  const select = document.getElementById('mesa-select');
  select.innerHTML = '<option value="">Seleccione</option>';
  tables.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t.id;
    opt.textContent = `Mesa ${t.id}`;
    select.appendChild(opt);
  });
}

// Step 3
const mesaSelect = document.getElementById('mesa-select');
const next3 = document.getElementById('next3');
const back3 = document.getElementById('back3');
let startSelected = null;
let endSelected = null;

function buildTimeGrids() {
  const startContainer = document.getElementById('start-times');
  const endContainer = document.getElementById('end-times');
  startContainer.innerHTML = '';
  endContainer.innerHTML = '';

  times.forEach(t => {
    const s = document.createElement('div');
    s.className = 'time-slot';
    s.textContent = t;
    s.dataset.time = t;
    s.addEventListener('click', () => selectStart(s));
    startContainer.appendChild(s);

    const e = document.createElement('div');
    e.className = 'time-slot';
    e.textContent = t;
    e.dataset.time = t;
    e.addEventListener('click', () => selectEnd(e));
    endContainer.appendChild(e);
  });
}

function selectStart(el) {
  if (startSelected) startSelected.classList.remove('selected');
  startSelected = el;
  startSelected.classList.add('selected');
  reservation.inicio = el.dataset.time;
  validateStep3();
}

function selectEnd(el) {
  if (endSelected) endSelected.classList.remove('selected');
  endSelected = el;
  endSelected.classList.add('selected');
  reservation.fin = el.dataset.time;
  validateStep3();
}

function validateStep3() {
  reservation.mesa = mesaSelect.value ? parseInt(mesaSelect.value, 10) : null;
  let valid = reservation.mesa && reservation.inicio && reservation.fin && reservation.fin > reservation.inicio;
  next3.disabled = !valid;
}

mesaSelect.addEventListener('change', validateStep3);

next3.addEventListener('click', () => {
  showStep(4);
  drawLayout();
});

back3.addEventListener('click', () => showStep(2));

// Step 4
const next4 = document.getElementById('next4');
const back4 = document.getElementById('back4');

function drawLayout() {
  const container = document.getElementById('layout');
  container.innerHTML = '';
  tables.forEach((t, idx) => {
    const div = document.createElement('div');
    div.className = 'table-item';
    if (t.premium) div.classList.add('premium');
    div.style.left = `${(idx % 4) * 100 + 20}px`;
    div.style.top = `${Math.floor(idx / 4) * 120 + 20}px`;
    div.textContent = `Mesa ${t.id}`;

    const chairs = ['top', 'right', 'bottom', 'left'];
    chairs.forEach(pos => {
      const c = document.createElement('div');
      c.className = `chair ${pos}`;
      div.appendChild(c);
    });

    container.appendChild(div);
  });
}

next4.addEventListener('click', () => {
  showSummary();
  showStep(5);
});

back4.addEventListener('click', () => showStep(3));

// Step 5
const back5 = document.getElementById('back5');
const finishBtn = document.getElementById('finish');

function showSummary() {
  const s = document.getElementById('summary');
  const mesa = tables.find(t => t.id === reservation.mesa);
  s.innerHTML = `<p>Mesa: ${mesa.id} ${mesa.premium ? '(Premium)' : ''}</p>` +
    `<p>Horario: ${reservation.inicio} - ${reservation.fin}</p>`;
}

finishBtn.addEventListener('click', () => {
  const mesa = tables.find(t => t.id === reservation.mesa);
  mesa.reservas.push({ inicio: reservation.inicio, fin: reservation.fin });
  save();
  alert('Reserva guardada');
  showStep(1);
});

back5.addEventListener('click', () => showStep(4));

load();
if (tables.length) {
  buildTableConfig();
  fillMesaSelect();
  buildTimeGrids();
  showStep(1);
}
