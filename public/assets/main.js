// Decor Blog main.js
// Simple SPA-like loader for posts and search

const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];

async function loadManifest() {
  const res = await fetch('/posts/manifest.json?_=' + Date.now());
  return await res.json();
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(document.documentElement.lang || 'ru', {
    year:'numeric', month:'long', day:'numeric'
  });
}

function renderPostCard(p) {
  return `
  <article class="rounded-2xl overflow-hidden shadow bg-white border flex flex-col group">
    <a class="block" href="/post.html?slug=${encodeURIComponent(p.slug)}" aria-label="${p.title}">
      <img src="${p.cover || 'https://picsum.photos/seed/'+encodeURIComponent(p.slug)+'/960/420'}"
           alt="${p.title}" class="w-full h-56 md:h-64 object-cover group-hover:brightness-90 transition"/>
    </a>
    <div class="p-5 flex-1 flex flex-col">
      <div class="text-xs text-gray-500 mb-2">${formatDate(p.date)} • ${p.reading_time || '5 мин'}</div>
      <h3 class="font-bold text-xl mb-2 font-head">
        <a href="/post.html?slug=${encodeURIComponent(p.slug)}" class="hover:underline">${p.title}</a>
      </h3>
      <p class="text-black/70 mb-4 flex-1">${p.excerpt}</p>
      <div class="mt-auto flex flex-row items-center gap-2 flex-wrap">
        ${p.tags.map(t => `<span class="bg-gray-100 text-gray-800 rounded-full px-3 py-1 text-xs font-semibold">#${t}</span>`).join('')}
        <a href="/post.html?slug=${encodeURIComponent(p.slug)}" class="ml-auto inline-block px-5 py-2 bg-black text-white rounded-full font-semibold hover:bg-[#222] transition">Читать</a>
      </div>
    </div>
  </article>`;
}

async function hydrateIndex() {
  const listEl = $('#post-list');
  if (!listEl) return;
  const manifest = await loadManifest();

  // filters
  const params = new URLSearchParams(location.search);
  const q = (params.get('q') || '').toLowerCase().trim();
  const tag = (params.get('tag') || '').toLowerCase().trim();

  let items = manifest.posts;
  if (q) {
    items = items.filter(p => (p.title + ' ' + p.excerpt).toLowerCase().includes(q));
    $('#searchInput').value = q;
  }
  if (tag) {
    items = items.filter(p => p.tags.map(t=>t.toLowerCase()).includes(tag));
    $('#activeTag').textContent = '#' + tag;
    $('#tagPill').classList.remove('hidden');
  }

  if (!items.length) {
    listEl.innerHTML = `<div class="text-center text-gray-500">Ничего не найдено.</div>`;
  } else {
    listEl.innerHTML = items.map(renderPostCard).join('');
  }

  // sidebar tags
  const tagMap = {};
  manifest.posts.forEach(p => p.tags.forEach(t => tagMap[t] = (tagMap[t]||0)+1));
  const tagsHtml = Object.entries(tagMap)
    .sort((a,b)=>b[1]-a[1])
    .slice(0,20)
    .map(([t,c]) => `<a class="px-3 py-1 rounded-full border hover:bg-black hover:text-white transition text-sm" href="?tag=${encodeURIComponent(t)}">${t} <span class="opacity-60">(${c})</span></a>`)
    .join(' ');
  $('#tagsCloud').innerHTML = tagsHtml;
}

async function renderMarkdown(mdText) {
  return marked.parse(mdText); // marked is loaded via CDN
}

async function hydratePost() {
  const postEl = $('#post-content');
  if (!postEl) return;
  const params = new URLSearchParams(location.search);
  const slug = params.get('slug');
  if (!slug) { postEl.innerHTML = '<p>Пост не найден.</p>'; return; }
  const manifest = await loadManifest();
  const post = manifest.posts.find(p => p.slug === slug);
  if (!post) { postEl.innerHTML = '<p>Пост не найден.</p>'; return; }

  // set head title
  document.title = post.title + " — Decor Blog";

  // load md
  const res = await fetch(`/posts/${slug}.md?_=` + Date.now());
  const md = await res.text();
  const html = await renderMarkdown(md);

  $('#post-hero-title').textContent = post.title;
  $('#post-meta').textContent = `${formatDate(post.date)} • ${post.reading_time || '5 мин'} • ${post.tags.map(t=>'#'+t).join(' ')}`;
  $('#post-cover').src = post.cover || 'https://picsum.photos/seed/'+encodeURIComponent(post.slug)+'/1200/520';
  postEl.innerHTML = html;

  // copy share
  const shareBtn = $('#copyLink');
  shareBtn?.addEventListener('click', async () => {
    await navigator.clipboard.writeText(location.href);
    shareBtn.innerText = 'Ссылка скопирована';
    setTimeout(()=>shareBtn.innerText='Скопировать ссылку',1500);
  });
}

function collectUTM(form) {
  const params = new URLSearchParams(location.search);
  const fields = ["utm_source","utm_medium","utm_campaign","utm_content","utm_term"];
  form.querySelector('[name="page_url"]').value = location.href;
  fields.forEach(k => {
    const el = form.querySelector(`[name="${k}"]`);
    if (el) el.value = params.get(k) || "";
  });
}

function setupForms() {
  $$('form[data-netlify="true"]').forEach(f => collectUTM(f));

  async function submitHandler(e){
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);

    // Store in Netlify Forms
    await fetch("/", {
      method:"POST",
      headers: {"Content-Type":"application/x-www-form-urlencoded"},
      body: new URLSearchParams(data).toString()
    });

    // Notify via Netlify Function → Telegram
    try {
      const json = {};
      data.forEach((v,k)=> json[k]=v);
      await fetch("/.netlify/functions/form-hook", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify(json)
      });
    } catch(_) {}

    location.href = "/__forms/thanks";
  }

  ['subscribe-form','contact-form'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('submit', submitHandler);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupForms();
  hydrateIndex();
  hydratePost();
});
