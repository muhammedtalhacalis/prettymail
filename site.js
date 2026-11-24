/* PrettyMail tanıtım sitesi — küçük etkileşimler. Bağımlılık yok, hiçbir yere veri gönderilmez. */
(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────────────
     YAYIN AYARLARI — yer tutucuları doldurmak için yalnızca burayı düzenleyin.
     Boş bırakılan her alan sitede "Yakında" olarak görünür.
     ───────────────────────────────────────────────────────────────────── */
  var AYARLAR = {
    indirmeBaglantisi: '',  // ör. 'https://github.com/…/releases/latest/download/PrettyMail-Kurulum.exe'
    surum: '',              // ör. '0.1.0' — indirme düğmesinin altında gösterilir
    iletisimEpostasi: '',   // ör. 'merhaba@alanadiniz.com'
    githubAdresi: ''        // ör. 'https://github.com/kullanici/prettymail'
  };

  var doc = document, root = doc.documentElement;
  var all = function (sel) { return Array.prototype.slice.call(doc.querySelectorAll(sel)); };

  /* ───── Tema ───── */
  var temaBtn = doc.getElementById('tema');
  function temaEtiketi() {
    var koyu = root.getAttribute('data-theme') === 'dark';
    if (temaBtn) temaBtn.setAttribute('aria-label', koyu ? 'Açık temaya geç' : 'Koyu temaya geç');
  }
  if (temaBtn) {
    temaBtn.addEventListener('click', function () {
      var yeni = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', yeni);
      try { localStorage.setItem('pm-site-tema', yeni); } catch (e) { /* özel gezinme: yalnızca bu sayfa için geçerli olur */ }
      temaEtiketi();
    });
  }
  temaEtiketi();
  if (window.matchMedia) {
    var mq = matchMedia('(prefers-color-scheme: dark)');
    var sistemDegisti = function (e) {
      var secim = null;
      try { secim = localStorage.getItem('pm-site-tema'); } catch (err) {}
      if (secim === 'dark' || secim === 'light') return; // kullanıcı kendi seçimini yaptıysa dokunma
      root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      temaEtiketi();
    };
    if (mq.addEventListener) mq.addEventListener('change', sistemDegisti);
    else if (mq.addListener) mq.addListener(sistemDegisti);
  }

  /* ───── Üst çubuk: kaydırınca çizgi ───── */
  var ust = doc.querySelector('.top');
  function kaydi() { if (ust) ust.classList.toggle('stuck', window.scrollY > 8); }
  window.addEventListener('scroll', kaydi, { passive: true });
  kaydi();

  /* ───── Kahraman: önce / sonra sekmeleri (dar ekranda) ───── */
  var sahne = doc.getElementById('sahne');
  if (sahne) {
    all('[data-view-btn]').forEach(function (b) {
      b.addEventListener('click', function () {
        var v = b.getAttribute('data-view-btn');
        sahne.setAttribute('data-view', v);
        all('[data-view-btn]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      });
    });
  }

  /* ───── Kaydırdıkça beliren bölümler ───── */
  var gizli = all('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (olaylar) {
      olaylar.forEach(function (o) {
        if (!o.isIntersecting) return;
        o.target.classList.add('in');
        io.unobserve(o.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    gizli.forEach(function (el) {
      // aynı satırdaki kartlar sırayla gelsin
      var kardesler = el.parentElement ? Array.prototype.filter.call(el.parentElement.children, function (c) { return c.classList.contains('reveal'); }) : [el];
      var i = kardesler.indexOf(el);
      if (i > 0) el.style.setProperty('--d', Math.min(i, 5) * 0.07 + 's');
      io.observe(el);
    });
  } else {
    gizli.forEach(function (el) { el.classList.add('in'); });
  }

  /* ───── Yer tutucular: AYARLAR doldurulduysa canlıya al ───── */
  function guvenliAdres(u) { return /^https:\/\//i.test(u) ? u : ''; }

  var indir = guvenliAdres(AYARLAR.indirmeBaglantisi);
  if (indir) {
    all('[data-indir]').forEach(function (a) {
      a.setAttribute('href', indir);
      a.removeAttribute('aria-disabled');
      a.classList.remove('btn-line');
      if (!a.classList.contains('btn-white')) a.classList.add('btn-pri');
    });
    all('[data-yakinda]').forEach(function (el) { el.hidden = true; });
    all('[data-hazir]').forEach(function (el) { el.hidden = false; });
    if (AYARLAR.surum) all('[data-surum]').forEach(function (el) { el.textContent = 'Sürüm ' + AYARLAR.surum; el.hidden = false; });
  }

  var eposta = String(AYARLAR.iletisimEpostasi || '').trim();
  if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(eposta)) {
    all('[data-iletisim]').forEach(function (el) {
      var a = doc.createElement('a');
      a.href = 'mailto:' + eposta; a.textContent = eposta;
      el.textContent = ''; el.appendChild(a);
    });
  }

  var github = guvenliAdres(AYARLAR.githubAdresi);
  if (github) {
    all('[data-github]').forEach(function (el) {
      var a = doc.createElement('a');
      a.href = github; a.rel = 'noopener'; a.textContent = github.replace(/^https:\/\/(www\.)?/i, '').replace(/\/$/, '');
      el.textContent = ''; el.appendChild(a);
    });
  }
})();
