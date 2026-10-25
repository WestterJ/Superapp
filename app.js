(() => {
  "use strict";
  const SUPABASE_URL = "https://ytsabhbkywymtevkeokg.supabase.co";
  const SUPABASE_KEY = "sb_publishable_cyIolmmdF5zKN0rAOJQOXg_ECcSq7z6";
  const STORAGE_KEY = "minhaCentral.apps.v1";
  const defaults = [
    { name: "Nutri-Bio", description: "Diário nutricional, metas e acompanhamento corporal.", url: "", icon: "🥗", color: "green", active: true },
    { name: "MediControl", description: "Controle de medicamentos e registros relacionados.", url: "", icon: "💊", color: "blue", active: true },
    { name: "Planejador de Estudos", description: "Organização de concursos, matérias e planejamento de estudos.", url: "", icon: "📚", color: "purple", active: true }
  ];
  const $ = id => document.getElementById(id);
  let apps = [], toastTimer, supabase, user = null, authMode = "login";
  const hasSupabase = Boolean(window.supabase?.createClient);
  if (hasSupabase) supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  function escapeHtml(value) { return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function safeUrl(value) { try { const u = new URL(value); return ["https:","http:"].includes(u.protocol) ? u.href : ""; } catch { return ""; } }
  function localApps() { try { const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); return Array.isArray(data) ? data : []; } catch { return []; } }
  function setAuthMessage(message, error=false) { const el=$("authMessage"); el.textContent=message; el.classList.toggle("error",error); }
  function setAuthMode(mode) { authMode=mode; $("authTitle").textContent=mode==="login"?"Entre na sua central":"Crie sua conta"; $("authDescription").textContent=mode==="login"?"Use seu e-mail e senha para sincronizar seus aplicativos na nuvem.":"Cadastre seu e-mail e uma senha para começar a usar sua central."; $("authSubmit").innerHTML=mode==="login"?'Entrar <span>→</span>':'Criar conta <span>→</span>'; $("authSwitch").textContent=mode==="login"?"Ainda não tem conta? Criar cadastro":"Já tem conta? Entrar"; $("authPassword").autocomplete=mode==="login"?"current-password":"new-password"; setAuthMessage(""); }
  function showAuth() { $("authScreen").classList.remove("hidden"); $("appShell").classList.add("hidden"); }
  function showApp() { $("authScreen").classList.add("hidden"); $("appShell").classList.remove("hidden"); $("profileEmail").textContent=user?.email || "Conta conectada"; }
  function showToast(message) { $("toast").textContent=message; $("toast").classList.remove("hidden"); clearTimeout(toastTimer); toastTimer=setTimeout(()=>$ ("toast").classList.add("hidden"),3000); }
  function render() {
    const active=apps.filter(a=>a.active);
    $("appGrid").innerHTML=active.map((a,i)=>{const url=safeUrl(a.url);return `<article class="app-card tone-${escapeHtml(a.color||"blue")}"><div class="app-card-top"><div class="app-icon">${escapeHtml(a.icon||"⭐")}</div><span class="app-number">APP ${String(i+1).padStart(2,"0")}</span></div><h3>${escapeHtml(a.name)}</h3><p>${escapeHtml(a.description||"Acesse este aplicativo pela Minha Central.")}</p><div class="app-card-bottom"><button class="app-open" data-open="${escapeHtml(a.id)}">${url?"Abrir aplicativo":"Configurar link"} <span>→</span></button><span class="app-link-icon">↗</span></div></article>`}).join("");
    $("emptyState").classList.toggle("hidden",active.length>0); $("appGrid").classList.toggle("hidden",active.length===0);
    $("appTable").innerHTML=apps.map(a=>{const url=safeUrl(a.url);return `<tr><td><div class="table-app"><span class="table-icon">${escapeHtml(a.icon||"⭐")}</span>${escapeHtml(a.name)}</div></td><td>${url?`<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(url)}</a>`:"<span>Link não configurado</span>"}</td><td><span class="status-pill ${a.active?"":"inactive"}">${a.active?"Ativo":"Oculto"}</span></td><td><div class="row-actions"><button class="icon-button" data-edit="${escapeHtml(a.id)}" aria-label="Editar ${escapeHtml(a.name)}">✎</button><button class="icon-button" data-toggle="${escapeHtml(a.id)}" aria-label="Alternar exibição">${a.active?"◉":"○"}</button><button class="icon-button delete" data-delete="${escapeHtml(a.id)}" aria-label="Excluir ${escapeHtml(a.name)}">×</button></div></td></tr>`}).join("");
    $("appCount").textContent=`${apps.length} ${apps.length===1?"aplicativo cadastrado":"aplicativos cadastrados"}`;
  }
  async function loadCloudApps() {
    const {data,error}=await supabase.from("central_apps").select("id,user_id,name,description,url,icon,color,active,created_at").order("created_at",{ascending:true});
    if(error) throw error;
    apps=(data||[]).map(a=>({id:a.id,name:a.name,description:a.description||"",url:a.url,icon:a.icon||"⭐",color:a.color||"blue",active:a.active}));
    if(apps.length===0) {
      const old=localApps();
      const source=old.length?old:defaults;
      const rows=source.map(a=>({user_id:user.id,name:a.name,description:a.description||"",url:safeUrl(a.url)||"https://example.com",icon:a.icon||"⭐",color:a.color||"blue",active:Boolean(a.active)}));
      // Do not upload placeholder links. If local links exist, migrate only valid configured entries.
      const migratable=rows.filter(r=>r.url!=="https://example.com");
      if(migratable.length){const {error:insertError}=await supabase.from("central_apps").insert(migratable);if(insertError)throw insertError;const {data:again,error:reloadError}=await supabase.from("central_apps").select("id,user_id,name,description,url,icon,color,active,created_at").order("created_at",{ascending:true});if(reloadError)throw reloadError;apps=(again||[]).map(a=>({id:a.id,name:a.name,description:a.description||"",url:a.url,icon:a.icon||"⭐",color:a.color||"blue",active:a.active}));}
      else apps=[];
    }
    render(); $("syncStatus").textContent="SUPABASE CONECTADO · SINCRONIZADO";
  }
  async function saveCloudApp(item,isNew) {
    const payload={user_id:user.id,name:item.name,description:item.description,url:item.url,icon:item.icon,color:item.color,active:item.active};
    const result=isNew?await supabase.from("central_apps").insert(payload).select().single():await supabase.from("central_apps").update(payload).eq("id",item.id).select().single();
    if(result.error)throw result.error;
    return {...item,id:result.data.id};
  }
  function navigate(view) { const labels={home:"Início",manage:"Gerenciar aplicativos",settings:"Configurações"};document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id===view+"View"));document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.view===view));$("pageLabel").textContent=labels[view]||"Início";$("sidebar").classList.remove("open");window.scrollTo({top:0,behavior:"smooth"}); }
  function openModal(app=null) { $("appForm").reset();$("appId").value=app?.id||"";$("modalTitle").textContent=app?"Editar aplicativo":"Adicionar aplicativo";$("appName").value=app?.name||"";$("appDescription").value=app?.description||"";$("appUrl").value=app?.url||"";$("appIcon").value=app?.icon||"⭐";$("appColor").value=app?.color||"blue";$("appActive").checked=app?Boolean(app.active):true;$("formError").classList.add("hidden");$("appModal").classList.remove("hidden");setTimeout(()=>$ ("appName").focus(),30); }
  function closeModal() { $("appModal").classList.add("hidden"); }
  function editApp(id) { const app=apps.find(a=>a.id===id);if(app)openModal(app); }

  $("authSwitch").addEventListener("click",()=>setAuthMode(authMode==="login"?"signup":"login"));
  $("authForm").addEventListener("submit",async e=>{e.preventDefault();if(!supabase){setAuthMessage("A biblioteca do Supabase não carregou. Atualize a página e tente novamente.",true);return;}const email=$("authEmail").value.trim(),password=$("authPassword").value;const btn=$("authSubmit");btn.disabled=true;setAuthMessage(authMode==="login"?"Entrando...":"Criando sua conta...");try{if(authMode==="login"){const {error}=await supabase.auth.signInWithPassword({email,password});if(error)throw error;}else{const {data,error}=await supabase.auth.signUp({email,password});if(error)throw error;if(!data.session){setAuthMessage("Cadastro iniciado. Confira seu e-mail para confirmar a conta e depois entre.");return;}}}catch(err){setAuthMessage(err.message||"Não foi possível autenticar.",true);}finally{btn.disabled=false;}});
  $("signOut").addEventListener("click",async()=>{const {error}=await supabase.auth.signOut();if(error)showToast(error.message);});
  document.querySelectorAll(".nav-item").forEach(b=>b.addEventListener("click",()=>navigate(b.dataset.view)));$("heroManage").addEventListener("click",()=>navigate("manage"));["addAppTop","addAppManage","emptyAdd"].forEach(id=>$(id).addEventListener("click",()=>openModal()));$("mobileMenu").addEventListener("click",()=>$ ("sidebar").classList.toggle("open"));$("closeModal").addEventListener("click",closeModal);$("cancelModal").addEventListener("click",closeModal);$("appModal").addEventListener("click",e=>{if(e.target===$("appModal"))closeModal();});document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal();});
  $("appForm").addEventListener("submit",async e=>{e.preventDefault();const id=$("appId").value,name=$("appName").value.trim(),url=safeUrl($("appUrl").value.trim());if(!name){$("formError").textContent="Informe o nome do aplicativo.";$("formError").classList.remove("hidden");return;}if(!url){$("formError").textContent="Informe um link válido começando com http:// ou https://.";$("formError").classList.remove("hidden");return;}const item={id,name,description:$("appDescription").value.trim(),url,icon:$("appIcon").value,color:$("appColor").value,active:$("appActive").checked};const submit=$("appForm").querySelector('[type="submit"]');submit.disabled=true;try{const saved=await saveCloudApp(item,!id);if(id)apps=apps.map(a=>a.id===id?saved:a);else apps.push(saved);render();closeModal();showToast(id?"Aplicativo atualizado na nuvem.":"Aplicativo cadastrado na nuvem.");}catch(err){$("formError").textContent=err.message||"Não foi possível salvar no Supabase.";$("formError").classList.remove("hidden");}finally{submit.disabled=false;}});
  document.addEventListener("click",async e=>{const open=e.target.closest("[data-open]"),edit=e.target.closest("[data-edit]"),toggle=e.target.closest("[data-toggle]"),del=e.target.closest("[data-delete]");if(open){const app=apps.find(a=>a.id===open.dataset.open),url=safeUrl(app?.url);if(url)window.open(url,"_blank","noopener,noreferrer");else{navigate("manage");editApp(open.dataset.open);showToast("Adicione o link publicado deste aplicativo.");}}if(edit)editApp(edit.dataset.edit);if(toggle){const app=apps.find(a=>a.id===toggle.dataset.toggle);if(app){try{const saved=await saveCloudApp({...app,active:!app.active},false);apps=apps.map(a=>a.id===saved.id?saved:a);render();showToast("Exibição atualizada na nuvem.");}catch(err){showToast(err.message||"Erro ao atualizar.");}}}if(del){const app=apps.find(a=>a.id===del.dataset.delete);if(app&&confirm(`Excluir "${app.name}" da Minha Central?`)){const {error}=await supabase.from("central_apps").delete().eq("id",app.id);if(error)showToast(error.message||"Erro ao excluir.");else{apps=apps.filter(a=>a.id!==app.id);render();showToast("Aplicativo removido da nuvem.");}}}});

  async function start() {
    if(!supabase){showAuth();setAuthMessage("Não foi possível carregar a biblioteca de conexão. Verifique a internet e atualize a página.",true);return;}
    supabase.auth.onAuthStateChange((_event,session)=>{setTimeout(async()=>{user=session?.user||null;if(!user){showAuth();return;}showApp();try{await loadCloudApps();}catch(err){showToast("Erro ao carregar do Supabase: "+(err.message||"verifique a tabela e as políticas RLS."));}},0);});
    const {data,error}=await supabase.auth.getSession();if(error){showAuth();setAuthMessage(error.message,true);return;}user=data.session?.user||null;if(!user){showAuth();return;}showApp();try{await loadCloudApps();}catch(err){showToast("Erro ao carregar do Supabase: "+(err.message||"verifique a tabela e as políticas RLS."));}
  }
  setAuthMode("login");start();
})();
