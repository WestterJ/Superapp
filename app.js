(() => {
  "use strict";
  const STORAGE_KEY = "minhaCentral.apps.v1";
  // Os três aplicativos aparecem como modelos iniciais. Insira os links reais em "Gerenciar aplicativos".
  const defaults = [
    { id: "nutri-bio", name: "Nutri-Bio", description: "Diário nutricional, metas e acompanhamento corporal.", url: "", icon: "🥗", color: "green", active: true },
    { id: "medicontrol", name: "MediControl", description: "Controle de medicamentos e registros relacionados.", url: "", icon: "💊", color: "blue", active: true },
    { id: "planejador-estudos", name: "Planejador de Estudos", description: "Organização de concursos, matérias e planejamento de estudos.", url: "", icon: "📚", color: "purple", active: true }
  ];
  const $ = id => document.getElementById(id);
  let apps = loadApps(), toastTimer;
  function loadApps() {
    try { const saved = localStorage.getItem(STORAGE_KEY); if (saved) { const data = JSON.parse(saved); if (Array.isArray(data)) return data; } }
    catch (error) { console.warn("Não foi possível ler os cadastros salvos.", error); }
    return defaults.map(app => ({...app}));
  }
  function saveApps() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(apps)); return true; }
    catch (error) { showToast("Não foi possível salvar neste navegador."); return false; }
  }
  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  }
  function safeUrl(value) {
    try { const u = new URL(value); return ["https:","http:"].includes(u.protocol) ? u.href : ""; }
    catch { return ""; }
  }
  function render() {
    const active = apps.filter(a => a.active);
    $("appGrid").innerHTML = active.map((a, i) => {
      const url = safeUrl(a.url);
      return `<article class="app-card tone-${escapeHtml(a.color || "blue")}">
        <div class="app-card-top"><div class="app-icon">${escapeHtml(a.icon || "⭐")}</div><span class="app-number">APP ${String(i+1).padStart(2,"0")}</span></div>
        <h3>${escapeHtml(a.name)}</h3><p>${escapeHtml(a.description || "Acesse este aplicativo pela Minha Central.")}</p>
        <div class="app-card-bottom"><button class="app-open" data-open="${escapeHtml(a.id)}">${url ? "Abrir aplicativo" : "Configurar link"} <span>→</span></button><span class="app-link-icon">↗</span></div></article>`;
    }).join("");
    $("emptyState").classList.toggle("hidden", active.length > 0);
    $("appGrid").classList.toggle("hidden", active.length === 0);
    $("appTable").innerHTML = apps.map(a => {
      const url = safeUrl(a.url);
      return `<tr><td><div class="table-app"><span class="table-icon">${escapeHtml(a.icon || "⭐")}</span>${escapeHtml(a.name)}</div></td>
        <td>${url ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(url)}</a>` : "<span>Link não configurado</span>"}</td>
        <td><span class="status-pill ${a.active ? "" : "inactive"}">${a.active ? "Ativo" : "Oculto"}</span></td>
        <td><div class="row-actions"><button class="icon-button" data-edit="${escapeHtml(a.id)}" aria-label="Editar ${escapeHtml(a.name)}">✎</button><button class="icon-button" data-toggle="${escapeHtml(a.id)}" aria-label="Alternar exibição">${a.active ? "◉" : "○"}</button><button class="icon-button delete" data-delete="${escapeHtml(a.id)}" aria-label="Excluir ${escapeHtml(a.name)}">×</button></div></td></tr>`;
    }).join("");
    $("appCount").textContent = `${apps.length} ${apps.length === 1 ? "aplicativo cadastrado" : "aplicativos cadastrados"}`;
  }
  function showToast(message) {
    $("toast").textContent = message; $("toast").classList.remove("hidden");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => $("toast").classList.add("hidden"), 3000);
  }
  function navigate(view) {
    const labels = {home:"Início",manage:"Gerenciar aplicativos",settings:"Configurações"};
    document.querySelectorAll(".view").forEach(v => v.classList.toggle("active", v.id === view+"View"));
    document.querySelectorAll(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.view === view));
    $("pageLabel").textContent = labels[view] || "Início"; $("sidebar").classList.remove("open");
    window.scrollTo({top:0,behavior:"smooth"});
  }
  function openModal(app = null) {
    $("appForm").reset(); $("appId").value = app?.id || "";
    $("modalTitle").textContent = app ? "Editar aplicativo" : "Adicionar aplicativo";
    $("appName").value = app?.name || ""; $("appDescription").value = app?.description || "";
    $("appUrl").value = app?.url || ""; $("appIcon").value = app?.icon || "⭐";
    $("appColor").value = app?.color || "blue"; $("appActive").checked = app ? Boolean(app.active) : true;
    $("formError").classList.add("hidden"); $("appModal").classList.remove("hidden");
    setTimeout(() => $("appName").focus(), 30);
  }
  function closeModal() { $("appModal").classList.add("hidden"); }
  function editApp(id) { const app = apps.find(a => a.id === id); if (app) openModal(app); }

  document.querySelectorAll(".nav-item").forEach(b => b.addEventListener("click", () => navigate(b.dataset.view)));
  $("heroManage").addEventListener("click", () => navigate("manage"));
  ["addAppTop","addAppManage","emptyAdd"].forEach(id => $(id).addEventListener("click", () => openModal()));
  $("mobileMenu").addEventListener("click", () => $("sidebar").classList.toggle("open"));
  $("closeModal").addEventListener("click", closeModal); $("cancelModal").addEventListener("click", closeModal);
  $("appModal").addEventListener("click", e => { if (e.target === $("appModal")) closeModal(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

  $("appForm").addEventListener("submit", e => {
    e.preventDefault();
    const id = $("appId").value, name = $("appName").value.trim(), url = safeUrl($("appUrl").value.trim());
    if (!name) { $("formError").textContent = "Informe o nome do aplicativo."; $("formError").classList.remove("hidden"); return; }
    if (!url) { $("formError").textContent = "Informe um link válido começando com http:// ou https://."; $("formError").classList.remove("hidden"); return; }
    const item = {id:id || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),name,description:$("appDescription").value.trim(),url,icon:$("appIcon").value,color:$("appColor").value,active:$("appActive").checked};
    if (id) apps = apps.map(a => a.id === id ? item : a); else apps.push(item);
    if (saveApps()) { render(); closeModal(); showToast(id ? "Aplicativo atualizado." : "Aplicativo cadastrado."); }
  });
  document.addEventListener("click", e => {
    const open = e.target.closest("[data-open]"), edit = e.target.closest("[data-edit]"), toggle = e.target.closest("[data-toggle]"), del = e.target.closest("[data-delete]");
    if (open) {
      const app = apps.find(a => a.id === open.dataset.open), url = safeUrl(app?.url);
      if (url) window.open(url, "_blank", "noopener,noreferrer");
      else { navigate("manage"); editApp(open.dataset.open); showToast("Adicione o link publicado deste aplicativo."); }
    }
    if (edit) editApp(edit.dataset.edit);
    if (toggle) { apps = apps.map(a => a.id === toggle.dataset.toggle ? {...a,active:!a.active} : a); if (saveApps()) {render();showToast("Exibição atualizada.");} }
    if (del) { const app = apps.find(a => a.id === del.dataset.delete); if (app && confirm(`Excluir "${app.name}" da Minha Central?`)) { apps = apps.filter(a => a.id !== app.id); if (saveApps()) {render();showToast("Aplicativo removido da central.");} } }
  });
  render();
})();