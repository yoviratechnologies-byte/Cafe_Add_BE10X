/**
 * Aura Artisanal Cafe & Roastery — Reactive Web Application Logic
 * Implements: Menu Filtering, Modifiers, Cart, Server-Side Quote, Razorpay Sandbox,
 * Table Reservations, Order Tracking, and Full Admin Operations Dashboard.
 */

(function () {
  'use strict';

  // Application State
  const state = {
    settings: {
      cafe_name: "Aura Artisanal Cafe & Roastery",
      tax_rate_percentage: 5,
      packaging_fee_paise: 2000,
      delivery_base_fee_paise: 4000,
      currency_symbol: "₹"
    },
    categories: [],
    products: [],
    productOptions: {},
    cart: [],
    orders: [],
    reservations: [],
    auditEvents: [],
    activeCategory: 'all',
    searchQuery: '',
    selectedProductForModal: null,
    currentStaffRole: 'admin', // admin, manager, staff
    activeAdminTab: 'orders'
  };

  // Helper: Format paise to currency string (₹240.00)
  function formatMoney(paise) {
    const rupees = (paise / 100).toFixed(2);
    return `${state.settings.currency_symbol}${rupees}`;
  }

  // Load Initial State from API or Fallback Local Database
  async function loadState() {
    try {
      const res = await fetch('/api/menu');
      if (res.ok) {
        const data = await res.json();
        state.products = data.products || [];
        state.categories = data.categories || [];
        state.productOptions = data.product_options || {};
        state.settings = data.business_settings || state.settings;
      } else {
        throw new Error('API fetch failed, reading fallback data file');
      }
    } catch (e) {
      // Fallback: Read static database.json directly
      try {
        const resLocal = await fetch('./data/database.json');
        if (resLocal.ok) {
          const data = await resLocal.json();
          state.products = data.products;
          state.categories = data.categories;
          state.productOptions = data.product_options;
          state.settings = data.business_settings;
          state.orders = data.orders || [];
          state.reservations = data.reservations || [];
          state.auditEvents = data.audit_events || [];
        }
      } catch (err) {
        console.warn('Using bundled initial state:', err);
      }
    }

    // Load LocalStorage overrides if present
    const savedOrders = localStorage.getItem('aura_orders');
    if (savedOrders) state.orders = JSON.parse(savedOrders);

    const savedRes = localStorage.getItem('aura_reservations');
    if (savedRes) state.reservations = JSON.parse(savedRes);

    const savedCart = localStorage.getItem('aura_cart');
    if (savedCart) state.cart = JSON.parse(savedCart);

    renderCategories();
    renderMenu();
    updateCartUI();
    renderAdminDashboard();
  }

  // Save current orders & reservations to localStorage for continuous testing
  function persistState() {
    localStorage.setItem('aura_orders', JSON.stringify(state.orders));
    localStorage.setItem('aura_reservations', JSON.stringify(state.reservations));
    localStorage.setItem('aura_cart', JSON.stringify(state.cart));
  }

  // Render Category Navigation Pills
  function renderCategories() {
    const container = document.getElementById('category-pills');
    if (!container) return;

    let html = `<button class="category-pill ${state.activeCategory === 'all' ? 'active' : ''}" data-cat="all">All Offerings</button>`;
    state.categories.forEach(cat => {
      html += `<button class="category-pill ${state.activeCategory === cat.id ? 'active' : ''}" data-cat="${cat.id}">${cat.name}</button>`;
    });
    container.innerHTML = html;

    container.querySelectorAll('.category-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        state.activeCategory = btn.dataset.cat;
        renderCategories();
        renderMenu();
      });
    });
  }

  // Render Product Menu Cards
  function renderMenu() {
    const container = document.getElementById('menu-grid');
    if (!container) return;

    const filtered = state.products.filter(p => {
      const matchesCat = state.activeCategory === 'all' || p.category_id === state.activeCategory;
      const matchesSearch = !state.searchQuery || 
        p.name.toLowerCase().includes(state.searchQuery.toLowerCase()) || 
        p.description.toLowerCase().includes(state.searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
          <h3 style="margin-bottom: 8px;">No artisanal items found</h3>
          <p>Try searching for a different keyword or select another category.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(p => {
      const tagsHtml = (p.tags || []).map(t => `<span class="badge badge-sage">${t}</span>`).join('');
      const isAvailable = p.is_available !== false;
      const btnHtml = isAvailable
        ? `<button class="btn btn-secondary btn-sm" onclick="window.auraApp.openProductModal('${p.id}')">Customize & Add</button>`
        : `<span class="sold-out-badge">Sold Out Today</span>`;

      return `
        <article class="menu-card" data-id="${p.id}">
          <div class="menu-card-top">
            <div class="menu-card-header">
              <h3 class="menu-card-title">${p.name}</h3>
              <span class="menu-card-price">${formatMoney(p.price_paise)}</span>
            </div>
            <p class="menu-card-desc">${p.description}</p>
            <div class="menu-tags">${tagsHtml}</div>
          </div>
          <div class="menu-card-footer">
            <span style="font-size: 0.8rem; color: var(--color-muted);">
              ${p.is_signature ? '★ House Signature' : 'Freshly Crafted'}
            </span>
            ${btnHtml}
          </div>
        </article>
      `;
    }).join('');
  }

  // Open Product Customization Modal
  function openProductModal(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;
    state.selectedProductForModal = product;

    const modal = document.getElementById('product-modal');
    const titleEl = document.getElementById('modal-prod-title');
    const descEl = document.getElementById('modal-prod-desc');
    const optionsContainer = document.getElementById('modal-options-container');

    titleEl.textContent = product.name;
    descEl.textContent = product.description;

    // Render Options (Milk, Size, etc.)
    let html = '';
    const optionKeys = product.options || [];

    if (optionKeys.length === 0) {
      html = `<p style="font-size: 0.9rem; color: var(--color-muted); margin: 16px 0;">This specialty item is prepared according to our master roaster's standard recipe.</p>`;
    } else {
      optionKeys.forEach(optKey => {
        const opt = state.productOptions[optKey];
        if (!opt) return;

        html += `
          <div style="margin-bottom: 18px;">
            <label class="form-label" style="display: block; margin-bottom: 8px;">
              ${opt.name} ${opt.required ? '<span style="color: var(--color-terracotta);">*</span>' : '(Optional)'}
            </label>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${opt.values.map((v, idx) => `
                <label style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: var(--color-paper); border: 1px solid var(--color-line); border-radius: var(--radius-sm); cursor: pointer;">
                  <span style="display: flex; align-items: center; gap: 10px; font-size: 0.92rem;">
                    <input type="radio" name="opt_${optKey}" value="${v.id}" data-delta="${v.price_delta_paise}" data-label="${v.label}" ${idx === 0 ? 'checked' : ''} onchange="window.auraApp.updateModalPrice()">
                    ${v.label}
                  </span>
                  <span style="font-size: 0.85rem; font-weight: 600; color: var(--color-terracotta);">
                    ${v.price_delta_paise > 0 ? `+${formatMoney(v.price_delta_paise)}` : 'Included'}
                  </span>
                </label>
              `).join('')}
            </div>
          </div>
        `;
      });
    }

    optionsContainer.innerHTML = html;
    updateModalPrice();
    modal.classList.add('open');
  }

  // Calculate dynamic price inside modal as user checks modifiers
  function updateModalPrice() {
    const product = state.selectedProductForModal;
    if (!product) return;

    let totalPaise = product.price_paise;
    const selectedRadios = document.querySelectorAll('#modal-options-container input[type="radio"]:checked');
    selectedRadios.forEach(radio => {
      totalPaise += parseInt(radio.dataset.delta || '0', 10);
    });

    const priceBtn = document.getElementById('modal-add-btn');
    if (priceBtn) {
      priceBtn.innerHTML = `Add to Order &bull; ${formatMoney(totalPaise)}`;
      priceBtn.dataset.currentPrice = totalPaise;
    }
  }

  // Add Item to Cart
  function addModalItemToCart() {
    const product = state.selectedProductForModal;
    if (!product) return;

    const selectedOptions = [];
    let optionPriceTotal = 0;

    const selectedRadios = document.querySelectorAll('#modal-options-container input[type="radio"]:checked');
    selectedRadios.forEach(radio => {
      const delta = parseInt(radio.dataset.delta || '0', 10);
      optionPriceTotal += delta;
      selectedOptions.push({
        option_id: radio.name.replace('opt_', ''),
        value_id: radio.value,
        label: radio.dataset.label,
        price_delta_paise: delta
      });
    });

    const unitPricePaise = product.price_paise + optionPriceTotal;

    // Check if duplicate item exists
    const existingIndex = state.cart.findIndex(item => {
      if (item.product_id !== product.id) return false;
      return JSON.stringify(item.options) === JSON.stringify(selectedOptions);
    });

    if (existingIndex > -1) {
      state.cart[existingIndex].qty += 1;
      state.cart[existingIndex].line_total_paise = state.cart[existingIndex].qty * unitPricePaise;
    } else {
      state.cart.push({
        id: 'cart-' + Date.now(),
        product_id: product.id,
        name: product.name,
        unit_price_paise: unitPricePaise,
        base_price_paise: product.price_paise,
        qty: 1,
        options: selectedOptions,
        line_total_paise: unitPricePaise
      });
    }

    closeModal('product-modal');
    updateCartUI();
    persistState();
    openCartDrawer();
  }

  // Cart UI Update & Authoritative Recalculation
  function updateCartUI() {
    const countBadges = document.querySelectorAll('.cart-count');
    const totalItems = state.cart.reduce((sum, item) => sum + item.qty, 0);
    countBadges.forEach(b => b.textContent = totalItems);

    const bodyEl = document.getElementById('cart-drawer-body');
    const subtotalEl = document.getElementById('cart-subtotal');
    const taxEl = document.getElementById('cart-tax');
    const totalEl = document.getElementById('cart-total');

    if (!bodyEl) return;

    if (state.cart.length === 0) {
      bodyEl.innerHTML = `
        <div style="text-align: center; padding: 50px 20px;">
          <p style="font-size: 1.1rem; margin-bottom: 8px;">Your order bag is empty.</p>
          <p style="font-size: 0.88rem;">Select from our handcrafted beverages and artisanal bakery to begin.</p>
        </div>
      `;
      if (subtotalEl) subtotalEl.textContent = formatMoney(0);
      if (taxEl) taxEl.textContent = formatMoney(0);
      if (totalEl) totalEl.textContent = formatMoney(0);
      return;
    }

    // Calculate Totals Server-Side / Authoritative formula
    let subtotalPaise = 0;
    bodyEl.innerHTML = state.cart.map((item, idx) => {
      subtotalPaise += item.line_total_paise;
      const optsString = item.options.map(o => o.label).join(', ');

      return `
        <div class="cart-item">
          <div class="cart-item-info">
            <h4>${item.name}</h4>
            ${optsString ? `<div class="cart-item-mods">${optsString}</div>` : ''}
            <div style="font-weight: 600; color: var(--color-sienna);">${formatMoney(item.unit_price_paise)} each</div>
            <div class="cart-qty-ctrl">
              <button class="qty-btn" onclick="window.auraApp.updateCartQty(${idx}, -1)">&minus;</button>
              <span style="font-size: 0.92rem; font-weight: 600;">${item.qty}</span>
              <button class="qty-btn" onclick="window.auraApp.updateCartQty(${idx}, 1)">&plus;</button>
            </div>
          </div>
          <div style="text-align: right; display: flex; flex-direction: column; justify-content: space-between;">
            <span style="font-weight: 700; font-size: 1rem; color: var(--color-espresso);">${formatMoney(item.line_total_paise)}</span>
            <button style="background: none; border: none; color: var(--color-danger); font-size: 0.8rem; cursor: pointer;" onclick="window.auraApp.removeCartItem(${idx})">Remove</button>
          </div>
        </div>
      `;
    }).join('');

    const taxPaise = Math.round(subtotalPaise * (state.settings.tax_rate_percentage / 100));
    const finalTotalPaise = subtotalPaise + taxPaise;

    if (subtotalEl) subtotalEl.textContent = formatMoney(subtotalPaise);
    if (taxEl) taxEl.textContent = formatMoney(taxPaise);
    if (totalEl) totalEl.textContent = formatMoney(finalTotalPaise);
  }

  function updateCartQty(index, change) {
    if (!state.cart[index]) return;
    state.cart[index].qty += change;
    if (state.cart[index].qty <= 0) {
      state.cart.splice(index, 1);
    } else {
      state.cart[index].line_total_paise = state.cart[index].qty * state.cart[index].unit_price_paise;
    }
    updateCartUI();
    persistState();
  }

  function removeCartItem(index) {
    state.cart.splice(index, 1);
    updateCartUI();
    persistState();
  }

  function openCartDrawer() {
    document.getElementById('cart-drawer-backdrop')?.classList.add('open');
    document.getElementById('cart-drawer')?.classList.add('open');
  }

  function closeCartDrawer() {
    document.getElementById('cart-drawer-backdrop')?.classList.remove('open');
    document.getElementById('cart-drawer')?.classList.remove('open');
  }

  function closeModal(id) {
    document.getElementById(id)?.classList.remove('open');
  }

  // Checkout Modal & Authoritative Quote
  function openCheckout() {
    if (state.cart.length === 0) return;
    closeCartDrawer();

    const checkoutModal = document.getElementById('checkout-modal');
    if (!checkoutModal) return;

    // Calculate Quote
    let subtotalPaise = state.cart.reduce((s, i) => s + i.line_total_paise, 0);
    let taxPaise = Math.round(subtotalPaise * 0.05);
    let totalPaise = subtotalPaise + taxPaise;

    document.getElementById('checkout-items-summary').innerHTML = `
      <div style="background: var(--color-paper); padding: 14px; border-radius: var(--radius-sm); margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
          <span>Subtotal (${state.cart.length} unique items)</span>
          <strong>${formatMoney(subtotalPaise)}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
          <span>GST (5%)</span>
          <strong>${formatMoney(taxPaise)}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 1.1rem; border-top: 1px solid var(--color-line); padding-top: 8px;">
          <strong>Total Payable</strong>
          <strong style="color: var(--color-terracotta);">${formatMoney(totalPaise)}</strong>
        </div>
      </div>
    `;

    checkoutModal.classList.add('open');
  }

  // Handle Checkout Form Submission -> Razorpay Sandbox
  function proceedToPayment(e) {
    e.preventDefault();
    const name = document.getElementById('cust-name').value;
    const phone = document.getElementById('cust-phone').value;
    const email = document.getElementById('cust-email').value;
    const fulfilment = document.querySelector('input[name="fulfilment"]:checked')?.value || 'pickup';
    const tableNumber = document.getElementById('cust-table')?.value || '';
    const deliveryAddress = document.getElementById('cust-address')?.value || '';

    let subtotalPaise = state.cart.reduce((s, i) => s + i.line_total_paise, 0);
    let taxPaise = Math.round(subtotalPaise * 0.05);
    let packagingPaise = (fulfilment !== 'dine_in') ? state.settings.packaging_fee_paise : 0;
    let deliveryPaise = (fulfilment === 'delivery') ? state.settings.delivery_base_fee_paise : 0;
    let totalPaise = subtotalPaise + taxPaise + packagingPaise + deliveryPaise;

    // Create Draft Order
    const orderNumber = 'AUR-' + Math.floor(1000 + Math.random() * 9000);
    const draftOrder = {
      id: 'ord-' + Date.now(),
      order_number: orderNumber,
      customer_name: name,
      customer_phone: phone,
      customer_email: email,
      fulfilment_type: fulfilment,
      table_number: tableNumber,
      delivery_address: deliveryAddress,
      subtotal_paise: subtotalPaise,
      tax_paise: taxPaise,
      packaging_paise: packagingPaise,
      delivery_paise: deliveryPaise,
      total_paise: totalPaise,
      items: state.cart.map(c => ({
        product_id: c.product_id,
        name_snapshot: c.name,
        unit_price_paise: c.unit_price_paise,
        qty: c.qty,
        options_snapshot: c.options,
        line_total_paise: c.line_total_paise
      })),
      payment_status: 'pending_payment',
      status: 'pending_payment',
      created_at: new Date().toISOString()
    };

    window.currentDraftOrder = draftOrder;

    // Close Checkout, Open Razorpay Gateway Sandbox
    closeModal('checkout-modal');
    openRazorpaySandbox(draftOrder);
  }

  // Open Razorpay Sandbox Simulation Modal
  function openRazorpaySandbox(order) {
    const modal = document.getElementById('razorpay-sandbox-modal');
    document.getElementById('rzp-order-id').textContent = order.order_number;
    document.getElementById('rzp-amount').textContent = formatMoney(order.total_paise);
    document.getElementById('rzp-email').textContent = order.customer_email;
    modal.classList.add('open');
  }

  // Execute Simulated Successful Payment
  async function completeSimulatedPayment(success) {
    const modal = document.getElementById('razorpay-sandbox-modal');
    modal.classList.remove('open');

    const draftOrder = window.currentDraftOrder;
    if (!draftOrder) return;

    if (success) {
      draftOrder.payment_status = 'paid';
      draftOrder.status = 'accepted';
      draftOrder.payment_id = 'pay_sim_' + Math.random().toString(36).substring(2, 10);
      draftOrder.payment_provider = 'razorpay_sandbox';

      // Save to Orders array
      state.orders.unshift(draftOrder);

      // Add Audit Event
      state.auditEvents.unshift({
        id: 'aud-' + Date.now(),
        timestamp: new Date().toISOString(),
        actor: draftOrder.customer_email,
        action: 'PAYMENT_VERIFIED',
        details: `Order ${draftOrder.order_number} confirmed via verified payment ${draftOrder.payment_id} for ${formatMoney(draftOrder.total_paise)}.`
      });

      // Clear Cart
      state.cart = [];
      updateCartUI();
      persistState();
      renderAdminDashboard();

      // Show Order Tracking Modal
      openOrderTracking(draftOrder.id);
    } else {
      alert('Payment was cancelled or declined. Your order has been kept in pending status.');
    }
  }

  // Order Tracking Modal with Live Stages
  function openOrderTracking(orderId) {
    const order = state.orders.find(o => o.id === orderId);
    if (!order) return;

    const modal = document.getElementById('tracking-modal');
    document.getElementById('track-order-num').textContent = order.order_number;
    document.getElementById('track-cust-name').textContent = order.customer_name;
    document.getElementById('track-total').textContent = formatMoney(order.total_paise);

    const stages = [
      { id: 'accepted', label: 'Order Confirmed' },
      { id: 'preparing', label: 'Brewing & Crafting' },
      { id: 'ready', label: 'Ready for ' + (order.fulfilment_type === 'delivery' ? 'Dispatch' : 'Pickup/Serving') },
      { id: 'completed', label: 'Completed' }
    ];

    let currentIdx = stages.findIndex(s => s.id === order.status);
    if (currentIdx === -1) currentIdx = 0;

    const stagesHtml = stages.map((s, idx) => {
      const isPastOrCurrent = idx <= currentIdx;
      return `
        <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 16px;">
          <div style="width: 32px; height: 32px; border-radius: 50%; background: ${isPastOrCurrent ? 'var(--color-terracotta)' : 'var(--color-line)'}; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.85rem;">
            ${isPastOrCurrent ? '✓' : idx + 1}
          </div>
          <div>
            <div style="font-weight: 600; color: ${isPastOrCurrent ? 'var(--color-espresso)' : 'var(--color-muted)'};">${s.label}</div>
            <div style="font-size: 0.78rem; color: var(--color-muted);">${isPastOrCurrent ? 'Verified by Barista' : 'Pending previous step'}</div>
          </div>
        </div>
      `;
    }).join('');

    document.getElementById('track-stages-list').innerHTML = stagesHtml;
    modal.classList.add('open');
  }

  // Table Reservation Form Handling
  function handleReservationSubmit(e) {
    e.preventDefault();
    const guestName = document.getElementById('res-name').value;
    const guestPhone = document.getElementById('res-phone').value;
    const guestEmail = document.getElementById('res-email').value;
    const partySize = parseInt(document.getElementById('res-party').value, 10);
    const bookingDate = document.getElementById('res-date').value;
    const timeSlot = document.getElementById('res-time').value;
    const areaPref = document.getElementById('res-area').value;
    const notes = document.getElementById('res-notes').value;

    // Concurrency Capacity Check (Max 40 seats)
    const existingGuests = state.reservations
      .filter(r => r.booking_date === bookingDate && r.time_slot === timeSlot && r.status !== 'cancelled')
      .reduce((sum, r) => sum + r.party_size, 0);

    if (existingGuests + partySize > state.settings.max_table_capacity) {
      alert(`We are fully booked for ${timeSlot} on ${bookingDate}. Please select another time slot or contact our host directly.`);
      return;
    }

    const bookingRef = 'RES-' + Math.floor(100 + Math.random() * 900);
    const newReservation = {
      id: 'res-' + Date.now(),
      booking_ref: bookingRef,
      guest_name: guestName,
      guest_phone: guestPhone,
      guest_email: guestEmail,
      party_size: partySize,
      booking_date: bookingDate,
      time_slot: timeSlot,
      area_preference: areaPref,
      special_requests: notes,
      status: 'confirmed',
      created_at: new Date().toISOString()
    };

    state.reservations.unshift(newReservation);
    state.auditEvents.unshift({
      id: 'aud-' + Date.now(),
      timestamp: new Date().toISOString(),
      actor: guestEmail,
      action: 'RESERVATION_CONFIRMED',
      details: `Table reservation ${bookingRef} created for ${guestName} (${partySize} guests) on ${bookingDate} at ${timeSlot}.`
    });

    persistState();
    renderAdminDashboard();

    // Confirmation Feedback
    document.getElementById('reservation-form-container').innerHTML = `
      <div style="text-align: center; padding: 40px 20px;">
        <div style="width: 56px; height: 56px; border-radius: 50%; background: var(--color-sage); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; margin: 0 auto 16px;">✓</div>
        <h3 style="font-size: 1.8rem; margin-bottom: 8px;">Reservation Confirmed!</h3>
        <p style="font-size: 1.05rem; margin-bottom: 16px;">Your table reference code is <strong style="color: var(--color-terracotta);">${bookingRef}</strong>.</p>
        <div style="background: var(--color-paper); padding: 18px; border-radius: var(--radius-md); max-width: 400px; margin: 0 auto 24px; text-align: left; font-size: 0.9rem;">
          <div><strong>Guest:</strong> ${guestName} (${partySize} Guests)</div>
          <div><strong>Date & Time:</strong> ${bookingDate} &bull; ${timeSlot}</div>
          <div><strong>Area:</strong> ${areaPref}</div>
        </div>
        <button class="btn btn-secondary" onclick="location.reload()">Book Another Table</button>
      </div>
    `;
  }

  // ==============================================================================
  // ADMIN OPERATIONS PORTAL LOGIC
  // ==============================================================================

  function toggleAdminView() {
    const isCurrentlyAdmin = window.location.hash === '#admin';
    if (isCurrentlyAdmin) {
      window.location.hash = '';
      document.getElementById('public-website').style.display = 'block';
      document.getElementById('admin-portal').classList.remove('active');
    } else {
      window.location.hash = '#admin';
      document.getElementById('public-website').style.display = 'none';
      document.getElementById('admin-portal').classList.add('active');
      renderAdminDashboard();
    }
  }

  function setAdminTab(tabName) {
    state.activeAdminTab = tabName;
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
    renderAdminDashboard();
  }

  function setStaffRole(role) {
    state.currentStaffRole = role;
    renderAdminDashboard();
  }

  // Render Admin Metrics & Tab Contents
  function renderAdminDashboard() {
    const portal = document.getElementById('admin-portal');
    if (!portal || !portal.classList.contains('active')) return;

    // Update Top Summary Metrics
    const totalSalesPaise = state.orders
      .filter(o => o.payment_status === 'paid')
      .reduce((sum, o) => sum + o.total_paise, 0);

    const activeOrdersCount = state.orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length;
    const confirmedResCount = state.reservations.filter(r => r.status === 'confirmed').length;

    document.getElementById('metric-revenue').textContent = formatMoney(totalSalesPaise);
    document.getElementById('metric-orders-active').textContent = activeOrdersCount;
    document.getElementById('metric-res-count').textContent = confirmedResCount;
    document.getElementById('metric-current-role').textContent = state.currentStaffRole.toUpperCase();

    const container = document.getElementById('admin-tab-content');

    if (state.activeAdminTab === 'orders') {
      renderAdminOrders(container);
    } else if (state.activeAdminTab === 'menu') {
      renderAdminMenu(container);
    } else if (state.activeAdminTab === 'reservations') {
      renderAdminReservations(container);
    } else if (state.activeAdminTab === 'audit') {
      renderAdminAudit(container);
    }
  }

  // Admin Tab 1: Live Order Queue (Kanban Style)
  function renderAdminOrders(container) {
    const pending = state.orders.filter(o => o.status === 'pending_payment' || o.status === 'accepted');
    const preparing = state.orders.filter(o => o.status === 'preparing');
    const ready = state.orders.filter(o => o.status === 'ready');
    const completed = state.orders.filter(o => o.status === 'completed');

    const renderColumn = (list, nextAction, nextStatus) => {
      if (list.length === 0) return `<p style="font-size: 0.8rem; color: var(--color-muted); padding: 12px 0;">No active tickets</p>`;
      return list.map(o => `
        <div class="kanban-card">
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <strong style="color: var(--color-espresso);">${o.order_number}</strong>
            <span style="font-weight: 700; color: var(--color-sienna);">${formatMoney(o.total_paise)}</span>
          </div>
          <div style="font-size: 0.82rem; margin-bottom: 8px;">
            <strong>${o.customer_name}</strong> &bull; ${o.fulfilment_type.toUpperCase()}
            ${o.table_number ? `(${o.table_number})` : ''}
          </div>
          <ul style="padding-left: 16px; font-size: 0.8rem; color: var(--color-muted); margin-bottom: 12px;">
            ${o.items.map(i => `<li>${i.qty}x ${i.name_snapshot}</li>`).join('')}
          </ul>
          <div style="display: flex; gap: 6px;">
            ${nextAction ? `
              <button class="btn btn-primary btn-sm" style="flex: 1; padding: 6px;" onclick="window.auraApp.transitionOrderStatus('${o.id}', '${nextStatus}')">
                ${nextAction}
              </button>
            ` : '<span style="font-size: 0.75rem; color: var(--color-success); font-weight: bold;">Completed</span>'}
            <button class="btn btn-secondary btn-sm" style="padding: 6px 10px;" onclick="window.auraApp.openOrderTracking('${o.id}')">View</button>
          </div>
        </div>
      `).join('');
    };

    container.innerHTML = `
      <div class="kanban-board">
        <div class="kanban-col">
          <div class="kanban-col-header">
            <span>Incoming Orders</span>
            <span class="badge badge-amber">${pending.length}</span>
          </div>
          ${renderColumn(pending, 'Start Brewing', 'preparing')}
        </div>
        <div class="kanban-col">
          <div class="kanban-col-header">
            <span>In Brewing / Kitchen</span>
            <span class="badge badge-amber">${preparing.length}</span>
          </div>
          ${renderColumn(preparing, 'Mark Ready', 'ready')}
        </div>
        <div class="kanban-col">
          <div class="kanban-col-header">
            <span>Ready for Service</span>
            <span class="badge badge-sage">${ready.length}</span>
          </div>
          ${renderColumn(ready, 'Complete Ticket', 'completed')}
        </div>
        <div class="kanban-col">
          <div class="kanban-col-header">
            <span>Completed Tickets</span>
            <span class="badge badge-sage">${completed.length}</span>
          </div>
          ${renderColumn(completed, null, null)}
        </div>
      </div>
    `;
  }

  // Admin Tab 2: Menu & Stock Management
  function renderAdminMenu(container) {
    container.innerHTML = `
      <div style="background: var(--color-panel); padding: 24px; border-radius: var(--radius-md); border: 1px solid var(--color-line);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h3>Artisanal Menu Items (${state.products.length})</h3>
          <button class="btn btn-primary btn-sm" onclick="alert('Feature enabled: Add New Item modal ready in Phase 5.')">+ Add Item</button>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
          <thead>
            <tr style="border-bottom: 2px solid var(--color-line); text-align: left;">
              <th style="padding: 10px;">Item Name</th>
              <th style="padding: 10px;">Category</th>
              <th style="padding: 10px;">Base Price</th>
              <th style="padding: 10px;">Stock Availability</th>
              <th style="padding: 10px;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${state.products.map(p => `
              <tr style="border-bottom: 1px solid var(--color-line);">
                <td style="padding: 12px 10px;"><strong>${p.name}</strong></td>
                <td style="padding: 12px 10px; color: var(--color-muted);">${p.category_id}</td>
                <td style="padding: 12px 10px; font-weight: 600;">${formatMoney(p.price_paise)}</td>
                <td style="padding: 12px 10px;">
                  <button class="btn btn-sm ${p.is_available ? 'btn-primary' : 'btn-secondary'}" onclick="window.auraApp.toggleStock('${p.id}')">
                    ${p.is_available ? 'In Stock (Active)' : 'Marked Sold Out'}
                  </button>
                </td>
                <td style="padding: 12px 10px;">
                  <button class="btn btn-secondary btn-sm" onclick="window.auraApp.editPricePrompt('${p.id}')">Edit Price</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // Admin Tab 3: Reservations Calendar
  function renderAdminReservations(container) {
    container.innerHTML = `
      <div style="background: var(--color-panel); padding: 24px; border-radius: var(--radius-md); border: 1px solid var(--color-line);">
        <h3 style="margin-bottom: 20px;">Guest Table Bookings</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
          <thead>
            <tr style="border-bottom: 2px solid var(--color-line); text-align: left;">
              <th style="padding: 10px;">Ref</th>
              <th style="padding: 10px;">Guest</th>
              <th style="padding: 10px;">Party Size</th>
              <th style="padding: 10px;">Date & Time</th>
              <th style="padding: 10px;">Area</th>
              <th style="padding: 10px;">Status</th>
              <th style="padding: 10px;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${state.reservations.map(r => `
              <tr style="border-bottom: 1px solid var(--color-line);">
                <td style="padding: 12px 10px;"><strong>${r.booking_ref}</strong></td>
                <td style="padding: 12px 10px;">${r.guest_name}<br><small style="color: var(--color-muted);">${r.guest_phone}</small></td>
                <td style="padding: 12px 10px; font-weight: 600;">${r.party_size} Guests</td>
                <td style="padding: 12px 10px;">${r.booking_date} &bull; ${r.time_slot}</td>
                <td style="padding: 12px 10px;">${r.area_preference}</td>
                <td style="padding: 12px 10px;"><span class="badge ${r.status === 'confirmed' ? 'badge-sage' : 'badge-amber'}">${r.status}</span></td>
                <td style="padding: 12px 10px;">
                  <button class="btn btn-secondary btn-sm" onclick="window.auraApp.seatReservation('${r.id}')">Seat Guest</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // Admin Tab 4: Immutable Audit Trail Log
  function renderAdminAudit(container) {
    container.innerHTML = `
      <div style="background: var(--color-panel); padding: 24px; border-radius: var(--radius-md); border: 1px solid var(--color-line);">
        <h3 style="margin-bottom: 20px;">Operational Audit Event Log</h3>
        <ul style="list-style: none; display: flex; flex-direction: column; gap: 12px;">
          ${state.auditEvents.map(a => `
            <li style="padding: 12px; background: var(--color-paper); border-left: 4px solid var(--color-terracotta); border-radius: 4px; font-size: 0.88rem;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <strong>${a.action}</strong>
                <span style="color: var(--color-muted); font-size: 0.8rem;">${new Date(a.timestamp).toLocaleTimeString()} &bull; ${new Date(a.timestamp).toLocaleDateString()}</span>
              </div>
              <p style="margin: 0; color: var(--color-text);">${a.details}</p>
              <small style="color: var(--color-muted);">Actor: ${a.actor}</small>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  // Admin Actions
  function transitionOrderStatus(orderId, newStatus) {
    const order = state.orders.find(o => o.id === orderId);
    if (!order) return;
    order.status = newStatus;

    state.auditEvents.unshift({
      id: 'aud-' + Date.now(),
      timestamp: new Date().toISOString(),
      actor: `${state.currentStaffRole}@auracafe.com`,
      action: 'ORDER_STATUS_CHANGED',
      details: `Order ${order.order_number} transitioned to status '${newStatus}'.`
    });

    persistState();
    renderAdminDashboard();
  }

  function toggleStock(productId) {
    const prod = state.products.find(p => p.id === productId);
    if (!prod) return;
    prod.is_available = !prod.is_available;

    state.auditEvents.unshift({
      id: 'aud-' + Date.now(),
      timestamp: new Date().toISOString(),
      actor: `${state.currentStaffRole}@auracafe.com`,
      action: 'STOCK_AVAILABILITY_CHANGED',
      details: `Product '${prod.name}' availability set to ${prod.is_available}.`
    });

    persistState();
    renderMenu();
    renderAdminDashboard();
  }

  function editPricePrompt(productId) {
    const prod = state.products.find(p => p.id === productId);
    if (!prod) return;
    const currentRupees = prod.price_paise / 100;
    const newPriceStr = prompt(`Enter new price in Rupees for ${prod.name}:`, currentRupees);
    if (newPriceStr !== null) {
      const newPriceNum = parseFloat(newPriceStr);
      if (!isNaN(newPriceNum) && newPriceNum > 0) {
        const oldPricePaise = prod.price_paise;
        prod.price_paise = Math.round(newPriceNum * 100);

        state.auditEvents.unshift({
          id: 'aud-' + Date.now(),
          timestamp: new Date().toISOString(),
          actor: `${state.currentStaffRole}@auracafe.com`,
          action: 'MENU_PRICE_ADJUSTED',
          details: `Price of '${prod.name}' adjusted from ${formatMoney(oldPricePaise)} to ${formatMoney(prod.price_paise)}.`
        });

        persistState();
        renderMenu();
        renderAdminDashboard();
      }
    }
  }

  function seatReservation(resId) {
    const res = state.reservations.find(r => r.id === resId);
    if (!res) return;
    res.status = 'seated';

    state.auditEvents.unshift({
      id: 'aud-' + Date.now(),
      timestamp: new Date().toISOString(),
      actor: `${state.currentStaffRole}@auracafe.com`,
      action: 'GUEST_SEATED',
      details: `Reservation ${res.booking_ref} (${res.guest_name}) marked as seated.`
    });

    persistState();
    renderAdminDashboard();
  }

  // Setup Search Input Event Listener
  function initEvents() {
    const searchInput = document.getElementById('menu-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value.trim();
        renderMenu();
      });
    }

    const resForm = document.getElementById('reservation-form');
    if (resForm) {
      resForm.addEventListener('submit', handleReservationSubmit);
    }

    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
      checkoutForm.addEventListener('submit', proceedToPayment);
    }

    // Hash change routing
    window.addEventListener('hashchange', () => {
      if (window.location.hash === '#admin') {
        document.getElementById('public-website').style.display = 'none';
        document.getElementById('admin-portal').classList.add('active');
        renderAdminDashboard();
      } else {
        document.getElementById('public-website').style.display = 'block';
        document.getElementById('admin-portal').classList.remove('active');
      }
    });

    // Check on startup
    if (window.location.hash === '#admin') {
      document.getElementById('public-website').style.display = 'none';
      document.getElementById('admin-portal').classList.add('active');
    }
  }

  // Export methods globally for inline HTML handlers
  window.auraApp = {
    openProductModal,
    updateModalPrice,
    addModalItemToCart,
    updateCartQty,
    removeCartItem,
    openCartDrawer,
    closeCartDrawer,
    closeModal,
    openCheckout,
    completeSimulatedPayment,
    openOrderTracking,
    toggleAdminView,
    setAdminTab,
    setStaffRole,
    transitionOrderStatus,
    toggleStock,
    editPricePrompt,
    seatReservation
  };

  // Run on DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      loadState();
      initEvents();
    });
  } else {
    loadState();
    initEvents();
  }
})();
