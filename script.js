/* script.js - Night Mode Luxury (keeps original functionality + hero visuals) */

// Pages
const pages = {
  p1: document.getElementById('page-1'),
  p2: document.getElementById('page-2'),
  p3: document.getElementById('page-3'),
  p4: document.getElementById('page-4')
};
let current = 'p1';
let selectedDestination = '';

// Elements
const hero = document.getElementById('hero');
const heroTitle = document.getElementById('heroTitle');
const heroSubtitle = document.getElementById('heroSubtitle');

// show/hide pages with smooth fade/slide
function showPage(key) {
  if (!pages[key]) return;
  Object.values(pages).forEach(p => p.classList.remove('active'));
  pages[key].classList.add('active');
  Object.entries(pages).forEach(([k, el]) => el.setAttribute('aria-hidden', k !== key));
  current = key;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ------------------ VALIDATION ------------------ */
const regForm = document.getElementById('regForm');
const nameInput = document.getElementById('fullname');
const phoneInput = document.getElementById('phone');
const pinInput = document.getElementById('pin');
const emailInput = document.getElementById('email');

const showError = (id, show) => {
  const el = document.getElementById(id);
  if (el) el.style.display = show ? 'block' : 'none';
};

const validPhone = v => /^\d{10}$/.test(v.trim());
const validPin = v => /^\d{6}$/.test(v.trim());
const validEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

phoneInput.addEventListener('input', () => showError('err-phone', !validPhone(phoneInput.value)));
pinInput.addEventListener('input', () => showError('err-pin', !validPin(pinInput.value)));
emailInput.addEventListener('input', () => showError('err-email', !validEmail(emailInput.value)));
nameInput.addEventListener('input', () => showError('err-name', nameInput.value.trim() === ''));

regForm.addEventListener('submit', (e) => {
  e.preventDefault();
  let ok = true;
  if (nameInput.value.trim() === '') { showError('err-name', true); ok = false; } else showError('err-name', false);
  if (!validPhone(phoneInput.value)) { showError('err-phone', true); ok = false; } else showError('err-phone', false);
  if (!validPin(pinInput.value)) { showError('err-pin', true); ok = false; } else showError('err-pin', false);
  if (!validEmail(emailInput.value)) { showError('err-email', true); ok = false; } else showError('err-email', false);

  if (!ok) return;

  showModal('Registration successful', 'Welcome, ' + (nameInput.value.trim() || 'Traveler') + ' — taking you to the travel blog.', () => showPage('p2'));
});

document.getElementById('clearBtn').addEventListener('click', () => {
  regForm.reset();
  ['err-name','err-phone','err-pin','err-email'].forEach(id => showError(id, false));
});

/* ------------------ MODAL ------------------ */
const modalBackdrop = document.getElementById('modalBackdrop');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const modalOk = document.getElementById('modalOk');
let modalCallback = null;

function showModal(title, body, callback) {
  modalTitle.textContent = title;
  modalBody.textContent = body;
  modalBackdrop.classList.add('show');
  modalBackdrop.setAttribute('aria-hidden', 'false');
  modalCallback = callback || null;
  setTimeout(() => modalOk.focus(), 50);
}
function closeModal() {
  modalBackdrop.classList.remove('show');
  modalBackdrop.setAttribute('aria-hidden', 'true');
  if (typeof modalCallback === 'function') { setTimeout(() => { modalCallback(); modalCallback = null; }, 160); }
}
modalOk.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', (e) => { if (e.target === modalBackdrop) closeModal(); });
document.addEventListener('keydown', (e) => { if (modalBackdrop.classList.contains('show') && e.key === 'Escape') closeModal(); });

/* ------------------ BLOG NAV / HERO UPDATE ------------------ */
document.querySelectorAll('#page-2 .navlink').forEach(a => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const href = a.getAttribute('href');
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const img = a.dataset.img || target.dataset.img;
    const title = a.dataset.title || target.querySelector('h3')?.textContent || 'Explore destinations';
    setHero(img, title);
  });
});

function setHero(imgName, title){
  if (!hero) return;
  if (imgName) hero.style.backgroundImage = `url('assets/${imgName}')`;
  else hero.style.backgroundImage = 'none';
  heroTitle.textContent = title || 'Explore destinations';
  heroSubtitle.textContent = 'Night Mode Luxury';
  // subtle glow pulse on hero
  hero.classList.remove('pulse'); void hero.offsetWidth; hero.classList.add('pulse');
}

/* ------------------ NAV BUTTONS ------------------ */
document.getElementById('toPage3').addEventListener('click', () => showPage('p3'));
document.getElementById('backToBlog').addEventListener('click', () => showPage('p2'));

/* ------------------ PRICE CALC ------------------ */
const checkboxes = Array.from(document.querySelectorAll('.price-checkbox'));
const totalPriceEl = document.getElementById('totalPrice');

function calculateTotal(){
  const total = checkboxes.reduce((sum, cb) => cb.checked ? sum + Number(cb.dataset.price || 0) : sum, 0);
  totalPriceEl.textContent = '$' + total;
  return total;
}
checkboxes.forEach(cb => cb.addEventListener('change', calculateTotal));

/* ------------------ CONFIRM ------------------ */
document.getElementById('confirmBtn').addEventListener('click', () => {
  const total = calculateTotal();
  const dest = document.querySelector("input[name='destination']:checked");
  if (!dest) { showError('err-destination', true); return; }
  showError('err-destination', false);
  selectedDestination = dest.value;
  if (total === 0) { showModal('Nothing selected', 'Please choose at least one option to continue.'); return; }
  showModal('Selection confirmed', `Trip to ${selectedDestination} — Total ${totalPriceEl.textContent}.`, () => {
    document.getElementById('summaryText').textContent = `Your simulated booking to ${selectedDestination} is complete. Total: ${totalPriceEl.textContent}.`;
    setHero(selectedDestination.toLowerCase()+'.svg', selectedDestination);
    showPage('p4');
  });
});

/* ------------------ START OVER ------------------ */
document.getElementById('startOver').addEventListener('click', resetAll);
document.getElementById('startOverTop').addEventListener('click', resetAll);
function resetAll(){
  regForm.reset(); checkboxes.forEach(cb => cb.checked = false); calculateTotal();
  document.querySelectorAll("input[name='destination']").forEach(r => r.checked = false);
  ['err-name','err-phone','err-pin','err-email','err-destination'].forEach(id => showError(id, false));
  showPage('p1');
}

/* ------------------ INIT ------------------ */
calculateTotal();
