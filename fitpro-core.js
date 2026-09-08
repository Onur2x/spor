/* FitPro ELITE v3 - Fitness Engine
   Adds: profile onboarding, readiness/recovery, real set logging,
   history-based progressive overload, PR/1RM, body measurements,
   personalized calorie/macro targets and weekly coach summary.
*/
(function(){
  const originalCheckUserSession = window.checkUserSession;
  let profile = null;
  let activeWorkoutId = null;
  let activeWorkoutStartedAt = null;

  const style=document.createElement('style');
  style.textContent=`
    .fp-modal{position:fixed;inset:0;background:rgba(0,0,0,.78);z-index:3000;display:none;align-items:center;justify-content:center;padding:16px}
    .fp-modal-card{width:min(560px,100%);max-height:92vh;overflow:auto;background:var(--card-bg);border:1px solid var(--border);border-radius:20px;padding:20px;box-shadow:var(--shadow)}
    .fp-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.fp-field{display:flex;flex-direction:column;gap:5px}.fp-field.full{grid-column:1/-1}
    .fp-field label{font-size:.7rem;color:var(--text-muted);font-weight:800}.fp-field input,.fp-field select,.fp-field textarea{padding:11px;border:1px solid var(--border);border-radius:10px;background:var(--input-bg);color:var(--text);width:100%}
    .fp-set{display:grid;grid-template-columns:36px 1fr 1fr 1fr 34px;gap:7px;align-items:center;margin-top:7px}.fp-set input{min-width:0;padding:9px;border:1px solid var(--border);border-radius:9px;background:var(--input-bg);color:var(--text)}.fp-set.done{opacity:.68}
    .fp-prev,.fp-progress{font-size:.7rem;color:var(--text-muted);margin:7px 0}.fp-progress{color:var(--accent);font-weight:800}
    .fp-score{font-size:2rem;font-weight:950;color:var(--primary)}.fp-chip{display:inline-block;padding:5px 8px;border:1px solid var(--border);border-radius:999px;font-size:.68rem;margin:3px;background:var(--input-bg)}
    .fp-stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.fp-stat{padding:10px;border:1px solid var(--border);border-radius:12px;background:var(--card-inner)}.fp-stat b{display:block;font-size:1.1rem}.fp-stat span{font-size:.65rem;color:var(--text-muted)}
    @media(max-width:430px){.fp-grid{grid-template-columns:1fr}.fp-field.full{grid-column:auto}.fp-set{grid-template-columns:30px 1fr 1fr 1fr 30px}.fp-stat-grid{grid-template-columns:1fr 1fr}}
  `; document.head.appendChild(style);

  const goalLabel=g=>({muscle_gain:'Kas kazanımı',fat_loss:'Yağ kaybı',recomp:'Recomp',strength:'Güç',conditioning:'Kondisyon'})[g]||'Belirlenmedi';
  const levelLabel=g=>({beginner:'Başlangıç',intermediate:'Orta',advanced:'İleri'})[g]||'Belirlenmedi';

  function addModal(){
    if(document.getElementById('fp-profile-modal'))return;
    document.body.insertAdjacentHTML('beforeend',`<div class="fp-modal" id="fp-profile-modal"><div class="fp-modal-card">
      <h2 style="margin-top:0">👤 Sporcu Profili</h2><p style="color:var(--text-muted);font-size:.8rem">Program, recovery ve beslenme motoru bu bilgilerle kişiselleştirilir.</p>
      <div class="fp-grid">
        <div class="fp-field"><label>AD SOYAD</label><input id="fp-name"></div><div class="fp-field"><label>YAŞ</label><input id="fp-age" type="number" min="13" max="100"></div>
        <div class="fp-field"><label>BOY (CM)</label><input id="fp-height" type="number" step="0.1"></div><div class="fp-field"><label>KİLO (KG)</label><input id="fp-weight" type="number" step="0.1"></div>
        <div class="fp-field"><label>CİNSİYET</label><select id="fp-sex"><option value="">Seç</option><option value="male">Erkek</option><option value="female">Kadın</option><option value="other">Diğer</option></select></div>
        <div class="fp-field"><label>HEDEF</label><select id="fp-goal"><option value="muscle_gain">Kas kazanımı</option><option value="fat_loss">Yağ kaybı</option><option value="recomp">Recomp</option><option value="strength">Güç</option><option value="conditioning">Kondisyon</option></select></div>
        <div class="fp-field"><label>HAFTALIK ANTRENMAN</label><input id="fp-days" type="number" min="1" max="7" value="4"></div><div class="fp-field"><label>SEVİYE</label><select id="fp-level"><option value="beginner">Başlangıç</option><option value="intermediate">Orta</option><option value="advanced">İleri</option></select></div>
        <div class="fp-field"><label>GÜNLÜK AKTİVİTE</label><select id="fp-activity"><option value="sedentary">Düşük</option><option value="light">Hafif</option><option value="moderate" selected>Orta</option><option value="high">Yüksek</option></select></div>
        <div class="fp-field"><label>EQUIPMENT</label><select id="fp-equipment"><option value="gym">Salon</option><option value="home">Ev</option><option value="mixed">Karışık</option></select></div>
      </div><button class="btn btn-primary" style="width:100%;margin-top:16px" onclick="window.fpSaveProfile()">Kaydet ve Devam Et →</button>
    </div></div>`);
  }

  async function loadProfile(){
    if(!window.currentUser)return null;
    const {data,error}=await window.supabaseClient.from('profiles').select('*').eq('id',window.currentUser.id).maybeSingle();
    if(error){console.warn(error.message);return null} profile=data; return data;
  }

  function fillProfile(){
    if(!profile)return; addModal();
    const map={name:profile.full_name,age:profile.age,height:profile.height_cm,weight:profile.weight_kg,sex:profile.sex,goal:profile.goal||'muscle_gain',days:profile.training_days||4,level:profile.experience_level||'intermediate',activity:profile.activity_level||'moderate',equipment:profile.equipment||'gym'};
    Object.entries(map).forEach(([k,v])=>{const e=document.getElementById('fp-'+k);if(e)e.value=v??''});
  }
  function openProfileModal(){addModal();fillProfile();document.getElementById('fp-profile-modal').style.display='flex'}
  function closeProfileModal(){const e=document.getElementById('fp-profile-modal');if(e)e.style.display='none'}

  window.fpSaveProfile=async function(){
    const p={id:window.currentUser.id,full_name:document.getElementById('fp-name').value.trim()||null,age:Number(document.getElementById('fp-age').value)||null,height_cm:Number(document.getElementById('fp-height').value)||null,weight_kg:Number(document.getElementById('fp-weight').value)||null,sex:document.getElementById('fp-sex').value||null,goal:document.getElementById('fp-goal').value,training_days:Number(document.getElementById('fp-days').value)||4,experience_level:document.getElementById('fp-level').value,activity_level:document.getElementById('fp-activity').value,equipment:document.getElementById('fp-equipment').value};
    if(!p.age||!p.height_cm||!p.weight_kg||!p.sex){alert('Yaş, boy, kilo ve cinsiyet alanlarını doldur.');return}
    const {data,error}=await window.supabaseClient.from('profiles').upsert(p).select().single(); if(error){alert('Profil kaydedilemedi: '+error.message);return} profile=data;closeProfileModal();renderProfileSummary();renderCoachDashboard();renderNutrition();
  };

  function renderProfileSummary(){
    const card=document.querySelector('#tab-profile .card'); if(!card||!profile)return;
    let box=document.getElementById('fp-profile-summary');if(!box){box=document.createElement('div');box.id='fp-profile-summary';box.style.cssText='margin-top:14px;padding:14px;background:var(--card-inner);border-radius:12px';card.appendChild(box)}
    box.innerHTML=`<b>${profile.full_name||'Sporcu'}</b><div style="font-size:.72rem;color:var(--text-muted);margin-top:5px">${profile.weight_kg} kg · ${profile.height_cm} cm · ${profile.training_days} gün/hafta · ${levelLabel(profile.experience_level)} · ${goalLabel(profile.goal)}</div><button class="btn btn-accent" style="margin-top:10px" onclick="openFitProProfile()">Profili Düzenle</button>`;
  }
  window.openFitProProfile=openProfileModal;

  function calcCalories(){
    if(!profile?.weight_kg||!profile?.height_cm||!profile?.age)return null;
    let bmr=10*Number(profile.weight_kg)+6.25*Number(profile.height_cm)-5*Number(profile.age)+(profile.sex==='male'?5:profile.sex==='female'?-161:-78);
    const activity={sedentary:1.2,light:1.375,moderate:1.55,high:1.725}[profile.activity_level||'moderate'];
    let tdee=bmr*activity; const adj={muscle_gain:250,fat_loss:-350,recomp:0,strength:150,conditioning:0}[profile.goal]||0; const kcal=Math.round((tdee+adj)/50)*50;
    const protein=Math.round(profile.weight_kg*(profile.goal==='fat_loss'?2.0:1.8)); const fat=Math.round(profile.weight_kg*0.8); const carbs=Math.max(0,Math.round((kcal-protein*4-fat*9)/4));
    return {kcal,protein,fat,carbs};
  }
  function renderNutrition(){
    const tab=document.getElementById('tab-nutrition');if(!tab)return;let box=document.getElementById('fp-macro-engine');if(!box){box=document.createElement('div');box.id='fp-macro-engine';box.className='card';tab.insertBefore(box,tab.firstChild)}
    const n=calcCalories(); if(!n){box.innerHTML='<b>🍎 Kişisel Beslenme Motoru</b><p style="font-size:.75rem;color:var(--text-muted)">Profilini tamamladığında kalori ve makroların hesaplanacak.</p>';return}
    box.innerHTML=`<h2>🍎 Kişisel Beslenme Hedefin</h2><div class="fp-stat-grid"><div class="fp-stat"><b>${n.kcal}</b><span>KCAL</span></div><div class="fp-stat"><b>${n.protein}g</b><span>PROTEİN</span></div><div class="fp-stat"><b>${n.carbs}g</b><span>KARBONHİDRAT</span></div><div class="fp-stat"><b>${n.fat}g</b><span>YAĞ</span></div></div><p style="font-size:.68rem;color:var(--text-muted)">Hedef: ${goalLabel(profile.goal)} · Aktivite: ${profile.activity_level||'moderate'}</p>`;
  }

  async function getHistory(exerciseId){
    if(!window.currentUser)return [];
    const {data}=await window.supabaseClient.from('workout_sets').select('weight_kg,reps,rir,created_at').eq('exercise_id',exerciseId).eq('completed',true).order('created_at',{ascending:false}).limit(8);return data||[];
  }
  function e1rm(weight,reps){return reps<=0?0:weight*(1+reps/30)}
  function targetFromHistory(base,history,min,max){
    if(!history.length)return Math.round(base*2)/2; const h=history[0],kg=Number(h.weight_kg)||base,reps=Number(h.reps)||min,rir=h.rir==null?2:Number(h.rir);
    if(reps>=max&&rir>=1)return Math.round((kg+2.5)*2)/2;
    if(reps<min||rir<0)return Math.max(0,Math.round((kg-2.5)*2)/2);
    return kg;
  }
  
  
  
window.renderWorkoutList = async function(){
  const c = document.getElementById('workout-list');
  if (!c) {
    console.warn("Hata: #workout-list elementi bulunamadı!");
    return;
  }
  
  c.innerHTML = '<div class="fp-progress">⏳ Kapsamlı günlük antrenman programı yükleniyor...</div>';

  // Her gün için 7-8 hareketlik zenginleştirilmiş ve GIF destekli havuz
  const exercisePool = {
    1: [ // 1. Gün: Göğüs, Omuz, Arka Kol (İtme Günü)
      {
        id: 'chest_press', mode: 'machine',
        machine: { title: 'Chest Press Makinesi', img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&auto=format&fit=crop&q=60', guide: 'Sırtını pedden ayırma, dirsekleri hafif içeri alarak it.', sets: 4, baseKg: 50, reps: 10 },
        dumbbell: { title: 'Dumbbell Bench Press', img: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&auto=format&fit=crop&q=60', guide: 'Kürek kemiklerini banka sabitle, kontrollü indir.', sets: 4, baseKg: 35, reps: 10 }
      },
      {
        id: 'incline_press', mode: 'machine',
        machine: { title: 'Incline Chest Press (Üst Göğüs)', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&auto=format&fit=crop&q=60', guide: 'Sehpayı 30-45 derece yap, köprücük kemiğine doğru it.', sets: 4, baseKg: 40, reps: 10 },
        dumbbell: { title: 'Incline Dumbbell Press', img: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=400&auto=format&fit=crop&q=60', guide: 'Yukarıda dambılları hafifçe birbirine yaklaştır.', sets: 4, baseKg: 25, reps: 10 }
      },
      {
        id: 'chest_fly', mode: 'machine',
        machine: { title: 'Pec Deck Fly (Göğüs Açış)', img: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&auto=format&fit=crop&q=60', guide: 'Göğsü kabart, kolları hafif kırık tutarak kucaklar gibi kapat.', sets: 3, baseKg: 30, reps: 12 },
        dumbbell: { title: 'Dumbbell Fly', img: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&auto=format&fit=crop&q=60', guide: 'Dirseklerdeki açı hiç değişmesin, sarılma hareketi yap.', sets: 3, baseKg: 15, reps: 12 }
      },
      {
        id: 'shoulder_press', mode: 'machine',
        machine: { title: 'Shoulder Press Makinesi', img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&auto=format&fit=crop&q=60', guide: 'Omuz başlarını sıkıştırarak yukarı it, tam kilitleme.', sets: 4, baseKg: 35, reps: 10 },
        dumbbell: { title: 'Dumbbell Shoulder Press', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&auto=format&fit=crop&q=60', guide: 'Karını sıkı tut, belini çukurlaştırma.', sets: 4, baseKg: 20, reps: 10 }
      },
      {
        id: 'lateral_raise', mode: 'machine',
        machine: { title: 'Cable Lateral Raise', img: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&auto=format&fit=crop&q=60', guide: 'Kabloyu arkadan geçir, dirsek önde yukarı kaldır.', sets: 4, baseKg: 10, reps: 12 },
        dumbbell: { title: 'Dumbbell Lateral Raise (Yan Omuz)', img: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=400&auto=format&fit=crop&q=60', guide: 'Suyu döker gibi serçe parmağı hafif yukarıda tut.', sets: 4, baseKg: 10, reps: 15 }
      },
      {
        id: 'triceps_pushdown', mode: 'machine',
        machine: { title: 'Triceps Pushdown (Kablo)', img: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&auto=format&fit=crop&q=60', guide: 'Dirsekler gövdeye sabitlensin, sadece aşağı it.', sets: 3, baseKg: 25, reps: 12 },
        dumbbell: { title: 'Dumbbell Overhead Extension', img: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&auto=format&fit=crop&q=60', guide: 'Dumbbellu iki elle kavra, başın arkasına esnet.', sets: 3, baseKg: 15, reps: 12 }
      },
      {
        id: 'triceps_dips', mode: 'machine',
        machine: { title: 'Assisted Dips / Makine Dips', img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&auto=format&fit=crop&q=60', guide: 'Gövdeyi hafif öne eğerek triceps ve alt göğsü çalıştır.', sets: 3, baseKg: 0, reps: 10 },
        dumbbell: { title: 'Skull Crusher', img: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=400&auto=format&fit=crop&q=60', guide: 'Sır üstü yat, dirsekleri sabit tutarak alna indir.', sets: 3, baseKg: 20, reps: 10 }
      }
    ],
    2: [ // 2. Gün: Sırt, Bacak, Ön Kol (Çekme & Alt Vücut Günü)
      {
        id: 'lat_pulldown', mode: 'machine',
        machine: { title: 'Lat Pulldown (Geniş Tutuş)', img: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&auto=format&fit=crop&q=60', guide: 'Göğsü kabartarak barı köprücük kemiğine doğru çek.', sets: 4, baseKg: 50, reps: 10 },
        dumbbell: { title: 'Dumbbell Row (Tek Kol Sırt)', img: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=400&auto=format&fit=crop&q=60', guide: 'Diz ve eli sehpaya koy, dirseği kalçaya doğru çek.', sets: 4, baseKg: 25, reps: 10 }
      },
      {
        id: 'seated_row', mode: 'machine',
        machine: { title: 'Seated Cable Row', img: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&auto=format&fit=crop&q=60', guide: 'Belini dik tut, kürek kemiklerini arkada sıkıştır.', sets: 4, baseKg: 45, reps: 10 },
        dumbbell: { title: 'Barbell Row', img: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&auto=format&fit=crop&q=60', guide: 'Gövdeyi 45 derece öne eğ, karın sıkı olsun.', sets: 4, baseKg: 40, reps: 10 }
      },
      {
        id: 'leg_press', mode: 'machine',
        machine: { title: 'Leg Press (Bacak Makinesi)', img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&auto=format&fit=crop&q=60', guide: 'Ayakları platformun ortasına koy, dizleri tam kilitleme.', sets: 4, baseKg: 100, reps: 10 },
        dumbbell: { title: 'Goblet Squat', img: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=400&auto=format&fit=crop&q=60', guide: 'Dumbbellu göğsüne yakın tut, derinçe çömel.', sets: 4, baseKg: 30, reps: 12 }
      },
      {
        id: 'leg_extension', mode: 'machine',
        machine: { title: 'Leg Extension (Ön Bacak)', img: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&auto=format&fit=crop&q=60', guide: 'Yukarıda bacakları tam gerginleştirip 1 saniye sıkıştır.', sets: 3, baseKg: 40, reps: 12 },
        dumbbell: { title: 'Dumbbell Lunges (Adımlama)', img: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&auto=format&fit=crop&q=60', guide: 'Öne adım at, arka diz yere hafif değsin kalk.', sets: 3, baseKg: 15, reps: 10 }
      },
      {
        id: 'leg_curl', mode: 'machine',
        machine: { title: 'Seated Leg Curl (Arka Bacak)', img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&auto=format&fit=crop&q=60', guide: 'Pedi bacağın alt kısmına sabitle, topukları kalçaya çek.', sets: 3, baseKg: 35, reps: 12 },
        dumbbell: { title: 'Romanian Deadlift (Dumbbell)', img: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=400&auto=format&fit=crop&q=60', guide: 'Sırtı düz tutarak kalçayı arkaya doğru esnet.', sets: 3, baseKg: 30, reps: 10 }
      },
      {
        id: 'calf_raise', mode: 'machine',
        machine: { title: 'Standing Calf Raise', img: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&auto=format&fit=crop&q=60', guide: 'Topukları tamamen aşağı esnetip parmak ucunda yüksel.', sets: 3, baseKg: 50, reps: 15 },
        dumbbell: { title: 'Dumbbell Calf Raise', img: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&auto=format&fit=crop&q=60', guide: 'Elinde dambıllarla basamakta parmak ucunda kalk.', sets: 3, baseKg: 20, reps: 15 }
      },
      {
        id: 'biceps_curl', mode: 'machine',
        machine: { title: 'Preacher Curl Makinesi', img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&auto=format&fit=crop&q=60', guide: 'Kolları yastığa tam yasla, bileği bükmeden yukarı kaldır.', sets: 3, baseKg: 25, reps: 12 },
        dumbbell: { title: 'Dumbbell Biceps Curl', img: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=400&auto=format&fit=crop&q=60', guide: 'Dirsekler sabit kalsın, tepe noktada bicepsleri sık.', sets: 3, baseKg: 14, reps: 12 }
      }
    ]
  };

  const currentDay = window.userCycleState?.dayIndex || 1;
  window.currentExercises = exercisePool[currentDay] || exercisePool[1];

  const items = window.currentExercises;
  let html = '<div class="fp-progress">Her seti kg + tekrar + RIR ile kaydet. Hareket görselleri ve rehberler aktif.</div>';
  
  for(const ex of items){
    const d = ex[ex.mode] || ex.machine || ex.dumbbell;
    if(!d) continue;
    
    const h = typeof getHistory === 'function' ? await getHistory(ex.id) : [];
    const target = typeof targetFromHistory === 'function' ? targetFromHistory(d.baseKg, h, Math.max(1, d.reps - 2), d.reps) : d.baseKg;
    
    html += `<div class="ex-item">
      <div class="ex-header"><div class="ex-title">${d.title}</div><button class="btn btn-switch" onclick="toggleMode('${ex.id}')">🔄 Makine / Dambıl Değiş</button></div>
      ${d.img ? `<div class="ex-media-box" style="margin:8px 0;border-radius:10px;overflow:hidden;max-height:160px;"><img src="${d.img}" alt="${d.title}" style="width:100%;height:100%;object-fit:cover;" loading="lazy"></div>` : ''}
      <div class="ex-guide"><b>Nasıl Yapılır? / Antrenör Notu:</b> ${d.guide}</div>
      <div class="fp-prev">${h.length ? `Son set: ${h[0].weight_kg} kg × ${h[0].reps} · RIR ${h[0].rir??'-'}` : 'İlk kayıt — kontrollü başla.'}</div>
      <div class="target-set-list">`;
      
    for(let i = 1; i <= (d.sets || 3); i++) {
      html += `<div class="fp-set" data-ex="${ex.id}" data-set="${i}">
        <span class="setno">${i}.S</span>
        <input class="fp-kg" type="number" step="0.5" value="${target}" placeholder="kg">
        <input class="fp-reps" type="number" min="0" value="${d.reps || 10}" placeholder="rep">
        <input class="fp-rir" type="number" min="0" max="5" step="0.5" value="2" placeholder="RIR">
        <input type="checkbox" class="fp-done" onchange="this.closest('.fp-set').classList.toggle('done',this.checked); if(this.checked && typeof startTimer==='function') startTimer(90)">
      </div>`;
    }
    html += '</div></div>';
  }
  c.innerHTML = html;
}; 
    
  
  
  
  
  
  
  /*

  window.renderWorkoutList=async function(){
    const c=document.getElementById('workout-list');if(!c)return;c.innerHTML='<div class="fp-progress">⏳ Performans geçmişin analiz ediliyor...</div>';
    const items=window.currentExercises||[];let html='<div class="fp-progress">Her seti kg + tekrar + RIR ile kaydet. Motor bir sonraki hedefi geçmiş performansa göre belirler.</div>';
    for(const ex of items){const d=ex[ex.mode],h=await getHistory(ex.id),target=targetFromHistory(d.baseKg,h,Math.max(1,d.reps-2),d.reps);html+=`<div class="ex-item"><div class="ex-header"><div class="ex-title">${d.title}</div><button class="btn btn-switch" onclick="toggleMode('${ex.id}')">🔄 ${ex.mode==='machine'?'Dambıl Yap':'Makine Yap'}</button></div><div class="ex-media-box"><img src="${d.img}" alt="${d.title}" loading="lazy"></div><div class="ex-guide"><b>Antrenör Notu:</b> ${d.guide}</div><div class="fp-prev">${h.length?`Son set: ${h[0].weight_kg} kg × ${h[0].reps} · RIR ${h[0].rir??'-'} · Tahmini 1RM ${e1rm(Number(h[0].weight_kg),Number(h[0].reps)).toFixed(1)} kg`:'İlk kayıt — kontrollü bir başlangıç ağırlığı seç.'}</div><div class="target-set-list">`;
      for(let i=1;i<=d.sets;i++)html+=`<div class="fp-set" data-ex="${ex.id}" data-set="${i}"><span class="setno">${i}.S</span><input class="fp-kg" type="number" step="0.5" value="${target}" placeholder="kg"><input class="fp-reps" type="number" min="0" value="${d.reps}" placeholder="rep"><input class="fp-rir" type="number" min="0" max="5" step="0.5" value="2" placeholder="RIR"><input type="checkbox" class="fp-done" onchange="this.closest('.fp-set').classList.toggle('done',this.checked); if(this.checked) startTimer(90)"></div>`;
      html+='</div></div>';
    }c.innerHTML=html;
  };
  */
  
  
  
  window.startFitProWorkout = async function(){
  // 1. İstemci kontrolü
  let attempts = 0;
  while (!window.supabaseClient && attempts < 15) {
    await new Promise(r => setTimeout(r, 200));
    attempts++;
  }

  if (!window.supabaseClient) {
    alert('Supabase istemcisi yüklenemedi. Sayfayı yenileyin.');
    return null;
  }

  // 2. Oturum kontrolü
  if (!window.currentUser) {
    try {
      const { data: { session } } = await window.supabaseClient.auth.getSession();
      if (session && session.user) {
        window.currentUser = session.user;
      }
    } catch (e) {
      console.warn('Oturum alınamadı:', e);
    }
  }

  if (!window.currentUser) {
    alert('Oturum bulunamadı. Lütfen giriş yapın.');
    const authSec = document.getElementById('auth-section');
    if (authSec) authSec.scrollIntoView({ behavior: 'smooth' });
    return null;
  }

  if (activeWorkoutId) return activeWorkoutId;

  // 3. Egzersiz listesi boşsa varsayılan listeyi yükle (Eğer başka bir yerde tanımlı değilse)
  if (!window.currentExercises || window.currentExercises.length === 0) {
    // Projendeki varsayılan egzersiz havuzunu burada tetikleyebilirsin
    if (typeof window.loadDefaultExercises === 'function') {
      window.loadDefaultExercises();
    }
  }

  const names = { 1: '1. Gün: Göğüs / Omuz / Arka Kol', 3: '3. Gün: Sırt / Bacak / Ön Kol' };
  const dayIdx = window.userCycleState?.dayIndex || 1;
  const name = names[dayIdx] || 'FitPro Antrenmanı';

  const { data, error } = await window.supabaseClient.from('workouts').insert({
    user_id: window.currentUser.id,
    cycle_day: dayIdx,
    name,
    started_at: new Date().toISOString()
  }).select().single();

  if (error) {
    alert('Antrenman başlatılamadı: ' + error.message);
    return null;
  }

  activeWorkoutId = data.id;
  activeWorkoutStartedAt = Date.now();
  
  const b = document.getElementById('fp-start-workout');
  if (b) b.textContent = '● ANTRENMAN AKTİF';

  // HAREKETLERİN GELMESİNİ GARANTİLEYEN KONTROL:
  // Eğer global currentExercises boşsa, sistemin ana egzersiz listesini tetikle veya doldur
  if ((!window.currentExercises || window.currentExercises.length === 0) && typeof window.loadExercises === 'function') {
    window.loadExercises();
  }

  // Listeyi ekrana bas
  if (typeof window.renderWorkoutList === 'function') {
    await window.renderWorkoutList();
  } else {
    console.warn("renderWorkoutList fonksiyonu bulunamadı.");
  }
  
  return data.id;
};
  
  
/*
  window.startFitProWorkout=async function(){
    if(!window.currentUser)return alert('Önce giriş yapmalısın.');if(activeWorkoutId)return activeWorkoutId;
    const names={1:'1. Gün: Göğüs / Omuz / Arka Kol',3:'3. Gün: Sırt / Bacak / Ön Kol'};const name=names[window.userCycleState.dayIndex]||'FitPro Antrenmanı';
    const {data,error}=await window.supabaseClient.from('workouts').insert({user_id:window.currentUser.id,cycle_day:window.userCycleState.dayIndex,name,started_at:new Date().toISOString()}).select().single();if(error){alert('Antrenman başlatılamadı: '+error.message);return null}activeWorkoutId=data.id;activeWorkoutStartedAt=Date.now();const b=document.getElementById('fp-start-workout');if(b)b.textContent='● ANTRENMAN AKTİF';return data.id;
  };
  */

  window.finishWorkout=async function(){
    if(!window.currentUser)return;const rows=[...document.querySelectorAll('.fp-set')],done=rows.filter(r=>r.querySelector('.fp-done')?.checked);if(!done.length)return alert('En az bir seti tamamlandı olarak işaretle.');
    const wid=await window.startFitProWorkout();if(!wid)return;const sets=done.map(r=>({workout_id:wid,exercise_id:r.dataset.ex,set_number:+r.dataset.set,weight_kg:+r.querySelector('.fp-kg').value||0,reps:+r.querySelector('.fp-reps').value||0,rir:r.querySelector('.fp-rir').value===''?null:+r.querySelector('.fp-rir').value,completed:true,is_warmup:false}));
    const {error}=await window.supabaseClient.from('workout_sets').upsert(sets,{onConflict:'workout_id,exercise_id,set_number'});if(error)return alert('Setler kaydedilemedi: '+error.message);
    const volume=sets.reduce((a,s)=>a+s.weight_kg*s.reps,0),duration=activeWorkoutStartedAt?Math.round((Date.now()-activeWorkoutStartedAt)/1000):null;
    await window.supabaseClient.from('workouts').update({completed_at:new Date().toISOString(),duration_seconds:duration,total_volume_kg:volume}).eq('id',wid);
    await updatePRs(sets); alert(`🏁 Antrenman kaydedildi!\nHacim: ${volume.toFixed(1)} kg`);activeWorkoutId=null;activeWorkoutStartedAt=null;if(window.confetti)confetti({particleCount:150});
    if(window.userCycleState.dayIndex===1)window.userCycleState.dayIndex=2;else if(window.userCycleState.dayIndex===2)window.userCycleState.dayIndex=3;else if(window.userCycleState.dayIndex===3)window.userCycleState.dayIndex=4;else window.userCycleState.dayIndex=1;localStorage.setItem('fitpro_user_state',JSON.stringify(window.userCycleState));renderCoachDashboard();
  };

  async function updatePRs(sets){
    for(const s of sets){if(!s.reps||!s.weight_kg)continue;const est=e1rm(s.weight_kg,s.reps);const {data}=await window.supabaseClient.from('personal_records').select('*').eq('user_id',window.currentUser.id).eq('exercise_id',s.exercise_id).maybeSingle();if(!data||est>Number(data.best_1rm||0)){await window.supabaseClient.from('personal_records').upsert({user_id:window.currentUser.id,exercise_id:s.exercise_id,best_weight_kg:s.weight_kg,best_reps:s.reps,best_1rm:est,updated_at:new Date().toISOString()},{onConflict:'user_id,exercise_id'})}}
  }

  async function recoveryToday(){if(!window.currentUser)return null;const {data}=await window.supabaseClient.from('recovery_logs').select('*').eq('user_id',window.currentUser.id).eq('logged_at',new Date().toISOString().slice(0,10)).maybeSingle();return data}
  function recoveryScore(r){if(!r)return null;const sleep=Math.min(10,(Number(r.sleep_hours||0)/8)*10),energy=Number(r.energy||5),soreness=11-Number(r.soreness||5),stress=11-Number(r.stress||5);return Math.round((sleep+energy+soreness+stress)/4)}
  function readinessText(score){if(score==null)return 'Bugünkü recovery kaydını gir';if(score>=8)return '🟢 Hazır — planlanan yoğunluğu uygula';if(score>=6)return '🟡 Orta — RIR 2–3 tut, gerekirse yükü azalt';return '🔴 Düşük — hacmi azalt, failure yapma'}

  async function ensureRecoveryUI(){
    const tab=document.getElementById('tab-workout');if(!tab||document.getElementById('fp-recovery-card'))return;const card=document.createElement('div');card.id='fp-recovery-card';card.className='card';tab.insertBefore(card,tab.firstChild);
    const r=await recoveryToday(),score=recoveryScore(r);card.innerHTML=`<h2>🧠 Bugünkü Readiness</h2><div class="fp-score">${score??'—'}<span style="font-size:.8rem;color:var(--text-muted)"> / 10</span></div><div style="font-size:.75rem;margin:4px 0 10px">${readinessText(score)}</div><div class="fp-grid"><div class="fp-field"><label>UYKU (SAAT)</label><input id="fp-sleep" type="number" step="0.5" min="0" max="16" value="${r?.sleep_hours??8}"></div><div class="fp-field"><label>ENERJİ 1–10</label><input id="fp-energy" type="number" min="1" max="10" value="${r?.energy??7}"></div><div class="fp-field"><label>KAS AĞRISI 1–10</label><input id="fp-soreness" type="number" min="1" max="10" value="${r?.soreness??3}"></div><div class="fp-field"><label>STRES 1–10</label><input id="fp-stress" type="number" min="1" max="10" value="${r?.stress??3}"></div></div><button class="btn btn-accent" style="margin-top:10px;width:100%" onclick="saveFitProRecovery()">Recovery'yi Kaydet</button>`;
  }
  window.saveFitProRecovery=async function(){const payload={user_id:window.currentUser.id,logged_at:new Date().toISOString().slice(0,10),sleep_hours:+document.getElementById('fp-sleep').value,energy:+document.getElementById('fp-energy').value,soreness:+document.getElementById('fp-soreness').value,stress:+document.getElementById('fp-stress').value};payload.readiness=recoveryScore(payload);const {error}=await window.supabaseClient.from('recovery_logs').upsert(payload,{onConflict:'user_id,logged_at'});if(error)alert(error.message);else{alert('Recovery kaydedildi.');ensureRecoveryUI()}};

  async function renderCoachDashboard(){
    const card=document.querySelector('#tab-workout .coach-card');if(!card)return;const r=await recoveryToday(),score=recoveryScore(r),n=calcCalories();
    const title=document.getElementById('coach-day-title'),tip=document.getElementById('coach-tip');if(title)title.textContent=score==null?'🤖 COACH HAZIR':score>=8?'🟢 BUGÜN GÜÇLÜ GİT':score>=6?'🟡 BUGÜN KONTROLLÜ İLERLE':'🔴 BUGÜN TOPARLANMAYA ODAKLAN';if(tip)tip.textContent=`${readinessText(score)}${n?' · Hedef '+n.kcal+' kcal':''}`;
  }

  async function enhancedSession(){await originalCheckUserSession();if(!window.currentUser)return;addModal();const p=await loadProfile();if(!p||!p.weight_kg||!p.height_cm||!p.age||!p.sex)openProfileModal();else{renderProfileSummary();renderNutrition();await ensureRecoveryUI();await renderCoachDashboard()}}
  window.checkUserSession=enhancedSession;

  document.addEventListener('DOMContentLoaded',()=>setTimeout(async()=>{if(window.currentUser){addModal();profile=await loadProfile();if(!profile?.weight_kg||!profile?.height_cm||!profile?.age||!profile?.sex)openProfileModal();else{renderProfileSummary();renderNutrition();await ensureRecoveryUI();await renderCoachDashboard()}}
    const card=document.getElementById('workout-card');if(card&&!document.getElementById('fp-start-workout')){const b=document.createElement('button');b.id='fp-start-workout';b.className='btn btn-primary';b.style.cssText='width:100%;margin:12px 0';b.textContent='▶ ANTRENMANI BAŞLAT';b.onclick=window.startFitProWorkout;card.insertBefore(b,card.querySelector('#workout-list'))}
  },700));
})();
