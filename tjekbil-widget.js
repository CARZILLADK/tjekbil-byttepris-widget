/**
 * CARZILLA Byttepris Widget
 *
 * Embed:
 *   <div id="tjekbil-widget"></div>
 *   <script src="tjekbil-widget.js" data-token="EMBED_TOKEN"></script>
 */

(function () {
  'use strict';

  // ─── Konfiguration ──────────────────────────────────────────────────────────
  const CONFIG = {
    apiBase: 'https://api.tjekbil-carzilla.dk/api/v1',
    embedToken: document.currentScript?.dataset?.token || 'DEMO_TOKEN',
    containerId: 'tjekbil-widget',
    primaryColor: document.currentScript?.dataset?.color || '#050922',
    accentColor: document.currentScript?.dataset?.accent || '#E5FE01',
    // Demo-tilstand: bruges når ingen rigtig API er tilgængelig
    demoMode: document.currentScript?.dataset?.demo === 'true' || true,
  };

  // ─── Mock data til demo ─────────────────────────────────────────────────────
  const MOCK_VEHICLES = {
    AB12345: { brand: 'Volkswagen', model: 'Golf', variant: 'TDI Comfortline', year: 2020, fuel_type: 'Diesel', mileage: 45000, color: 'Sølvgrå' },
    CD67890: { brand: 'Toyota', model: 'Yaris', variant: 'Hybrid Active', year: 2021, fuel_type: 'Hybrid', mileage: 28000, color: 'Hvid' },
    EF11223: { brand: 'BMW', model: '320d', variant: 'xDrive Sport', year: 2019, fuel_type: 'Diesel', mileage: 72000, color: 'Sort' },
  };

  function getMockValuation(plate) {
    const prices = { AB12345: 124000, CD67890: 189000, EF11223: 98000 };
    return prices[plate.toUpperCase()] || Math.floor(Math.random() * 150000) + 60000;
  }

  // ─── CSS ────────────────────────────────────────────────────────────────────
  const CSS = `
    :host { all: initial; display: block; font-family: 'Inter', 'Segoe UI', sans-serif; }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    .w-wrap {
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 4px 32px rgba(0,0,0,0.10);
      overflow: hidden;
      max-width: 480px;
      width: 100%;
    }

    .w-header {
      background: ${CONFIG.primaryColor};
      padding: 24px 28px;
      color: #fff;
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      overflow: hidden;
      position: relative;
    }

    .w-header-content {
      flex: 1;
      position: relative;
      z-index: 1;
    }

    .w-header-mascot {
      width: 110px;
      flex-shrink: 0;
      align-self: flex-end;
      margin-bottom: -24px;
      margin-right: -8px;
      filter: drop-shadow(-4px 0 12px rgba(0,0,0,0.3));
    }

    .w-header-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 4px;
    }

    .w-header-logo svg { width: 28px; height: 28px; }

    .w-header-brand {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 2px;
      text-transform: uppercase;
      opacity: 0.7;
    }

    .w-header h2 {
      font-size: 22px;
      font-weight: 700;
      color: #fff;
      margin-top: 6px;
      line-height: 1.2;
    }

    .w-header p {
      font-size: 13px;
      opacity: 0.7;
      margin-top: 4px;
    }

    .w-body { padding: 28px; }

    /* ── Steps indicator ── */
    .w-steps {
      display: flex;
      gap: 0;
      margin-bottom: 28px;
    }

    .w-step {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      position: relative;
    }

    .w-step:not(:last-child)::after {
      content: '';
      position: absolute;
      top: 14px;
      left: 50%;
      width: 100%;
      height: 2px;
      background: #e0e0e0;
      z-index: 0;
    }

    .w-step.done:not(:last-child)::after,
    .w-step.active:not(:last-child)::after {
      background: ${CONFIG.primaryColor};
    }

    .w-step-dot {
      width: 28px; height: 28px;
      border-radius: 50%;
      background: #e0e0e0;
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700; color: #999;
      position: relative; z-index: 1;
      transition: all 0.3s;
    }

    .w-step.active .w-step-dot {
      background: ${CONFIG.primaryColor};
      color: ${CONFIG.accentColor};
      box-shadow: 0 0 0 4px ${CONFIG.primaryColor}33;
    }

    .w-step.done .w-step-dot {
      background: ${CONFIG.primaryColor};
      color: #fff;
    }

    .w-step-label {
      font-size: 10px;
      color: #aaa;
      font-weight: 500;
      text-align: center;
    }

    .w-step.active .w-step-label { color: ${CONFIG.primaryColor}; font-weight: 700; }
    .w-step.done .w-step-label   { color: ${CONFIG.primaryColor}; }

    /* ── Form elementer ── */
    .w-label {
      font-size: 12px;
      font-weight: 600;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 8px;
      display: block;
    }

    .w-plate-wrap {
      display: flex;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      overflow: hidden;
      transition: border-color 0.2s;
    }

    .w-plate-wrap:focus-within { border-color: ${CONFIG.primaryColor}; }

    .w-plate-flag {
      background: ${CONFIG.primaryColor};
      color: #fff;
      padding: 0 14px;
      display: flex; align-items: center; justify-content: center;
      font-size: 20px;
      min-width: 52px;
    }

    .w-plate-input {
      flex: 1;
      border: none;
      outline: none;
      padding: 14px 16px;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: 4px;
      text-transform: uppercase;
      color: #1a1a2e;
      font-family: 'Courier New', monospace;
      background: transparent;
    }

    .w-plate-input::placeholder { color: #ccc; letter-spacing: 2px; font-size: 18px; }

    .w-btn {
      width: 100%;
      padding: 15px;
      border: none;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
      margin-top: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .w-btn-primary {
      background: ${CONFIG.accentColor};
      color: #050922;
    }

    .w-btn-primary:hover { background: #d4eb00; transform: translateY(-1px); box-shadow: 0 4px 16px ${CONFIG.accentColor}88; }
    .w-btn-primary:active { transform: translateY(0); }
    .w-btn-primary:disabled { background: #ccc; cursor: not-allowed; transform: none; box-shadow: none; }

    .w-btn-secondary {
      background: transparent;
      color: #666;
      border: 2px solid #e0e0e0;
      margin-top: 10px;
      font-size: 13px;
      padding: 11px;
    }

    .w-btn-secondary:hover { border-color: #999; color: #333; }

    /* ── Loader ── */
    .w-loader {
      text-align: center;
      padding: 32px 0;
    }

    .w-spinner {
      width: 44px; height: 44px;
      border: 4px solid #f0f0f0;
      border-top-color: ${CONFIG.accentColor};
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 16px;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .w-loader p { color: #999; font-size: 14px; }

    /* ── Bil-kort ── */
    .w-car-card {
      background: #f4f5f7;
      border-radius: 12px;
      padding: 16px 18px;
      margin-bottom: 20px;
      border-left: 4px solid ${CONFIG.primaryColor};
    }

    .w-car-title {
      font-size: 18px;
      font-weight: 700;
      color: ${CONFIG.primaryColor};
    }

    .w-car-sub {
      font-size: 13px;
      color: #888;
      margin-top: 2px;
    }

    .w-car-meta {
      display: flex;
      gap: 16px;
      margin-top: 12px;
      flex-wrap: wrap;
    }

    .w-car-meta-item {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 12px;
      color: #666;
    }

    .w-car-meta-item span { font-weight: 600; color: #333; }

    /* ── Pris-box ── */
    .w-price-box {
      background: linear-gradient(135deg, ${CONFIG.primaryColor}, #16213e);
      border-radius: 12px;
      padding: 20px 22px;
      color: #fff;
      text-align: center;
      margin-bottom: 20px;
    }

    .w-price-label { font-size: 11px; opacity: 0.7; text-transform: uppercase; letter-spacing: 1px; }
    .w-price-amount { font-size: 38px; font-weight: 800; margin: 4px 0; }
    .w-price-currency { font-size: 18px; font-weight: 400; }
    .w-price-note { font-size: 11px; opacity: 0.6; margin-top: 4px; }

    /* ── Input felter ── */
    .w-field { margin-bottom: 14px; }

    .w-input {
      width: 100%;
      padding: 13px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
      color: #333;
      font-family: inherit;
    }

    .w-input:focus { border-color: ${CONFIG.primaryColor}; }
    .w-input.error { border-color: #e63946; }

    .w-error { color: #e63946; font-size: 11px; margin-top: 4px; display: none; }
    .w-error.show { display: block; }

    /* ── Checkbox ── */
    .w-checkbox-wrap {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin-bottom: 16px;
      cursor: pointer;
    }

    .w-checkbox {
      width: 18px; height: 18px;
      border: 2px solid #ddd;
      border-radius: 4px;
      flex-shrink: 0;
      margin-top: 1px;
      accent-color: ${CONFIG.accentColor};
      cursor: pointer;
    }

    .w-checkbox-label { font-size: 13px; color: #555; line-height: 1.4; }

    /* ── Succes ── */
    .w-success {
      text-align: center;
      padding: 16px 0 8px;
    }

    .w-success-icon {
      width: 64px; height: 64px;
      background: #d4edda;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 16px;
      font-size: 28px;
    }

    .w-success h3 { font-size: 20px; font-weight: 700; color: ${CONFIG.primaryColor}; }
    .w-success p  { font-size: 13px; color: #777; margin-top: 8px; line-height: 1.5; }

    .w-success-detail {
      background: #f8f9ff;
      border-radius: 10px;
      padding: 14px 16px;
      margin-top: 18px;
      text-align: left;
    }

    .w-success-detail-row {
      display: flex; justify-content: space-between;
      font-size: 13px; color: #555;
      padding: 4px 0;
    }

    .w-success-detail-row strong { color: #333; }

    /* ── Footer ── */
    .w-footer {
      padding: 14px 28px;
      border-top: 1px solid #f0f0f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .w-footer-brand { font-size: 11px; color: #bbb; font-weight: 600; letter-spacing: 1px; }
    .w-footer-secure { font-size: 11px; color: #bbb; display: flex; align-items: center; gap: 4px; }

    /* ── Skjul/vis ── */
    .w-screen { display: none; }
    .w-screen.active { display: block; }

    .w-alert {
      background: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 8px;
      padding: 10px 14px;
      font-size: 12px;
      color: #856404;
      margin-bottom: 14px;
    }
  `;

  // ─── HTML skabeloner ─────────────────────────────────────────────────────────
  function buildHTML() {
    return `
      <div class="w-wrap">
        <div class="w-header">
          <div class="w-header-content">
            <div class="w-header-logo">
              <svg viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="${CONFIG.accentColor}"/>
                <path d="M6 20l4-8h12l4 8H6z" fill="white" opacity="0.9"/>
                <circle cx="10" cy="22" r="2.5" fill="white"/>
                <circle cx="22" cy="22" r="2.5" fill="white"/>
                <path d="M4 18h24" stroke="white" stroke-width="1.5" opacity="0.5"/>
              </svg>
              <span class="w-header-brand">CARZILLA BYTTEPRIS</span>
            </div>
            <h2>Hvad er din bil værd?</h2>
            <p>Få en gratis vurdering på under 30 sekunder</p>
          </div>
          <img src="mascot.png" alt="" class="w-header-mascot" />
        </div>

        <div class="w-body">
          <!-- Step indikator -->
          <div class="w-steps">
            <div class="w-step active" id="step-1">
              <div class="w-step-dot">1</div>
              <div class="w-step-label">Nummerplade</div>
            </div>
            <div class="w-step" id="step-2">
              <div class="w-step-dot">2</div>
              <div class="w-step-label">Din pris</div>
            </div>
            <div class="w-step" id="step-3">
              <div class="w-step-dot">3</div>
              <div class="w-step-label">Kontakt</div>
            </div>
          </div>

          <!-- Screen 1: Nummerplade -->
          <div class="w-screen active" id="screen-plate">
            <label class="w-label">Indtast nummerplade</label>
            <div class="w-plate-wrap">
              <div class="w-plate-flag">🇩🇰</div>
              <input
                class="w-plate-input"
                id="plate-input"
                type="text"
                placeholder="AB 12 345"
                maxlength="8"
                autocomplete="off"
              />
            </div>
            <div class="w-error" id="plate-error">Indtast venligst en gyldig nummerplade</div>
            <button class="w-btn w-btn-primary" id="btn-lookup">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              Hent vurdering
            </button>
          </div>

          <!-- Screen 2: Loader -->
          <div class="w-screen" id="screen-loading">
            <div class="w-loader">
              <div class="w-spinner"></div>
              <p>Henter oplysninger om din bil...</p>
            </div>
          </div>

          <!-- Screen 3: Pris -->
          <div class="w-screen" id="screen-price">
            <div class="w-car-card" id="car-card">
              <!-- udfyldes dynamisk -->
            </div>
            <div class="w-price-box">
              <div class="w-price-label">Estimeret byttepris</div>
              <div class="w-price-amount" id="price-amount">–</div>
              <div class="w-price-note">Vejledende byttepris · Gratis og uforpligtende</div>
            </div>
            <button class="w-btn w-btn-primary" id="btn-to-contact">
              Få et præcist tilbud — gratis
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
            <button class="w-btn w-btn-secondary" id="btn-back-plate">
              ← Søg på en anden bil
            </button>
          </div>

          <!-- Screen 4: Kontaktformular -->
          <div class="w-screen" id="screen-contact">
            <div class="w-alert">
              📋 En CARZILLA-rådgiver kontakter dig inden for 2 timer
            </div>
            <div class="w-field">
              <label class="w-label">Fulde navn</label>
              <input class="w-input" id="input-name" type="text" placeholder="Jens Hansen" autocomplete="name" />
              <div class="w-error" id="err-name">Udfyld venligst dit navn</div>
            </div>
            <div class="w-field">
              <label class="w-label">E-mail</label>
              <input class="w-input" id="input-email" type="email" placeholder="jens@example.dk" autocomplete="email" />
              <div class="w-error" id="err-email">Indtast venligst en gyldig e-mail</div>
            </div>
            <div class="w-field">
              <label class="w-label">Telefon</label>
              <input class="w-input" id="input-phone" type="tel" placeholder="12 34 56 78" autocomplete="tel" />
              <div class="w-error" id="err-phone">Indtast venligst dit telefonnummer</div>
            </div>
            <label class="w-checkbox-wrap">
              <input class="w-checkbox" type="checkbox" id="input-newcar" />
              <span class="w-checkbox-label">Jeg er også interesseret i at høre om en ny bil</span>
            </label>
            <button class="w-btn w-btn-primary" id="btn-submit">
              Send — få dit tilbud
            </button>
            <button class="w-btn w-btn-secondary" id="btn-back-price">
              ← Tilbage
            </button>
          </div>

          <!-- Screen 5: Succes -->
          <div class="w-screen" id="screen-success">
            <div class="w-success">
              <div class="w-success-icon">✓</div>
              <h3>Tak, vi er på sagen!</h3>
              <p>En CARZILLA-rådgiver kontakter dig snart med et præcist tilbud på din bil.</p>
              <div class="w-success-detail" id="success-detail">
                <!-- udfyldes dynamisk -->
              </div>
            </div>
          </div>

        </div><!-- /w-body -->

        <div class="w-footer">
          <span class="w-footer-brand">CARZILLA</span>
          <span class="w-footer-secure">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            SSL-krypteret
          </span>
        </div>
      </div>
    `;
  }

  // ─── Widget klasse ───────────────────────────────────────────────────────────
  class TjekBilWidget {
    constructor(container) {
      this.container = container;
      this.state = {
        plate: '',
        vehicle: null,
        valuation: null,
        leadId: null,
      };
      this.init();
    }

    init() {
      // Shadow DOM
      const shadow = this.container.attachShadow({ mode: 'open' });

      const style = document.createElement('style');
      style.textContent = CSS;

      const wrap = document.createElement('div');
      wrap.innerHTML = buildHTML();

      shadow.appendChild(style);
      shadow.appendChild(wrap);

      this.shadow = shadow;
      this.bindEvents();
    }

    $ (sel) { return this.shadow.querySelector(sel); }

    // ── Skærm-skift ────────────────────────────────────────────────────────────
    showScreen(id) {
      this.shadow.querySelectorAll('.w-screen').forEach(s => s.classList.remove('active'));
      this.$(`#screen-${id}`).classList.add('active');
    }

    setStep(n) {
      for (let i = 1; i <= 3; i++) {
        const el = this.$(`#step-${i}`);
        el.classList.remove('active', 'done');
        if (i < n) el.classList.add('done');
        if (i === n) el.classList.add('active');
      }
    }

    // ── Formatering ────────────────────────────────────────────────────────────
    formatPrice(amount) {
      return new Intl.NumberFormat('da-DK', {
        style: 'currency', currency: 'DKK',
        minimumFractionDigits: 0, maximumFractionDigits: 0,
      }).format(amount);
    }

    formatPlate(val) {
      return val.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 7);
    }

    // ── API kald ────────────────────────────────────────────────────────────────
    async lookupPlate(plate) {
      if (CONFIG.demoMode) {
        await new Promise(r => setTimeout(r, 1800));
        const vehicle = MOCK_VEHICLES[plate.toUpperCase()] || {
          brand: 'Ukendt', model: 'Køretøj', variant: '–',
          year: 2018, fuel_type: 'Benzin', mileage: 80000, color: 'Hvid'
        };
        const price = getMockValuation(plate);
        return {
          vehicle: { id: 'mock', ...vehicle },
          valuation: { id: 'mock', adjusted_price: price * 100, expires_at: null }
        };
      }

      const res = await fetch(`${CONFIG.apiBase}/widget/lookup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ license_plate: plate, embed_token: CONFIG.embedToken }),
      });
      if (!res.ok) throw new Error(`Lookup fejlede (${res.status})`);
      return res.json();
    }

    async submitLead(data) {
      if (CONFIG.demoMode) {
        await new Promise(r => setTimeout(r, 1200));
        return { lead_id: 'demo-lead-' + Date.now(), status: 'contact_submitted' };
      }

      const res = await fetch(`${CONFIG.apiBase}/widget/lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          license_plate: this.state.plate,
          valuation_id: this.state.valuation.id,
          customer: data,
          new_car_interest: data.new_car_interest,
          embed_token: CONFIG.embedToken,
        }),
      });
      if (!res.ok) throw new Error(`Lead-oprettelse fejlede (${res.status})`);
      return res.json();
    }

    // ── Events ──────────────────────────────────────────────────────────────────
    bindEvents() {
      // Formater nummerplade mens bruger skriver
      const plateInput = this.$('#plate-input');
      plateInput.addEventListener('input', (e) => {
        const cursor = e.target.selectionStart;
        e.target.value = this.formatPlate(e.target.value);
        try { e.target.setSelectionRange(cursor, cursor); } catch(_) {}
      });

      plateInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.$('#btn-lookup').click();
      });

      // Trin 1 → lookup
      this.$('#btn-lookup').addEventListener('click', () => this.handleLookup());

      // Trin 2 → kontakt
      this.$('#btn-to-contact').addEventListener('click', () => {
        this.setStep(3);
        this.showScreen('contact');
      });

      this.$('#btn-back-plate').addEventListener('click', () => {
        this.setStep(1);
        this.showScreen('plate');
      });

      // Trin 3 → submit
      this.$('#btn-submit').addEventListener('click', () => this.handleSubmit());

      this.$('#btn-back-price').addEventListener('click', () => {
        this.setStep(2);
        this.showScreen('price');
      });
    }

    async handleLookup() {
      const plate = this.formatPlate(this.$('#plate-input').value);
      const errorEl = this.$('#plate-error');

      if (plate.length < 5) {
        errorEl.classList.add('show');
        return;
      }
      errorEl.classList.remove('show');

      this.state.plate = plate;
      this.showScreen('loading');

      try {
        const data = await this.lookupPlate(plate);
        this.state.vehicle = data.vehicle;
        this.state.valuation = data.valuation;

        this.renderCarCard(data.vehicle);
        this.renderPrice(data.valuation.adjusted_price);

        this.setStep(2);
        this.showScreen('price');
      } catch (err) {
        this.setStep(1);
        this.showScreen('plate');
        const e = this.$('#plate-error');
        e.textContent = 'Kunne ikke hente oplysninger. Prøv igen.';
        e.classList.add('show');
      }
    }

    renderCarCard(v) {
      this.$('#car-card').innerHTML = `
        <div class="w-car-title">${v.brand} ${v.model}</div>
        <div class="w-car-sub">${v.variant || ''}</div>
        <div class="w-car-meta">
          <div class="w-car-meta-item">📅 <span>${v.year}</span></div>
          <div class="w-car-meta-item">⛽ <span>${v.fuel_type}</span></div>
          <div class="w-car-meta-item">🛣️ <span>${v.mileage?.toLocaleString('da-DK')} km</span></div>
          ${v.color ? `<div class="w-car-meta-item">🎨 <span>${v.color}</span></div>` : ''}
        </div>
      `;
    }

    renderPrice(priceInOere) {
      const dkk = priceInOere / 100;
      this.$('#price-amount').innerHTML =
        `<span class="w-price-currency">kr.</span> ${Math.round(dkk).toLocaleString('da-DK')}`;
    }

    validateContact() {
      let ok = true;
      const name  = this.$('#input-name').value.trim();
      const email = this.$('#input-email').value.trim();
      const phone = this.$('#input-phone').value.trim();

      const show = (id, show) => this.$(`#${id}`).classList.toggle('show', show);

      if (name.length < 2) { show('err-name', true); ok = false; }
      else show('err-name', false);

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { show('err-email', true); ok = false; }
      else show('err-email', false);

      if (phone.replace(/\D/g,'').length < 8) { show('err-phone', true); ok = false; }
      else show('err-phone', false);

      return ok ? { name, email, phone } : null;
    }

    async handleSubmit() {
      const contact = this.validateContact();
      if (!contact) return;

      const btn = this.$('#btn-submit');
      btn.disabled = true;
      btn.textContent = 'Sender...';

      contact.new_car_interest = this.$('#input-newcar').checked;

      try {
        const result = await this.submitLead(contact);
        this.state.leadId = result.lead_id;
        this.renderSuccess(contact);
        this.showScreen('success');
      } catch (err) {
        btn.disabled = false;
        btn.textContent = 'Send — få dit tilbud';
        alert('Der opstod en fejl. Prøv igen eller kontakt os direkte.');
      }
    }

    renderSuccess(contact) {
      const v = this.state.vehicle;
      const price = this.state.valuation.adjusted_price / 100;
      this.$('#success-detail').innerHTML = `
        <div class="w-success-detail-row">
          <span>Bil</span>
          <strong>${v.brand} ${v.model} (${v.year})</strong>
        </div>
        <div class="w-success-detail-row">
          <span>Estimeret pris</span>
          <strong>${Math.round(price).toLocaleString('da-DK')} kr.</strong>
        </div>
        <div class="w-success-detail-row">
          <span>Kontakt til</span>
          <strong>${contact.email}</strong>
        </div>
        ${contact.new_car_interest ? `
        <div class="w-success-detail-row">
          <span>Ny bil</span>
          <strong>✓ Vi finder dig et tilbud</strong>
        </div>` : ''}
      `;
    }
  }

  // ─── Bootstrap ───────────────────────────────────────────────────────────────
  function mount() {
    const container = document.getElementById(CONFIG.containerId);
    if (!container) {
      console.warn(`[CARZILLA Byttepris] Ingen container med id="${CONFIG.containerId}" fundet.`);
      return;
    }
    new TjekBilWidget(container);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }

})();
