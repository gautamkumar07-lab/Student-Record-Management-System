/* ===== Student Record Management System using Arrays, Searching, and Sorting Algorithms =====
   Data structure: a plain JavaScript Array of student objects, persisted in localStorage. */
'use strict';
const KEY = 'srms_students';
let students = [];          // main array of records
let editingId = null;       // ID of the record being edited
let viewList = null;        // list currently shown (null = full array)
const $ = id => document.getElementById(id);

/* ---------- Complexity information ---------- */
const COMPLEXITY = {
  'Linear Search': ['O(1)', 'O(n)', 'O(n)', 'O(1)'],
  'Binary Search': ['O(1)', 'O(log n)', 'O(log n)', 'O(1)'],
  'Bubble Sort':   ['O(n)', 'O(n²)', 'O(n²)', 'O(1)'],
  'Quick Sort':    ['O(n log n)', 'O(n log n)', 'O(n²)', 'O(log n)']
};
function renderComplexity() {
  let h = '<tr><th>Algorithm</th><th>Best</th><th>Average</th><th>Worst</th><th>Space</th></tr>';
  for (const [n, c] of Object.entries(COMPLEXITY)) h += `<tr><td>${n}</td>${c.map(x => `<td>${x}</td>`).join('')}</tr>`;
  $('complexity').innerHTML = h;
}
function setAlgo(name) { $('algoNow').textContent = `${name} — ${COMPLEXITY[name][1]} average, ${COMPLEXITY[name][2]} worst`; }

/* ---------- Comparison helper (numeric when possible, else text) ---------- */
function cmp(a, b, field) {
  const x = a[field], y = b[field];
  if (field === 'marks') return x - y;
  if (!isNaN(x) && !isNaN(y) && x !== '' && y !== '') return Number(x) - Number(y);
  return String(x).toLowerCase().localeCompare(String(y).toLowerCase());
}

/* ---------- SEARCHING ---------- */
// Linear Search: scan each element in order. Name search is partial match; ID search is exact.
function linearSearch(arr, field, q) {
  const res = []; q = q.toLowerCase();
  for (let i = 0; i < arr.length; i++) {
    const v = String(arr[i][field]).toLowerCase();
    if (field === 'name' ? v.includes(q) : v === q) res.push(arr[i]);
  }
  return res;
}
// Binary Search: requires a sorted array. Repeatedly halves the search range (exact match).
function binarySearch(sorted, field, q) {
  let lo = 0, hi = sorted.length - 1;
  const target = { [field]: q };
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const c = cmp(sorted[mid], target, field);
    if (c === 0) return [sorted[mid]];
    c < 0 ? lo = mid + 1 : hi = mid - 1;
  }
  return [];
}

/* ---------- SORTING (both work on a copy so the original array is untouched) ---------- */
// Bubble Sort: swap adjacent out-of-order elements; stops early if no swaps happen.
function bubbleSort(arr, field, asc = true) {
  const a = [...arr];
  for (let i = 0; i < a.length - 1; i++) {
    let swapped = false;
    for (let j = 0; j < a.length - i - 1; j++) {
      const c = cmp(a[j], a[j + 1], field);
      if (asc ? c > 0 : c < 0) { [a[j], a[j + 1]] = [a[j + 1], a[j]]; swapped = true; }
    }
    if (!swapped) break;
  }
  return a;
}
// Quick Sort: pick a pivot (middle element), partition into smaller/equal/larger, recurse.
function quickSort(arr, field, asc = true) {
  if (arr.length <= 1) return [...arr];
  const pivot = arr[arr.length >> 1], l = [], m = [], r = [];
  for (const s of arr) {
    const c = cmp(s, pivot, field);
    (c === 0 ? m : (asc ? c < 0 : c > 0) ? l : r).push(s);
  }
  return [...quickSort(l, field, asc), ...m, ...quickSort(r, field, asc)];
}

/* ---------- Storage ---------- */
const save = () => localStorage.setItem(KEY, JSON.stringify(students));
function load() {
  try { students = JSON.parse(localStorage.getItem(KEY)) || []; } catch { students = []; }
  if (!students.length) students = [
    { id: '101', name: 'Aarav Sharma', course: 'B.Tech CSE', semester: 3, marks: 88 },
    { id: '102', name: 'Meera Singh', course: 'B.Tech CSE', semester: 3, marks: 76.5 },
    { id: '103', name: 'Rohan Verma', course: 'B.Tech IT', semester: 5, marks: 91 }
  ];
}

/* ---------- UI helpers ---------- */
function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 2200); }
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function renderStats() {
  const m = students.map(s => s.marks), n = m.length;
  $('sTotal').textContent = n;
  $('sMax').textContent = n ? Math.max(...m) : 0;
  $('sMin').textContent = n ? Math.min(...m) : 0;
  $('sAvg').textContent = n ? (m.reduce((a, b) => a + b, 0) / n).toFixed(2) : 0;
}
function renderTable(list = viewList || students, hitIds = []) {
  $('tbody').innerHTML = list.length ? list.map((s, i) => `
    <tr class="${hitIds.includes(s.id) ? 'hit' : ''}" style="animation-delay:${i * 40}ms" data-id="${esc(s.id)}">
      <td>${esc(s.id)}</td><td>${esc(s.name)}</td><td>${esc(s.course)}</td><td>${s.semester}</td><td>${s.marks}</td>
      <td class="row"><button class="btn sm" data-act="edit">Edit</button><button class="btn sm del" data-act="del">Delete</button></td>
    </tr>`).join('') : '<tr><td colspan="6">No records yet. Add a student in Manage.</td></tr>';
  renderStats();
}

/* ---------- CRUD ---------- */
$('studentForm').addEventListener('submit', e => {
  e.preventDefault();
  const rec = { id: $('fId').value.trim(), name: $('fName').value.trim(), course: $('fCourse').value.trim(),
    semester: +$('fSem').value, marks: +$('fMarks').value };
  if (rec.marks < 0 || rec.marks > 100) return toast('Marks must be between 0 and 100');
  const dup = students.findIndex(s => s.id === rec.id);
  if (editingId === null) {
    if (dup !== -1) return toast('Student ID already exists');
    students.push(rec); toast('Student added');
  } else {
    if (rec.id !== editingId && dup !== -1) return toast('Student ID already exists');
    students[students.findIndex(s => s.id === editingId)] = rec; toast('Student updated');
  }
  save(); resetForm(); viewList = null; renderTable(); showPage('records');
});
function resetForm() {
  editingId = null; $('studentForm').reset();
  $('formTitle').textContent = 'Add student'; $('saveBtn').textContent = 'Add student'; $('cancelBtn').hidden = true;
}
$('cancelBtn').onclick = resetForm;

$('tbody').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  const tr = b.closest('tr'), id = tr.dataset.id, s = students.find(x => x.id === id);
  if (b.dataset.act === 'edit') {
    editingId = id;
    $('fId').value = s.id; $('fName').value = s.name; $('fCourse').value = s.course; $('fSem').value = s.semester; $('fMarks').value = s.marks;
    $('formTitle').textContent = 'Update student'; $('saveBtn').textContent = 'Update student'; $('cancelBtn').hidden = false;
    showPage('manage');
  } else if (confirm(`Delete ${s.name}?`)) {
    tr.classList.add('out');
    setTimeout(() => { students = students.filter(x => x.id !== id); if (viewList) viewList = viewList.filter(x => x.id !== id); save(); renderTable(); toast('Student deleted'); }, 400);
  }
});

/* ---------- Search & sort controls ---------- */
$('searchBtn').onclick = () => {
  const q = $('qText').value.trim(), field = $('qField').value, algo = $('qAlgo').value;
  if (!q) return toast('Enter something to search');
  const t0 = performance.now(); let res;
  if (algo === 'linear') { setAlgo('Linear Search'); res = linearSearch(students, field, q); }
  else { setAlgo('Binary Search'); res = binarySearch(quickSort(students, field), field, q); } // sort first, then halve
  const ms = (performance.now() - t0).toFixed(3);
  $('searchInfo').textContent = `${res.length} match(es) found in ${ms} ms using ${algo === 'linear' ? 'Linear' : 'Binary'} Search` +
    (algo === 'binary' ? ' (exact match on a sorted copy)' : '');
  viewList = res; renderTable(res, res.map(r => r.id)); showPage('records');
};
$('clearBtn').onclick = () => { $('qText').value = ''; $('searchInfo').textContent = ''; viewList = null; renderTable(); };

$('sortBtn').onclick = () => {
  const f = $('sField').value, algo = $('sAlgo').value, asc = $('sOrder').value === 'asc';
  const t0 = performance.now();
  const name = algo === 'quick' ? 'Quick Sort' : 'Bubble Sort';
  const sorted = (algo === 'quick' ? quickSort : bubbleSort)(students, f, asc);
  setAlgo(name);
  $('sortInfo').textContent = `Sorted by ${f} with ${name} in ${(performance.now() - t0).toFixed(3)} ms — ${COMPLEXITY[name][1]} average`;
  students = sorted; viewList = null; save(); renderTable(); toast(`Sorted using ${name}`);
};

/* ---------- Navigation ---------- */
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.toggle('active', p.id === id));
  document.querySelectorAll('.nav').forEach(n => n.classList.toggle('active', n.dataset.page === id));
}
document.querySelectorAll('.nav').forEach(n => n.onclick = () => showPage(n.dataset.page));

/* ---------- 3D tilt on mouse move ---------- */
document.addEventListener('mousemove', e => {
  document.querySelectorAll('.tilt').forEach(el => {
    const r = el.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) { el.style.transform = ''; return; }
    const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    el.style.transform = `perspective(800px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateZ(8px)`;
  });
});

/* ---------- Animated particles ---------- */
(function particles() {
  const c = $('particles'), ctx = c.getContext('2d'); let P = [];
  const resize = () => { c.width = innerWidth; c.height = innerHeight; P = Array.from({ length: Math.min(90, innerWidth / 12) }, () => ({
    x: Math.random() * c.width, y: Math.random() * c.height, r: Math.random() * 2 + .5, vx: Math.random() - .5, vy: Math.random() - .5, h: Math.random() < .5 ? 190 : 275 })); };
  resize(); addEventListener('resize', resize);
  (function draw() {
    ctx.clearRect(0, 0, c.width, c.height);
    for (const p of P) {
      p.x = (p.x + p.vx + c.width) % c.width; p.y = (p.y + p.vy + c.height) % c.height;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fillStyle = `hsla(${p.h},100%,65%,.8)`; ctx.shadowColor = `hsl(${p.h},100%,60%)`; ctx.shadowBlur = 10; ctx.fill();
    }
    requestAnimationFrame(draw);
  })();
})();

/* ---------- Init ---------- */
load(); renderComplexity(); renderTable();
window.addEventListener('load', () => setTimeout(() => $('loader').classList.add('done'), 900));
