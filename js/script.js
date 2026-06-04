const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const Store = {
  get:    key        => JSON.parse(localStorage.getItem(key) || 'null'),
  set:    (key, val) => localStorage.setItem(key, JSON.stringify(val)),
  remove: key        => localStorage.removeItem(key),
};

const page = document.body.dataset.page || '';

// ==================== FUNGSI GLOBAL ====================
function updateProgress(step, total) {
  const pct   = Math.round((step / total) * 100);
  const fill  = $('.progress-fill');
  const label = $('.progress-pct');
  if (fill)  fill.style.width = pct + '%';
  if (label) label.textContent = pct + '%';
}

function getQuizData() {
  return Store.get('gm_quiz') || {};
}

function saveQuizData(key, value) {
  const data = getQuizData();
  data[key] = value;
  Store.set('gm_quiz', data);
}

function isQuizComplete() {
  const data = getQuizData();
  return !!(data.mood && data.budget && data.genres && data.genres.length && data.spec);
}

function initNextStep(validate, href) {
  const btn = $('#btn-next');
  if (!btn) return;
  btn.addEventListener('click', (e) => {
    e.preventDefault(); // Mencegah aksi default (link atau submit)
    if (validate && !validate()) return;
    window.location.href = href;
  });
}

// ==================== HALAMAN LOGIN ====================
if (page === 'login') {
  const btnGoogle = $('#btn-google');
  const btnEmail  = $('#btn-email');
  const emailInput = $('#email');

  if (btnGoogle) {
    btnGoogle.addEventListener('click', () => {
      window.location.href = 'Home.html';
    });
  }

  if (btnEmail) {
    btnEmail.addEventListener('click', () => {
      const email = emailInput?.value.trim();
      if (!email || !email.includes('@')) {
        emailInput?.classList.add('input-error');
        emailInput?.focus();
        return;
      }
      Store.set('gm_user', { email });
      window.location.href = 'Home.html';
    });
  }

  if (emailInput) {
    emailInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') btnEmail?.click();
      emailInput.classList.remove('input-error');
    });
  }
}

// ==================== HALAMAN HOME ====================
if (page === 'home') {
  $$('.mood-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      $$('.mood-tag').forEach(t => t.classList.remove('active'));
      tag.classList.add('active');
    });
  });

  const startBtn = $('#btn-start');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      if (isQuizComplete()) {
        window.location.href = 'Rekomendasi.html';
      } else {
        window.location.href = 'Q1.html';
      }
    });
  }
}

// ==================== STEP 1 (Q1.html) ====================
if (page === 'mm-step1') {

  if (isQuizComplete()) {
    window.location.href = 'Rekomendasi.html';
  } else {
    updateProgress(1, 4);

    $$('.mm-option').forEach(opt => {
      opt.addEventListener('click', () => {
        $$('.mm-option').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        saveQuizData('mood', opt.dataset.value);
      });
    });

    const prev = getQuizData().mood;
    if (prev) {
      $$('.mm-option').forEach(o => {
        if (o.dataset.value === prev) o.classList.add('active');
      });
    }

    initNextStep(
      () => {
        const sel = $('.mm-option.active');
        if (!sel) { alert('Pilih kondisi psikologismu terlebih dahulu.'); return false; }
        return true;
      },
      'Q2.html'
    );
  }
}

// ==================== STEP 2 (Q2.html) ====================
if (page === 'mm-step2') {
  updateProgress(2, 4);

  $$('.mm-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      $$('.mm-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      saveQuizData('budget', chip.dataset.value);
    });
  });

  const ftp = $('#include-f2p');
  if (ftp) {
    ftp.checked = getQuizData().includeF2P || false;
    ftp.addEventListener('change', () => saveQuizData('includeF2P', ftp.checked));
  }

  const prev = getQuizData().budget;
  if (prev) {
    $$('.mm-chip').forEach(c => {
      if (c.dataset.value === prev) c.classList.add('active');
    });
  }

  initNextStep(
    () => {
      if (!$('.mm-chip.active')) { alert('Pilih batasan budgetmu terlebih dahulu.'); return false; }
      return true;
    },
    'Q3.html'
  );
}

// ==================== STEP 3 (Q3.html) ====================
if (page === 'mm-step3') {
  updateProgress(3, 4);

  $$('.mm-genre').forEach(g => {
    g.addEventListener('click', () => {
      g.classList.toggle('active');
      const selected = $$('.mm-genre.active').map(el => el.dataset.value);
      saveQuizData('genres', selected);
    });
  });

  const prev = getQuizData().genres || [];
  $$('.mm-genre').forEach(g => {
    if (prev.includes(g.dataset.value)) g.classList.add('active');
  });

  initNextStep(
    () => {
      if (!$$('.mm-genre.active').length) { alert('Pilih setidaknya satu genre.'); return false; }
      return true;
    },
    'Q4.html'
  );
}

// ==================== STEP 4 (Q4.html) ====================
if (page === 'mm-step4') {
  updateProgress(4, 4);

  $$('.mm-spec-item').forEach(item => {
    item.addEventListener('click', () => {
      $$('.mm-spec-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      saveQuizData('spec', item.dataset.value);
    });
  });

  const prev = getQuizData().spec;
  if (prev) {
    $$('.mm-spec-item').forEach(i => {
      if (i.dataset.value === prev) i.classList.add('active');
    });
  }

  const findBtn = $('#btn-find');
  if (findBtn) {
    findBtn.addEventListener('click', () => {
      if (!$('.mm-spec-item.active')) { alert('Pilih spesifikasi perangkatmu terlebih dahulu.'); return; }
      window.location.href = 'Rekomendasi.html';
    });
  }
}

// ==================== HALAMAN REKOMENDASI (result) ====================
if (page === 'result') {
  const ALL_GAMES = [
    { id: 1,  title: 'God of War: Ragnarök', price: 'Rp 699.000',  img: 'assets/gow.jpg',       genres:['ACTION','RPG'],       spec:['medium','high'],  budget:'rp200-400' },
    { id: 2,  title: 'PRAGMATA',             price: 'Rp 0 (F2P)', img: 'assets/pragmata.jpg',  genres:['ACTION','ADVENTURE'],  spec:['medium','high'],  budget:'rp0-200'   },
    { id: 3,  title: 'Halo Infinite',         price: 'Rp 0 (F2P)', img: 'assets/halo.jpg',      genres:['FPS'],                 spec:['low','medium'],   budget:'rp0-200'   },
    { id: 4,  title: 'Call of Duty: MW2',     price: 'Rp 549.000', img: 'assets/cod.jpg',       genres:['FPS','ACTION'],        spec:['medium','high'],  budget:'rp200-400' },
    { id: 5,  title: 'Expedition 33',         price: 'Rp 389.000', img: 'assets/exp33.jpg',     genres:['RPG','ADVENTURE'],     spec:['medium','high'],  budget:'rp200-400' },
    { id: 6,  title: 'Stardew Valley',        price: 'Rp 89.000',  img: 'assets/stardew.jpg',   genres:['SIMULATION','PUZZLE'], spec:['low','medium'],   budget:'rp0-200'   },
    { id: 7,  title: 'Elden Ring',            price: 'Rp 599.000', img: 'assets/elden.jpg',     genres:['RPG','ACTION'],        spec:['high'],           budget:'rp400+'    },
    { id: 8,  title: 'Resident Evil 4',       price: 'Rp 449.000', img: 'assets/re4.jpg',       genres:['HORROR','ACTION'],     spec:['medium','high'],  budget:'rp200-400' },
    { id: 9,  title: 'Tekken 8',              price: 'Rp 499.000', img: 'assets/tekken.jpg',    genres:['FIGHTING'],            spec:['medium','high'],  budget:'rp200-400' },
    { id: 10, title: 'Minecraft',             price: 'Rp 189.000', img: 'assets/minecraft.jpg', genres:['SIMULATION','PUZZLE'], spec:['low','medium'],   budget:'rp0-200'   },
    { id: 11, title: 'Dota 2',               price: 'Rp 0 (F2P)', img: 'assets/dota2.jpg',     genres:['STRATEGY','MMORPG'],   spec:['low','medium'],   budget:'rp0-200'   },
    { id: 12, title: 'Valorant',             price: 'Rp 0 (F2P)', img: 'assets/valorant.jpg',  genres:['FPS'],                  spec:['low','medium'],   budget:'rp0-200'   },
  ];

  const quiz = getQuizData();

  function filterGames(games) {
    return games.filter(g => {
      const genreMatch = !quiz.genres?.length || g.genres.some(gen => quiz.genres.includes(gen));
      const specMatch  = !quiz.spec  || g.spec.includes(quiz.spec);
      return genreMatch && specMatch;
    });
  }

  const recommended = filterGames(ALL_GAMES).slice(0, 6);
  const others      = ALL_GAMES.filter(g => !recommended.find(r => r.id === g.id)).slice(0, 6);

  function buildCard(game) {
    const favs = Store.get('gm_favorites') || [];
    const isFav = favs.includes(game.id);
    return `
      <div class="game-card" data-id="${game.id}">
        <img class="game-card-img" src="${game.img}" alt="${game.title}" onerror="this.style.background='#1a1d27';this.removeAttribute('src')" />
        <button class="game-card-fav ${isFav ? 'active' : ''}" data-id="${game.id}" title="Tambah ke favorit">&#9825;</button>
        <div class="game-card-body">
          <div class="game-card-title">${game.title}</div>
          <div class="game-card-price">${game.price}</div>
          <a href="Detail.html?id=${game.id}" class="btn btn-primary btn-sm btn-full">Lihat Detail</a>
        </div>
      </div>`;
  }

  function renderGrid(containerId, games) {
    const el = $(`#${containerId}`);
    if (!el) return;
    el.innerHTML = games.map(buildCard).join('');
  }

  renderGrid('grid-recommended', recommended);
  renderGrid('grid-others', others);

  document.addEventListener('click', e => {
    const btn = e.target.closest('.game-card-fav');
    if (!btn) return;
    const id   = parseInt(btn.dataset.id);
    let favs   = Store.get('gm_favorites') || [];
    if (favs.includes(id)) {
      favs = favs.filter(f => f !== id);
      btn.classList.remove('active');
    } else {
      favs.push(id);
      btn.classList.add('active');
    }
    Store.set('gm_favorites', favs);
  });

  const retryBtn = $('#btn-retry');
  if (retryBtn) retryBtn.addEventListener('click', () => {
    Store.remove('gm_quiz');
    window.location.href = 'Q1.html';
  });
}

// ==================== HALAMAN DETAIL ====================
if (page === 'detail') {
  const GAMES_DB = {
    1: {
      title: 'God of War: Ragnarök',
      img: 'assets/gow.jpg',
      price: 'Rp 699.000',
      about: 'God of War: Ragnarök adalah game laga petualangan yang dikembangkan oleh Santa Monica Studio. Melanjutkan kisah epik tahun 2018, game ini berlatar di sembilan dunia Norse mitologi. Pemain mengendalikan Kratos dan putranya, Atreus (Loki), dalam upaya mencegah datangnya Ragnarök dan menghadapi para dewa seperti Thor dan Odin.',
      spec: {
        OS: 'Windows 10 64-Bit',
        Processor: 'Intel Core i5-8600 / AMD Ryzen 5 3600',
        RAM: '16 GB RAM',
        GPU: 'NVIDIA GeForce GTX 1080 / AMD Radeon RX 5500 XT',
        Storage: '190 GB ruang tersedia',
      }
    },
    2: {
      title: 'PRAGMATA',
      img: 'assets/pragmata.jpg',
      price: 'Rp 0 (Free to Play)',
      about: 'PRAGMATA adalah game sci-fi aksi petualangan dari Capcom yang berlatar di bulan. Pemain mengendalikan seorang agen yang dilengkapi dengan teknologi canggih bersama anak perempuan misterius bernama Diana.',
      spec: {
        OS: 'Windows 10 64-Bit',
        Processor: 'Intel Core i5-8400 / AMD Ryzen 5 2600',
        RAM: '12 GB RAM',
        GPU: 'NVIDIA GeForce GTX 1070 / AMD RX Vega 56',
        Storage: '60 GB ruang tersedia',
      }
    },
  };

  const params = new URLSearchParams(location.search);
  const id     = parseInt(params.get('id')) || 1;
  const game   = GAMES_DB[id] || GAMES_DB[1];

  const titleEl = $('#game-title');
  const coverEl = $('#game-cover');
  const aboutEl = $('#game-about');
  if (titleEl) titleEl.textContent = game.title;
  if (coverEl) { coverEl.src = game.img; coverEl.alt = game.title; }
  if (aboutEl) aboutEl.textContent = game.about;

  const specEl = $('#game-spec');
  if (specEl && game.spec) {
    specEl.innerHTML = Object.entries(game.spec).map(([k, v]) =>
      `<div class="spec-row"><span class="spec-key">${k}</span><span class="spec-val">${v}</span></div>`
    ).join('');
  }

  const favBtn = $('#btn-fav');
  if (favBtn) {
    let favs = Store.get('gm_favorites') || [];
    const updateFavBtn = () => {
      const isFav = favs.includes(id);
      favBtn.textContent = isFav ? '★ Tersimpan di Favorit' : '♡ Tambahkan ke Favorit';
      favBtn.classList.toggle('btn-gold', isFav);
      favBtn.classList.toggle('btn-outline', !isFav);
    };
    updateFavBtn();
    favBtn.addEventListener('click', () => {
      favs = Store.get('gm_favorites') || [];
      if (favs.includes(id)) favs = favs.filter(f => f !== id);
      else favs.push(id);
      Store.set('gm_favorites', favs);
      updateFavBtn();
    });
  }
}

if (page === 'favorite') {
  const quizData = getQuizData();
  if (!quizData.mood) {
    alert('Anda harus memulai quiz terlebih dahulu sebelum mengakses halaman Favorite.');
    window.location.href = 'Q1.html';
  } else {
    const ALL_GAMES = [
      { id:1,  title:'God of War: Ragnarök', price:'Rp 699.000',  img:'assets/gow.jpg' },
      { id:2,  title:'PRAGMATA',             price:'Rp 0 (F2P)', img:'assets/pragmata.jpg' },
      { id:3,  title:'Halo Infinite',         price:'Rp 0 (F2P)', img:'assets/halo.jpg' },
      { id:4,  title:'Call of Duty: MW2',     price:'Rp 549.000', img:'assets/cod.jpg' },
      { id:5,  title:'Expedition 33',         price:'Rp 389.000', img:'assets/exp33.jpg' },
      { id:6,  title:'Stardew Valley',        price:'Rp 89.000',  img:'assets/stardew.jpg' },
      { id:7,  title:'Elden Ring',            price:'Rp 599.000', img:'assets/elden.jpg' },
      { id:8,  title:'Resident Evil 4',       price:'Rp 449.000', img:'assets/re4.jpg' },
    ];

    const SLOT_COUNT = 8;

    function renderFav() {
      const favIds = Store.get('gm_favorites') || [];
      const favGames = favIds.map(id => ALL_GAMES.find(g => g.id === id)).filter(Boolean);

      const countEl = $('#fav-count');
      if (countEl) countEl.textContent = favGames.length;

      const grid = $('#fav-grid');
      if (!grid) return;

      let html = '';
      for (let i = 0; i < SLOT_COUNT; i++) {
        const g = favGames[i];
        if (g) {
          html += `
            <div class="fav-slot filled" data-id="${g.id}">
              <img src="${g.img}" alt="${g.title}" onerror="this.style.opacity=0" />
              <button class="fav-slot-del" data-id="${g.id}" title="Hapus dari favorit">✕</button>
            </div>`;
        } else {
          html += `<div class="fav-slot empty"></div>`;
        }
      }
      grid.innerHTML = html;

      $$('.fav-slot-del').forEach(btn => {
        btn.addEventListener('click', e => {
          e.stopPropagation();
          const id = parseInt(btn.dataset.id);
          let favs = Store.get('gm_favorites') || [];
          Store.set('gm_favorites', favs.filter(f => f !== id));
          renderFav();
        });
      });

      $$('.fav-slot.filled').forEach(slot => {
        slot.addEventListener('click', e => {
          if (e.target.closest('.fav-slot-del')) return;
          window.location.href = `Detail.html?id=${slot.dataset.id}`;
        });
      });
    }

    renderFav();

    const updateBtn = $('#btn-update');
    if (updateBtn) {
      updateBtn.addEventListener('click', () => {
        Store.remove('gm_quiz');
        window.location.href = 'Q1.html';
      });
    }

    const loadMoreBtn = $('#btn-load-more');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        alert('Semua favorit sudah ditampilkan.');
      });
    }
  }
}

// ==================== LOGOUT ====================
$$('.btn-logout').forEach(btn => {
  btn.addEventListener('click', () => {
    Store.remove('gm_user');
    window.location.href = 'Login.html';
  });
});