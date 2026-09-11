(function () {
  'use strict';

  const STORAGE_KEYS = {
    THEME: 'car_theme',
    FAVORITES: 'car_favorites',
    FILTERS: 'car_filters',
  };

  const FILTER_CONFIG = {
    origins: [
      { key: 'all', label: '全部', emoji: '🌍', cls: '' },
      { key: '德', label: '德系', emoji: '🇩🇪', cls: 'origin-de' },
      { key: '日', label: '日系', emoji: '🇯🇵', cls: 'origin-jp' },
      { key: '美', label: '美系', emoji: '🇺🇸', cls: 'origin-us' },
      { key: '中', label: '国产', emoji: '🇨🇳', cls: 'origin-cn' },
      { key: '英', label: '英系', emoji: '🇬🇧', cls: 'origin-uk' },
      { key: '法', label: '法系', emoji: '🇫🇷', cls: 'origin-fr' },
      { key: '韩', label: '韩系', emoji: '🇰🇷', cls: 'origin-kr' },
      { key: '意', label: '意系', emoji: '🇮🇹', cls: 'origin-it' },
    ],
    classes: [
      { key: 'all', label: '全部', emoji: '🚗', cls: '' },
      { key: '微型车', label: '微型车', emoji: '🚙', cls: 'vc-micro' },
      { key: '小型车', label: '小型车', emoji: '🚗', cls: 'vc-small' },
      { key: '紧凑型', label: '紧凑型', emoji: '🚘', cls: 'vc-compact' },
      { key: '中型车', label: '中型车', emoji: '🚖', cls: 'vc-mid' },
      { key: '中大型', label: '中大型', emoji: '🚕', cls: 'vc-large-mid' },
      { key: '大型车', label: '大型车', emoji: '🏎️', cls: 'vc-large' },
      { key: 'SUV', label: 'SUV', emoji: '🚙', cls: 'vc-suv' },
      { key: 'MPV', label: 'MPV', emoji: '🚐', cls: 'vc-mpv' },
      { key: '跑车', label: '跑车', emoji: '🏎️', cls: 'vc-sport' },
      { key: '皮卡', label: '皮卡', emoji: '🛻', cls: 'vc-pickup' },
    ],
    energies: [
      { key: 'all', label: '全部', emoji: '⚙️', cls: '' },
      { key: 'fuel', label: '纯燃油', emoji: '⛽', cls: 'energy-fuel' },
      { key: 'hybrid', label: '混动', emoji: '🔋', cls: 'energy-hybrid' },
      { key: 'phev', label: '插混', emoji: '🔌', cls: 'energy-phev' },
      { key: 'bev', label: '纯电', emoji: '⚡', cls: 'energy-bev' },
      { key: 'erev', label: '增程', emoji: '🔁', cls: 'energy-erev' },
      { key: 'h2', label: '氢燃料', emoji: '💧', cls: 'energy-h2' },
    ],
    prices: [
      { key: 'all', label: '全部价格', emoji: '💰', cls: '' },
      { key: '0-10', label: '10万内', emoji: '💵', cls: '' },
      { key: '10-20', label: '10-20万', emoji: '💶', cls: '' },
      { key: '20-35', label: '20-35万', emoji: '💷', cls: '' },
      { key: '35-50', label: '35-50万', emoji: '💴', cls: '' },
      { key: '50-80', label: '50-80万', emoji: '💎', cls: '' },
      { key: '80+', label: '80万+', emoji: '👑', cls: '' },
    ],
  };

  const SORT_OPTIONS = [
    { key: 'default', label: '综合排序' },
    { key: 'priceAsc', label: '价格 ↑' },
    { key: 'priceDesc', label: '价格 ↓' },
    { key: 'ratingDesc', label: '评分最高' },
    { key: 'hotDesc', label: '热度最高' },
  ];

  const ENERGY_LABEL_MAP = {
    fuel: '纯燃油', hybrid: '混动', phev: '插混', bev: '纯电', erev: '增程', h2: '氢燃料',
  };

  const CLASS_KEY_MAP = {
    '微型车': 'micro', '小型车': 'small', '紧凑型': 'compact', '中型车': 'mid',
    '中大型': 'large-mid', '大型车': 'large', 'SUV': 'suv', 'MPV': 'mpv',
    '跑车': 'sport', '皮卡': 'pickup',
  };

  const state = {
    allCars: [],
    filteredCars: [],
    filters: {
      origin: 'all',
      vehicleClass: 'all',
      energy: 'all',
      price: 'all',
    },
    search: '',
    sort: 'default',
    favorites: new Set(),
    loading: true,
    error: null,
  };

  function $(selector, root = document) { return root.querySelector(selector); }
  function $$(selector, root = document) { return Array.from(root.querySelectorAll(selector)); }
  function debounce(fn, wait) {
    let t; return function (...args) { clearTimeout(t); t = setTimeout(() => fn.apply(this, args), wait); };
  }

  function resolveDataPath(relPath) {
    const base = document.querySelector('base')?.href || window.location.href;
    try {
      return new URL(relPath, base).toString();
    } catch {
      const u = new URL(base);
      u.pathname = (u.pathname.replace(/\/[^/]*$/, '/') + relPath).replace(/\/+/g, '/');
      return u.toString();
    }
  }

  function loadFromStorage(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      if (v == null) return fallback;
      return JSON.parse(v);
    } catch { return fallback; }
  }
  function saveToStorage(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  }

  function initTheme() {
    const saved = loadFromStorage(STORAGE_KEYS.THEME, null);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    applyTheme(theme, false);
  }
  function applyTheme(theme, save = true) {
    document.documentElement.setAttribute('data-theme', theme);
    const toggle = $('#themeToggle');
    if (toggle) {
      toggle.textContent = theme === 'dark' ? '☀️' : '🌙';
      toggle.setAttribute('aria-label', theme === 'dark' ? '切换亮色' : '切换暗色');
    }
    if (save) saveToStorage(STORAGE_KEYS.THEME, theme);
  }
  function toggleTheme() {
    const cur = document.documentElement.getAttribute('data-theme') || 'light';
    applyTheme(cur === 'dark' ? 'light' : 'dark');
  }

  function initFavorites() {
    const arr = loadFromStorage(STORAGE_KEYS.FAVORITES, []);
    state.favorites = new Set(Array.isArray(arr) ? arr : []);
    updateFavBadge();
  }
  function isFavorite(id) { return state.favorites.has(id); }
  function toggleFavorite(id) {
    if (state.favorites.has(id)) state.favorites.delete(id);
    else state.favorites.add(id);
    saveToStorage(STORAGE_KEYS.FAVORITES, Array.from(state.favorites));
    updateFavBadge();
    refreshFavUI(id);
    if (state.modal && state.modal.carId === id) refreshModalFav(id);
  }
  function updateFavBadge() {
    const b = $('#favBadge');
    const n = state.favorites.size;
    if (b) {
      if (n > 0) { b.textContent = n > 99 ? '99+' : String(n); b.style.display = 'flex'; }
      else b.style.display = 'none';
    }
  }
  function refreshFavUI(id) {
    $$(`.card-fav[data-id="${id}"]`).forEach(el => {
      el.classList.toggle('active', isFavorite(id));
    });
  }
  function refreshModalFav(id) {
    const f = $('#modalFavBtn');
    if (f) f.classList.toggle('active', isFavorite(id));
  }

  async function loadData() {
    state.loading = true;
    state.error = null;
    renderLoading();
    try {
      const url = resolveDataPath('./data/data.json');
      const res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json && Array.isArray(json.cars)) state.allCars = json.cars;
      else if (Array.isArray(json)) state.allCars = json;
      else throw new Error('数据格式错误');
    } catch (e) {
      console.error('加载数据失败:', e);
      state.error = e.message || '网络错误';
    } finally {
      state.loading = false;
      applyFilters();
    }
  }

  function priceInRange(priceMin, priceMax, key) {
    if (key === 'all') return true;
    if (key === '0-10') return priceMin < 10;
    if (key === '10-20') return priceMin < 20 && priceMax >= 10;
    if (key === '20-35') return priceMin < 35 && priceMax >= 20;
    if (key === '35-50') return priceMin < 50 && priceMax >= 35;
    if (key === '50-80') return priceMin < 80 && priceMax >= 50;
    if (key === '80+') return priceMax >= 80;
    return true;
  }

  function matchSearch(car, kw) {
    if (!kw) return true;
    const s = kw.toLowerCase();
    const fields = [
      car.model, car.brand, car.manufacturer, car.origin, car.vehicleClass,
      car.powertrain?.engine || '', car.powertrain?.motor || '', car.powertrain?.gearbox || '',
      car.priceRange, ...(car.tags || []), ...(car.highlights || []).map(h => h.text),
    ];
    return fields.some(f => String(f).toLowerCase().includes(s));
  }

  function applyFilters() {
    const f = state.filters;
    let list = state.allCars.filter(car => {
      if (f.origin !== 'all' && car.origin !== f.origin) return false;
      if (f.vehicleClass !== 'all' && car.vehicleClass !== f.vehicleClass) return false;
      if (f.energy !== 'all' && car.energyType !== f.energy) return false;
      if (!priceInRange(car.priceMinWan, car.priceMaxWan, f.price)) return false;
      if (!matchSearch(car, state.search)) return false;
      return true;
    });

    list = applySort(list, state.sort);
    state.filteredCars = list;
    renderResult();
    renderActiveFilters();
    updateCount(list.length, state.allCars.length);
  }

  function applySort(list, sortKey) {
    const arr = [...list];
    switch (sortKey) {
      case 'priceAsc': arr.sort((a, b) => a.priceMinWan - b.priceMinWan); break;
      case 'priceDesc': arr.sort((a, b) => b.priceMaxWan - a.priceMaxWan); break;
      case 'ratingDesc': arr.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      case 'hotDesc': arr.sort((a, b) => (b.hotScore || 0) - (a.hotScore || 0)); break;
      default: arr.sort((a, b) => {
        const ha = (a.hotScore || 0) + (a.rating || 0) * 2000;
        const hb = (b.hotScore || 0) + (b.rating || 0) * 2000;
        return hb - ha;
      });
    }
    return arr;
  }

  function updateCount(filtered, total) {
    const el = $('#resultCount');
    if (el) el.textContent = `${filtered} / ${total} 款`;
  }

  function renderLoading() {
    const wrap = $('#carGrid');
    if (!wrap) return;
    wrap.innerHTML = '';
    wrap.className = 'loader-list';
    for (let i = 0; i < 8; i++) {
      const sk = document.createElement('div');
      sk.className = 'skeleton';
      sk.style.width = 'calc(25% - 18px)';
      sk.style.minWidth = '260px';
      sk.innerHTML = `
        <div class="skeleton-cover"></div>
        <div class="skeleton-body">
          <div class="skeleton-line short"></div>
          <div class="skeleton-line mid"></div>
          <div class="skeleton-line mid"></div>
          <div class="skeleton-line long"></div>
        </div>`;
      wrap.appendChild(sk);
    }
    setTimeout(() => {
      $$('.skeleton', wrap).forEach(s => s.style.minWidth = '220px');
    }, 0);
  }

  function renderResult() {
    const wrap = $('#carGrid');
    if (!wrap) return;
    wrap.className = 'grid-cards';

    if (state.loading) { renderLoading(); return; }
    if (state.error) {
      wrap.innerHTML = '';
      wrap.appendChild(makeState(
        '❌', '加载出错了',
        `${state.error}，请检查 data/data.json 文件是否存在，或点击按钮重试`,
        '重新加载', () => location.reload()
      ));
      wrap.className = 'state-wrap';
      return;
    }
    if (!state.allCars.length) {
      wrap.innerHTML = '';
      wrap.appendChild(makeState(
        '📭', '暂无数据',
        '数据文件为空，请运行 npm run fetch 生成示例数据',
        '刷新重试', () => location.reload()
      ));
      wrap.className = 'state-wrap';
      return;
    }
    if (!state.filteredCars.length) {
      wrap.innerHTML = '';
      wrap.appendChild(makeState(
        '🔍', '没有找到匹配的车型',
        '试试调整筛选条件，或清空搜索关键词',
        '清除筛选', clearAllFilters
      ));
      wrap.className = 'state-wrap';
      return;
    }

    wrap.innerHTML = '';
    state.filteredCars.forEach(car => {
      const card = makeCard(car);
      wrap.appendChild(card);
    });
  }

  function makeState(icon, title, desc, actionLabel, onClick) {
    const el = document.createElement('div');
    el.className = 'state-wrap';
    el.innerHTML = `
      <div class="state-icon">${icon}</div>
      <div class="state-title">${title}</div>
      ${desc ? `<div class="state-desc">${desc}</div>` : ''}
      ${actionLabel ? `<button class="state-action" type="button">${actionLabel}</button>` : ''}
    `;
    const b = el.querySelector('.state-action');
    if (b && onClick) b.addEventListener('click', onClick);
    return el;
  }

  function formatHot(n) {
    if (n >= 10000) return (n / 10000).toFixed(1) + 'w';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return String(n);
  }

  function getBadges(car) {
    const badges = [];
    if (car.hotScore >= 50000) badges.push({ cls: 'badge-hot', text: '爆款' });
    else if (car.hotScore >= 20000) badges.push({ cls: 'badge-new', text: '热门' });
    if (car.isNewEnergy) badges.push({ cls: 'badge-green', text: '绿牌' });
    return badges;
  }

  function makeCard(car) {
    const el = document.createElement('div');
    el.className = 'car-card';
    el.style.animationDelay = Math.min((car.id % 20) * 0.03, 0.6) + 's';

    const badges = getBadges(car);
    const tagsHtml = `
      <span class="tag tag-energy ${car.energyType}">${energyIcon(car.energyType)} ${ENERGY_LABEL_MAP[car.energyType] || car.energyType}</span>
      <span class="tag tag-class ${CLASS_KEY_MAP[car.vehicleClass] || ''}">${car.vehicleClass}</span>
    `;
    const badgesHtml = badges.length ? `<div class="card-badges">${badges.map(b => `<span class="badge-tag ${b.cls}">${b.text}</span>`).join('')}</div>` : '';

    el.innerHTML = `
      <div class="card-cover">
        ${badgesHtml}
        <button class="card-fav ${isFavorite(car.id) ? 'active' : ''}" type="button" data-id="${car.id}" aria-label="收藏"></button>
        ${car.cover ? `<img class="cover-img" src="${car.cover}" alt="${car.brand}${car.model}" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'cover-img-placeholder',textContent:car.brandLogoEmoji||'🚗'}))">` : `<div class="cover-img-placeholder">${car.brandLogoEmoji || '🚗'}</div>`}
      </div>
      <div class="card-body">
        <div class="card-title-row">
          <div>
            <div class="card-title">
              <span class="brand-logo">${car.brandLogoEmoji || '🚗'}</span>
              <span>${car.model}</span>
            </div>
            <div class="card-manu">${car.manufacturer}</div>
          </div>
          <div class="card-rating"><span class="star">⭐</span><span>${(car.rating || 4.0).toFixed(1)}</span></div>
        </div>
        <div class="card-tags">${tagsHtml}</div>
        <div class="card-footer">
          <div class="price-block">
            <span class="price-symbol">¥</span>
            <span class="price-value">${car.priceMinWan}</span>
            <span class="price-unit">万${car.priceMaxWan !== car.priceMinWan ? '起' : ''}</span>
          </div>
          <div class="card-hot">${formatHot(car.hotScore || 0)}</div>
        </div>
      </div>
    `;

    el.addEventListener('click', (e) => {
      if (e.target.closest('.card-fav')) return;
      openModal(car);
    });
    const fav = el.querySelector('.card-fav');
    fav.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(car.id);
    });
    return el;
  }

  function energyIcon(type) {
    const m = { fuel: '⛽', hybrid: '🔋', phev: '🔌', bev: '⚡', erev: '🔁', h2: '💧' };
    return m[type] || '⚙️';
  }
  function originEmoji(o) {
    const m = { '德': '🇩🇪', '日': '🇯🇵', '美': '🇺🇸', '中': '🇨🇳', '英': '🇬🇧', '法': '🇫🇷', '韩': '🇰🇷', '意': '🇮🇹' };
    return m[o] || '🌍';
  }

  function buildTabs(id, config, filterKey) {
    const c = $(id);
    if (!c) return;
    c.innerHTML = config.map(item => `
      <button class="tab-btn ${item.cls || ''}" type="button" data-key="${item.key}" data-filter="${filterKey}" ${state.filters[filterKey] === item.key ? 'data-active="1"' : ''}>
        <span class="tab-emoji">${item.emoji}</span>${item.label}
      </button>
    `).join('');
    syncTabActive(c, filterKey);
    c.addEventListener('click', (e) => {
      const btn = e.target.closest('.tab-btn');
      if (!btn) return;
      const key = btn.getAttribute('data-key');
      const fk = btn.getAttribute('data-filter');
      if (fk) {
        state.filters[fk] = key;
        syncTabActive(c, fk);
        applyFilters();
      }
    });
  }
  function syncTabActive(container, filterKey) {
    $$('.tab-btn', container).forEach(b => {
      const key = b.getAttribute('data-key');
      b.classList.toggle('active', state.filters[filterKey] === key);
    });
  }

  function renderActiveFilters() {
    const c = $('#activeFilters');
    if (!c) return;
    const chips = [];
    if (state.filters.origin !== 'all') chips.push({ k: 'origin', label: `国别: ${state.filters.origin}系` });
    if (state.filters.vehicleClass !== 'all') chips.push({ k: 'vehicleClass', label: `级别: ${state.filters.vehicleClass}` });
    if (state.filters.energy !== 'all') chips.push({ k: 'energy', label: `能源: ${ENERGY_LABEL_MAP[state.filters.energy]}` });
    if (state.filters.price !== 'all') {
      const p = FILTER_CONFIG.prices.find(p => p.key === state.filters.price);
      if (p) chips.push({ k: 'price', label: `价格: ${p.label}` });
    }
    if (state.search.trim()) chips.push({ k: 'search', label: `搜索: ${state.search.trim()}` });
    c.innerHTML = chips.map(c => `
      <span class="chip" data-filter="${c.k}">
        ${c.label}
        <span class="chip-close" role="button" aria-label="移除">×</span>
      </span>
    `).join('');
    $$('.chip', c).forEach(ch => {
      ch.addEventListener('click', () => {
        const k = ch.getAttribute('data-filter');
        if (k === 'search') { state.search = ''; const si = $('#searchInput'); if (si) si.value = ''; const sw = $('#searchWrap'); if (sw) sw.classList.remove('has-value'); }
        else if (state.filters[k] != null) { state.filters[k] = 'all'; syncAllTabs(); }
        applyFilters();
      });
    });
  }
  function syncAllTabs() {
    syncTabActive($('#originTabs'), 'origin');
    syncTabActive($('#classTabs'), 'vehicleClass');
    syncTabActive($('#energyTabs'), 'energy');
    syncTabActive($('#priceTabs'), 'price');
  }
  function clearAllFilters() {
    state.filters = { origin: 'all', vehicleClass: 'all', energy: 'all', price: 'all' };
    state.search = '';
    const si = $('#searchInput'); if (si) si.value = '';
    const sw = $('#searchWrap'); if (sw) sw.classList.remove('has-value');
    syncAllTabs();
    applyFilters();
  }

  function buildSort() {
    const s = $('#sortSelect');
    if (!s) return;
    s.innerHTML = SORT_OPTIONS.map(o => `<option value="${o.key}" ${state.sort === o.key ? 'selected' : ''}>${o.label}</option>`).join('');
    s.addEventListener('change', () => {
      state.sort = s.value;
      applyFilters();
    });
  }

  function initSearch() {
    const input = $('#searchInput');
    const wrap = $('#searchWrap');
    const clear = $('#searchClear');
    if (!input) return;
    const onInput = debounce(() => {
      state.search = input.value || '';
      if (wrap) wrap.classList.toggle('has-value', !!input.value);
      applyFilters();
    }, 300);
    input.addEventListener('input', onInput);
    input.addEventListener('keydown', (e) => { if (e.key === 'Escape') { input.value = ''; onInput(); } });
    if (clear) clear.addEventListener('click', () => { input.value = ''; onInput(); input.focus(); });
  }

  function openModal(car) {
    state.modal = { carId: car.id };
    buildModal(car);
    const ov = $('#modalOverlay');
    if (ov) {
      ov.classList.add('open');
      document.body.classList.add('no-scroll');
    }
  }
  function closeModal() {
    state.modal = null;
    const ov = $('#modalOverlay');
    if (ov) {
      ov.classList.remove('open');
      document.body.classList.remove('no-scroll');
    }
  }

  function buildModal(car) {
    const body = $('#modalBody');
    if (!body) return;
    const ov = $('#modalOverlay');
    const heroImg = $('#modalHeroImg');
    const heroBrand = $('#modalHeroBrand');
    const heroModel = $('#modalHeroModel');
    const heroLogo = $('#modalHeroLogo');
    const heroTags = $('#modalHeroTags');
    const favBtn = $('#modalFavBtn');
    if (heroImg) {
      heroImg.src = (car.images && car.images[0]) || car.cover || '';
      heroImg.alt = `${car.brand} ${car.model}`;
      heroImg.onerror = function () { this.style.display = 'none'; };
      heroImg.style.display = '';
    }
    if (heroLogo) heroLogo.textContent = car.brandLogoEmoji || '🚗';
    if (heroBrand) heroBrand.textContent = `${originEmoji(car.origin)} ${car.origin}系 · ${car.manufacturer}`;
    if (heroModel) heroModel.textContent = `${car.brand} ${car.model}`;
    if (favBtn) {
      favBtn.className = `card-fav ${isFavorite(car.id) ? 'active' : ''}`;
      favBtn.onclick = (e) => { e.stopPropagation(); toggleFavorite(car.id); };
    }
    if (heroTags) {
      heroTags.innerHTML = `
        <span class="tag tag-class ${CLASS_KEY_MAP[car.vehicleClass] || ''}">${car.vehicleClass}</span>
        <span class="tag tag-energy ${car.energyType}">${energyIcon(car.energyType)} ${ENERGY_LABEL_MAP[car.energyType] || car.energyType}</span>
        ${car.isNewEnergy ? '<span class="tag" style="background:#16a34a">⚡ 新能源绿牌</span>' : ''}
        <span class="tag" style="background:var(--warning);color:#000">⭐ ${(car.rating || 4).toFixed(1)}</span>
      `;
    }

    const dim = car.dimensions || {};
    const pt = car.powertrain || {};
    const ec = car.energyCons || {};

    const basics = [
      { label: '厂商', value: car.manufacturer },
      { label: '指导价', value: car.priceRange, strong: true, color: 'var(--danger)' },
      { label: '车辆级别', value: car.vehicleClass },
      { label: '能源类型', value: ENERGY_LABEL_MAP[car.energyType] || car.energyType },
      { label: '车身结构', value: `${car.seats || 5}座${car.vehicleClass}` },
      { label: '长宽高', value: `${dim.length || '-'}×${dim.width || '-'}×${dim.height || '-'} mm` },
      { label: '轴距', value: `${dim.wheelbase || '-'} mm` },
      { label: '座位数', value: `${car.seats || '-'} 座` },
      { label: '行李箱容积', value: car.trunkL ? `${car.trunkL} L` : '-' },
      { label: '国别', value: `${originEmoji(car.origin)} ${car.origin}系` },
    ];
    const powers = [
      { label: '发动机', value: pt.engine || '纯电驱动 / 无发动机' },
      { label: '电动机', value: pt.motor || '未配备电机' },
      { label: '最大功率', value: pt.maxPowerKW ? `${pt.maxPowerKW} kW` : '-' },
      { label: '最大扭矩', value: pt.maxTorqueNM ? `${pt.maxTorqueNM} N·m` : '-' },
      { label: '变速箱', value: pt.gearbox || '-' },
      { label: '驱动方式', value: pt.driveType || '-' },
      { label: '前悬挂', value: pt.suspensionFront || '-' },
      { label: '后悬挂', value: pt.suspensionRear || '-' },
      { label: '前制动', value: pt.brakeFront || '-' },
      { label: '后制动', value: pt.brakeRear || '-' },
    ];

    const cons = [
      { cls: 'e-wltc', icon: '⛽', label: 'WLTC 油耗', value: ec.wltcL100km != null ? ec.wltcL100km.toFixed(1) : '-', unit: 'L/100km' },
      { cls: 'e-cltc', icon: '🛣️', label: 'CLTC 续航', value: ec.cltcRangeKM != null ? String(ec.cltcRangeKM) : '-', unit: 'km' },
      { cls: 'e-batt', icon: '🔋', label: '电池容量', value: ec.batteryKWH != null ? ec.batteryKWH.toFixed(1) : '-', unit: 'kWh' },
      { cls: 'e-charge', icon: '⚡', label: '快充时间', value: ec.fastChargeMin != null ? String(ec.fastChargeMin) : '-', unit: 'min' },
    ];

    body.innerHTML = `
      <div class="modal-section">
        <div class="modal-h3"><span class="icon">📋</span> 基础信息</div>
        <div class="info-grid">
          ${basics.map(b => `<div class="info-item">
            <div class="info-label">${b.label}</div>
            <div class="info-value"${b.color ? ` style="color:${b.color};font-weight:700;font-size:15px"` : ''}>${b.value}</div>
          </div>`).join('')}
        </div>
      </div>
      <div class="modal-section">
        <div class="modal-h3"><span class="icon">⚙️</span> 动力系统</div>
        <div class="info-grid">
          ${powers.map(p => `<div class="info-item">
            <div class="info-label">${p.label}</div>
            <div class="info-value">${p.value}</div>
          </div>`).join('')}
        </div>
      </div>
      <div class="modal-section">
        <div class="modal-h3"><span class="icon">✨</span> 配置亮点 (10项)</div>
        <div class="highlight-list">
          ${(car.highlights || []).map(h => `<div class="highlight-item">
            <span class="highlight-icon">${h.iconEmoji || '✅'}</span>
            <span class="highlight-text">${h.text}</span>
          </div>`).join('')}
        </div>
      </div>
      <div class="modal-section">
        <div class="modal-h3"><span class="icon">🔋</span> 能耗信息</div>
        <div class="energy-grid">
          ${cons.map(c => `<div class="energy-item ${c.cls}">
            <div class="energy-label">${c.icon} ${c.label}</div>
            <div class="energy-value">${c.value}<span class="energy-unit">${c.value !== '-' ? c.unit : ''}</span></div>
          </div>`).join('')}
        </div>
      </div>
      <div class="modal-section">
        <div class="modal-h3"><span class="icon">⚖️</span> 优缺点对比</div>
        <div class="pros-cons">
          <div class="pros-col">
            <div class="pros-head">✅ 优点 (5)</div>
            ${(car.pros || []).map(p => `<div class="pros-item">${p}</div>`).join('')}
          </div>
          <div class="cons-col">
            <div class="cons-head">❌ 缺点 (5)</div>
            ${(car.cons || []).map(p => `<div class="cons-item">${p}</div>`).join('')}
          </div>
        </div>
      </div>
      <div class="modal-section" id="relatedSection"></div>
    `;
    renderRelated(car);
  }

  function renderRelated(car) {
    const rs = $('#relatedSection');
    if (!rs) return;
    const ids = car.relatedIds || [];
    const sameBrand = state.allCars.filter(c => c.brand === car.brand && c.id !== car.id).slice(0, 6);
    const avgPrice = (car.priceMinWan + car.priceMaxWan) / 2;
    const samePrice = state.allCars
      .filter(c => {
        const a = (c.priceMinWan + c.priceMaxWan) / 2;
        return Math.abs(a - avgPrice) <= 15 && c.id !== car.id;
      })
      .sort((a, b) => Math.abs((a.priceMinWan + a.priceMaxWan) / 2 - avgPrice) - Math.abs((b.priceMinWan + b.priceMaxWan) / 2 - avgPrice))
      .slice(0, 6);

    const allRelated = ids.length ? state.allCars.filter(c => ids.includes(c.id)) : [...samePrice, ...sameBrand].slice(0, 12);
    const uniqRelated = []; const seen = new Set();
    allRelated.forEach(c => { if (!seen.has(c.id) && c.id !== car.id) { seen.add(c.id); uniqRelated.push(c); } });
    const priceRec = uniqRelated.slice(0, 6);
    const brandRec = uniqRelated.slice(6, 12);

    const cardHtml = (c) => `
      <div class="related-card" data-id="${c.id}">
        <div class="related-cover">
          ${c.cover ? `<img src="${c.cover}" alt="${c.brand}${c.model}" loading="lazy" onerror="this.parentElement.innerHTML='<div style=\\'display:flex;align-items:center;justify-content:center;height:100%;font-size:32px;opacity:.4\\'>${c.brandLogoEmoji || '🚗'}</div>'">` : `<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:32px;opacity:.4">${c.brandLogoEmoji || '🚗'}</div>`}
        </div>
        <div class="related-info">
          <div class="related-brand">${c.brandLogoEmoji || '🚗'} ${c.brand}</div>
          <div class="related-model">${c.model}</div>
          <div class="related-price">¥${c.priceMinWan}<span style="font-size:11px;font-weight:500;color:var(--text-tertiary)">万起</span></div>
        </div>
      </div>
    `;
    rs.innerHTML = `
      <div class="modal-h3"><span class="icon">💰</span> 同价位推荐</div>
      <div class="related-grid">
        ${priceRec.length ? priceRec.map(cardHtml).join('') : '<div class="state-desc" style="padding:20px">暂无同价位推荐车型</div>'}
      </div>
      <div class="modal-h3" style="margin-top:20px"><span class="icon">🏭</span> 同品牌推荐</div>
      <div class="related-grid">
        ${brandRec.length ? brandRec.map(cardHtml).join('') : sameBrand.length ? sameBrand.slice(0, 6).map(cardHtml).join('') : '<div class="state-desc" style="padding:20px">暂无同品牌推荐车型</div>'}
      </div>
    `;
    $$('.related-card', rs).forEach(el => {
      el.addEventListener('click', () => {
        const id = Number(el.getAttribute('data-id'));
        const c = state.allCars.find(x => x.id === id);
        if (c) openModal(c);
      });
    });
  }

  function initModal() {
    const ov = $('#modalOverlay');
    const close = $('#modalCloseBtn');
    if (!ov) return;
    if (close) close.addEventListener('click', closeModal);
    ov.addEventListener('click', (e) => { if (e.target === ov) closeModal(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && ov.classList.contains('open')) closeModal();
    });
  }

  function initBackTop() {
    const btn = $('#backTop');
    if (!btn) return;
    const onScroll = debounce(() => {
      const y = window.scrollY || document.documentElement.scrollTop;
      btn.classList.toggle('show', y > 480);
    }, 100);
    window.addEventListener('scroll', onScroll, { passive: true });
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    onScroll();
  }

  function init() {
    initTheme();
    initFavorites();
    buildTabs('#originTabs', FILTER_CONFIG.origins, 'origin');
    buildTabs('#classTabs', FILTER_CONFIG.classes, 'vehicleClass');
    buildTabs('#energyTabs', FILTER_CONFIG.energies, 'energy');
    buildTabs('#priceTabs', FILTER_CONFIG.prices, 'price');
    buildSort();
    initSearch();
    initModal();
    initBackTop();
    const themeBtn = $('#themeToggle');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
    const favBtn = $('#favBtn');
    if (favBtn) favBtn.addEventListener('click', () => {
      if (!state.favorites.size) { alert('暂无收藏车型，快去选择喜欢的车吧～'); return; }
      state.filters = { origin: 'all', vehicleClass: 'all', energy: 'all', price: 'all' };
      state.search = '';
      syncAllTabs();
      state._showFavOnly = true;
      const original = state.filteredCars;
      applyFilters();
      const wrap = $('#carGrid');
      wrap.className = 'grid-cards';
      wrap.innerHTML = '';
      const favCars = state.allCars.filter(c => isFavorite(c.id));
      if (!favCars.length) {
        wrap.className = 'state-wrap';
        wrap.appendChild(makeState('💔', '暂无收藏车型', '点击卡片右上角 ♡ 按钮添加收藏', null, null));
        return;
      }
      favCars.forEach(c => wrap.appendChild(makeCard(c)));
      const el = document.createElement('div');
      el.style.width = '100%';
      el.style.marginTop = '4px';
      el.innerHTML = `<button class="state-action" type="button" style="display:inline-flex;align-items:center;gap:6px">← 返回全部车型</button>`;
      el.querySelector('button').addEventListener('click', () => { state._showFavOnly = false; applyFilters(); });
      wrap.appendChild(el);
      $('#resultCount').textContent = `${favCars.length} 款收藏`;
    });

    loadData();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.CarApp = {
    state, applyFilters, clearAllFilters, toggleFavorite, toggleTheme, openModal, closeModal, resolveDataPath,
  };
})();
