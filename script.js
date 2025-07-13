let tables = [];

function save() {
    localStorage.setItem('tables', JSON.stringify(tables));
}

function load() {
    const data = localStorage.getItem('tables');
    if (data) tables = JSON.parse(data);
}

function createTableConfig(n) {
    const container = document.getElementById('sillas-config');
    container.innerHTML = '';
    for (let i = 1; i <= n; i++) {
        const group = document.createElement('div');
        group.className = 'form-group';
        const label = document.createElement('label');
        label.textContent = `Sillas mesa ${i}:`;
        const input = document.createElement('input');
        input.type = 'number';
        input.min = 1;
        input.value = 4;
        input.id = `sillas-${i}`;
        group.appendChild(label);
        group.appendChild(input);
        container.appendChild(group);
    }
    const btn = document.createElement('button');
    btn.textContent = 'Guardar configuración';
    btn.addEventListener('click', () => {
        tables = [];
        for (let i = 1; i <= n; i++) {
            const chairs = parseInt(document.getElementById(`sillas-${i}`).value, 10);
            tables.push({ id: i, chairs: chairs, reservas: [] });
        }
        save();
        showReservations();
    });
    const btnWrapper = document.createElement('div');
    btnWrapper.className = 'form-group';
    btnWrapper.appendChild(btn);
    container.appendChild(btnWrapper);
}

function showReservations() {
    document.getElementById('configuracion').classList.add('oculto');
    const resSection = document.getElementById('reservas');
    resSection.classList.remove('oculto');

    const select = document.getElementById('mesa-select');
    select.innerHTML = '';
    tables.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t.id;
        opt.textContent = `Mesa ${t.id}`;
        select.appendChild(opt);
    });
    renderTables();
}

function renderTables() {
    const container = document.getElementById('mesas');
    container.innerHTML = '';
    tables.forEach(t => {
        const div = document.createElement('div');
        div.className = 'mesa';
        const title = document.createElement('h3');
        title.textContent = `Mesa ${t.id} - ${t.chairs} sillas`;
        div.appendChild(title);
        t.reservas.forEach((r, idx) => {
            const rDiv = document.createElement('div');
            rDiv.className = 'reserva';
            rDiv.textContent = `${r.inicio} - ${r.fin}`;
            const btn = document.createElement('button');
            btn.textContent = 'X';
            btn.addEventListener('click', () => {
                t.reservas.splice(idx, 1);
                save();
                renderTables();
            });
            rDiv.appendChild(btn);
            div.appendChild(rDiv);
        });
        container.appendChild(div);
    });
}

document.getElementById('crear-mesas').addEventListener('click', () => {
    const n = parseInt(document.getElementById('num-mesas').value, 10);
    createTableConfig(n);
});

document.getElementById('form-reserva').addEventListener('submit', (e) => {
    e.preventDefault();
    const mesaId = parseInt(document.getElementById('mesa-select').value, 10);
    const inicio = document.getElementById('inicio').value;
    const fin = document.getElementById('fin').value;
    if (fin <= inicio) {
        alert('La hora de fin debe ser posterior al inicio');
        return;
    }
    const mesa = tables.find(t => t.id === mesaId);
    const overlap = mesa.reservas.some(r => inicio < r.fin && fin > r.inicio);
    if (overlap) {
        alert('No disponible en ese horario');
        return;
    }
    mesa.reservas.push({ inicio, fin });
    save();
    renderTables();
});

load();
if (tables.length) {
    showReservations();
}
