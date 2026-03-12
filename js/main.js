/* =============================================
   AIO Research — Main JS
   Features:
   - Reading progress bar
   - Sticky header behavior
   - Mobile hamburger menu
   - Table of contents active link tracking
   - Scroll reveal animations
   - Back to top button
   - Newsletter form
   - Bar chart animation on scroll
   ============================================= */

// ── Reading Progress ──────────────────────────
const progressBar = document.getElementById('reading-progress');
function updateProgress() {
  const total = document.body.scrollHeight - window.innerHeight;
  const pct = total > 0 ? (window.scrollY / total) * 100 : 0;
  progressBar.style.width = pct + '%';
}

// ── Header Scroll Effect ──────────────────────
const header = document.getElementById('site-header');
function updateHeader() {
  if (window.scrollY > 40) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}

// ── Back to Top ───────────────────────────────
const backToTop = document.getElementById('back-to-top');
function updateBackToTop() {
  if (window.scrollY > 400) {
    backToTop.classList.add('show');
  } else {
    backToTop.classList.remove('show');
  }
}

// ── Mobile Hamburger ──────────────────────────
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobile-nav');

hamburger.addEventListener('click', function () {
  mobileNav.classList.toggle('open');
});

mobileNav.querySelectorAll('a').forEach(function (link) {
  link.addEventListener('click', function () {
    mobileNav.classList.remove('open');
  });
});

// ── TOC Active Link ───────────────────────────
const tocLinks = document.querySelectorAll('.toc-link');
const sections = [];

tocLinks.forEach(function (link) {
  var href = link.getAttribute('href');
  if (href && href.startsWith('#')) {
    var el = document.querySelector(href);
    if (el) sections.push({ link: link, el: el });
  }
});

function updateTOC() {
  var scrollY = window.scrollY + 120;
  var active = null;
  sections.forEach(function (s) {
    if (s.el.offsetTop <= scrollY) active = s;
  });
  tocLinks.forEach(function (l) { l.classList.remove('active'); });
  if (active) active.link.classList.add('active');
}

// ── Nav Active Link ───────────────────────────
var navLinks = document.querySelectorAll('.main-nav a');
navLinks.forEach(function (link) {
  link.addEventListener('click', function () {
    navLinks.forEach(function (l) { l.classList.remove('active'); });
    link.classList.add('active');
  });
});

// ── Scroll Reveal ─────────────────────────────
var revealEls = document.querySelectorAll('.scroll-reveal');
var chartsAnimated = false;

var revealObserver = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(function (el) { revealObserver.observe(el); });

// ── Chart Bar Animation ───────────────────────
var chartObserver = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting && !chartsAnimated) {
      chartsAnimated = true;
      animateBars();
    }
  });
}, { threshold: 0.3 });

var monthlyChart = document.querySelector('.monthly-chart');
if (monthlyChart) chartObserver.observe(monthlyChart);

function animateBars() {
  var bars = document.querySelectorAll('.bar');
  bars.forEach(function (bar, i) {
    var target = parseFloat(bar.style.getPropertyValue('--pct')) * 1.4;
    bar.style.height = '0px';
    setTimeout(function () {
      bar.style.transition = 'height 0.8s cubic-bezier(.25,.8,.25,1)';
      bar.style.height = target + 'px';
    }, i * 60);
  });

  var indBars = document.querySelectorAll('.ind-bar');
  indBars.forEach(function (bar, i) {
    var target = bar.style.getPropertyValue('--w');
    bar.style.width = '0%';
    setTimeout(function () {
      bar.style.width = target;
    }, i * 100);
  });
}

// ── SERP Feature Bars Animation ──────────────
var serpObserver = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.serp-feat-fill').forEach(function (fill) {
        var w = fill.style.width;
        fill.style.width = '0%';
        requestAnimationFrame(function () {
          fill.style.width = w;
        });
      });
      serpObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.chart-card').forEach(function (card) {
  serpObserver.observe(card);
});

// ── Newsletter Form ───────────────────────────
function handleSubscribe(e) {
  e.preventDefault();
  var success = document.getElementById('newsletter-success');
  var form = e.target;
  form.style.display = 'none';
  success.classList.add('show');
}

// ── Mini bar tooltips on Hero ─────────────────
document.querySelectorAll('.mini-bar').forEach(function (bar) {
  bar.addEventListener('mouseenter', function () {
    var tooltip = document.createElement('div');
    tooltip.textContent = bar.getAttribute('data-month') + ': ' + bar.getAttribute('data-val');
    tooltip.style.cssText = 'position:absolute;bottom:calc(100% + 6px);left:50%;transform:translateX(-50%);background:white;color:#1e293b;font-size:10px;font-weight:700;padding:3px 7px;border-radius:4px;white-space:nowrap;z-index:10;pointer-events:none;';
    bar.style.position = 'relative';
    bar.appendChild(tooltip);
  });
  bar.addEventListener('mouseleave', function () {
    var tip = bar.querySelector('div');
    if (tip) bar.removeChild(tip);
  });
});

// ── Scroll Event (throttled) ──────────────────
var ticking = false;
window.addEventListener('scroll', function () {
  if (!ticking) {
    requestAnimationFrame(function () {
      updateProgress();
      updateHeader();
      updateBackToTop();
      updateTOC();
      ticking = false;
    });
    ticking = true;
  }
});

// Init
updateProgress();
updateHeader();
updateBackToTop();
updateTOC();

// ── Smooth close mobile nav on outside click ──
document.addEventListener('click', function (e) {
  if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
    mobileNav.classList.remove('open');
  }
});

// ── Language Toggle (EN / NL) ─────────────────
var TRANSLATIONS = [
  ['.main-nav a[href*="services"], .mobile-nav a[href*="services"]', 'Services', 'Diensten'],
  ['.main-nav a[href*="mission"], .mobile-nav a[href*="mission"]', 'Mission', 'Missie'],
  ['.main-nav a[href*="work.html"], .mobile-nav a[href*="work.html"]', 'Technology', 'Technologie'],
  ['.btn-subscribe', "Let's Talk", 'Neem Contact'],
  ['.welcome-heading .heading-plain', 'Websites That Work. ', 'Websites die werken. '],
  ['.welcome-heading em', 'Visibility That Compounds.', 'Zichtbaarheid die aangroeit.'],
  ['.welcome-sub', "We're a boutique web design studio specialising in building high-performance digital presences for businesses that want to be found, trusted, and chosen. From conversion-optimised design to data-driven SEO, from automation workflows to ongoing growth strategy — we bring the expertise of a large agency without the overhead. Based in Belgium, working across Europe.", 'Wij zijn een boutique webdesignstudio gespecialiseerd in het bouwen van krachtige digitale aanwezigheden voor bedrijven die gevonden, vertrouwd en gekozen willen worden. Van conversie-geoptimaliseerd design tot data-gedreven SEO, van automatiseringsworkflows tot doorlopende groeistrategie — wij brengen de expertise van een groot bureau zonder de overhead. Gevestigd in België, actief door heel Europa.'],
  ['.mission-eyebrow', 'Why this matters now', 'Waarom dit nu belangrijk is'],
  ['.mission-title', "AI search changed how people get traffic. Most websites haven't caught up.", 'AI-zoekopdrachten hebben het webverkeer veranderd. De meeste websites zijn nog niet mee.'],
  ['.mission-body p:nth-child(1)', "Google's AI Overviews now answer questions directly in the search results — before the user ever clicks a link. The old playbook of \"rank #1 and get traffic\" is breaking down. Studies tracking 10M+ keywords show AI-generated answers now appear for over 15% of all searches, and that number peaked at nearly 25% in mid-2025.", "Google's AI Overviews beantwoorden vragen nu rechtstreeks in de zoekresultaten — voordat de gebruiker ooit op een link klikt. Het oude model van 'ranken op #1 en verkeer krijgen' brokkelt af. Studies met 10M+ zoekwoorden tonen aan dat AI-gegenereerde antwoorden nu bij meer dan 15% van alle zoekopdrachten verschijnen, met een piek van bijna 25% medio 2025."],
  ['.mission-body p:nth-child(2)', "That's not a blip. That's a structural shift in how the web works. Traffic that used to flow to content sites, blogs, and service pages is being intercepted upstream. The businesses winning today are the ones whose digital presence is built to perform in both the old world and the new one.", "Dit is geen tijdelijke verstoring. Dit is een structurele verschuiving in hoe het web werkt. Verkeer dat vroeger naar contentwebsites, blogs en dienstenpagina's stroomde, wordt nu onderschept. De bedrijven die vandaag winnen, zijn degenen wier digitale aanwezigheid presteert in zowel de oude als de nieuwe wereld."],
  ['.mission-body p:nth-child(3)', "We build those websites — combining data-driven design, technical performance, and automation to create digital systems that compound over time, regardless of how search evolves.", "Wij bouwen die websites — door datagedreven design, technische prestaties en automatisering te combineren tot digitale systemen die in de loop van de tijd groeien, ongeacht hoe zoekresultaten evolueren."],
  ['.mission-stat:nth-child(1) .mission-stat-label', 'of searches now show AI answers', 'van zoekopdrachten toont AI-antwoorden'],
  ['.mission-stat:nth-child(2) .mission-stat-label', 'steady-state AIO coverage (Nov 2025)', 'stabiele AIO-dekking (nov 2025)'],
  ['.mission-stat:nth-child(3) .mission-stat-label', 'avg conversion lift, data-driven redesigns', 'gem. conversiegroei, datagedreven herontwerpen'],
  ['.mission-stat:nth-child(4) .mission-stat-label', 'avg organic growth post-launch', 'gem. organische groei na lancering'],
  ['.services-eyebrow', 'What we do', 'Wat wij doen'],
  ['.services-title', 'Services', 'Diensten'],
  ['.service-card:nth-child(1) .service-name', 'Web Design', 'Webdesign'],
  ['.service-card:nth-child(1) .service-desc', 'Fast, conversion-optimised websites built from scratch. Every layout decision is backed by user behaviour data — not guesswork. Mobile-first, accessible, and built to last.', 'Snelle, conversie-geoptimaliseerde websites van scratch gebouwd. Elke layoutbeslissing is gebaseerd op gebruikersgedragdata — niet op giswerk. Mobile-first, toegankelijk en gebouwd om te duren.'],
  ['.service-card:nth-child(2) .service-name', 'SEO Optimisation', 'SEO-optimalisatie'],
  ['.service-card:nth-child(2) .service-desc', 'Technical SEO, content architecture, and schema markup — built to rank in both traditional search results and AI Overviews. We make your site the source Google trusts.', 'Technische SEO, contentarchitectuur en schema-markup — gebouwd om te scoren in zowel traditionele zoekresultaten als AI Overviews. Wij maken van uw website de bron die Google vertrouwt.'],
  ['.service-card:nth-child(3) .service-name', 'Business Visibility', 'Bedrijfszichtbaarheid'],
  ['.service-card:nth-child(3) .service-desc', 'From local discovery to industry authority — we build the digital presence that puts your business in front of the right people at the right moment, across every channel.', 'Van lokale vindbaarheid tot sectorautoriteit — wij bouwen de digitale aanwezigheid die uw bedrijf op het juiste moment voor de juiste mensen plaatst, op elk kanaal.'],
  ['.service-card:nth-child(4) .service-name', 'AI Agent Implementation', 'AI-agentimplementatie'],
  ['.service-card:nth-child(4) .service-desc', 'We design and deploy custom AI agents and n8n automation workflows that eliminate manual work, speed up lead response, and integrate seamlessly into your existing stack.', 'Wij ontwerpen en implementeren aangepaste AI-agenten en n8n-automatiseringsworkflows die handmatig werk elimineren, leadopvolging versnellen en naadloos integreren in uw bestaande stack.'],
  ['a.toc-link[href="#projects"]', 'Projects', 'Projecten'],
  ['a.toc-link[href="#wins"]', 'Key Results', 'Kernresultaten'],
  ['a.toc-link[href="#why-data"]', 'Why Data?', 'Waarom Data?'],
  ['a.toc-link[href="#technology"]', 'Technology', 'Technologie'],
  ['a.toc-link[href="#results"]', 'Client Results', 'Klantresultaten'],
  ['a.toc-link[href="#industries"]', 'Industries', 'Sectoren'],
  ['a.toc-link[href="#testimonials"]', 'Testimonials', 'Getuigenissen'],
  ['a.toc-link[href="#conclusion"]', 'Philosophy', 'Filosofie'],
  ['#projects h2', 'Projects', 'Projecten'],
  ['.project-card:nth-child(1) .project-desc', 'Brand website for a hospitality & events concept. Immersive scroll experience with bold typography and atmospheric design.', 'Merkwebsite voor een horeca- en evenementenconcept. Meeslepende scroll-ervaring met gedurfde typografie en sfeervol design.'],
  ['.project-card:nth-child(2) .project-desc', 'Artisan coffee brand site with warm editorial aesthetics, menu showcase, and an online presence built for local discovery.', 'Ambachtelijke koffiemerkswebsite met warme redactionele esthetiek, menuoverzicht en een online aanwezigheid gebouwd voor lokale vindbaarheid.'],
  ['.project-card:nth-child(3) .project-desc', 'Data-driven automation platform landing page. Clean SaaS aesthetic with interactive data visualizations and conversion-optimized layout.', 'Landingspagina voor een datagedreven automatiseringsplatform. Strak SaaS-design met interactieve datavisualisaties en conversie-geoptimaliseerde opmaak.'],
  ['.newsletter-content h2', 'Ready to build something that performs?', 'Klaar om iets te bouwen dat presteert?'],
  ['.newsletter-content p', "Tell us about your project. We'll respond within 24 hours with a clear scope, timeline, and honest next step.", 'Vertel ons over uw project. We reageren binnen 24 uur met een duidelijke scope, tijdlijn en eerlijke vervolgstap.'],
  ['.newsletter-form .btn-primary', 'Start Conversation \u2192', 'Start Gesprek \u2192'],
  ['.footer-brand p', 'Data-driven web design & digital optimization studio. We build systems that compound.', 'Datagedreven webdesign- en digitale optimisatiestudio. Wij bouwen systemen die in waarde toenemen.'],
  ['.footer-col:nth-child(1) .footer-col-title', 'Services', 'Diensten'],
  ['.footer-col:nth-child(2) .footer-col-title', 'Work', 'Werk'],
  ['.footer-col:nth-child(2) a:nth-child(2)', 'Projects', 'Projecten'],
  ['.footer-col:nth-child(2) a:nth-child(3)', 'Client Results', 'Klantresultaten'],
  ['.footer-col:nth-child(2) a:nth-child(4)', 'Testimonials', 'Getuigenissen'],
  ['.footer-col:nth-child(2) a:nth-child(5)', 'Our Methodology', 'Onze Methodologie'],
  ['.footer-col:nth-child(3) .footer-col-title', 'Studio', 'Studio'],
  ['.footer-col:nth-child(3) a:nth-child(2)', 'About', 'Over ons'],
  ['.footer-col:nth-child(3) a:nth-child(3)', 'Our Process', 'Ons Proces'],
  ['.footer-col:nth-child(3) a:nth-child(4)', 'Privacy Policy', 'Privacybeleid'],
];

var currentLang = localStorage.getItem('stefaan-lang') || 'en';

function applyLanguage(lang) {
  TRANSLATIONS.forEach(function(item) {
    var text = lang === 'nl' ? item[2] : item[1];
    document.querySelectorAll(item[0]).forEach(function(el) {
      el.textContent = text;
    });
  });
  document.querySelectorAll('.lang-opt').forEach(function(opt) {
    opt.classList.toggle('active', opt.getAttribute('data-lang') === lang);
  });
  localStorage.setItem('stefaan-lang', lang);
  currentLang = lang;
  document.documentElement.lang = lang === 'nl' ? 'nl' : 'en';
}

var langToggle = document.getElementById('lang-toggle');
if (langToggle) {
  langToggle.addEventListener('click', function() {
    applyLanguage(currentLang === 'en' ? 'nl' : 'en');
  });
}

applyLanguage(currentLang);
