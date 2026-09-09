/* FitPro ELITE v7 - Adaptive Profile + Exercise Library + Program Engine */
(function(){
  'use strict';
  const $ = (id) => document.getElementById(id);
  const key = (base) => `${base}_${fpUser?.id || 'guest'}`;
  const lsKey = 'fitpro_v7_profile';
  const planKey = 'fitpro_v7_plan';
  const stateKey = 'fitpro_v7_state';
  let fpUser = null;
  let fpProfile = null;
  let fpPlan = null;
  let fpState = null;

  const exercises = [
    ['bench','Barbell Bench Press','Göğüs','barbell','push','beginner'],['incline-bench','Incline Barbell Press','Üst Göğüs','barbell','push','beginner'],['db-bench','Dumbbell Bench Press','Göğüs','dumbbell','push','beginner'],['incline-db','Incline Dumbbell Press','Üst Göğüs','dumbbell','push','beginner'],['chest-machine','Chest Press Machine','Göğüs','machine','push','beginner'],['pec-deck','Pec Deck','Göğüs','machine','push','beginner'],['cable-fly','Cable Chest Fly','Göğüs','cable','push','beginner'],['pushup','Push-Up','Göğüs','bodyweight','push','beginner'],
    ['ohp','Barbell Overhead Press','Omuz','barbell','push','intermediate'],['db-ohp','Dumbbell Shoulder Press','Omuz','dumbbell','push','beginner'],['machine-ohp','Machine Shoulder Press','Omuz','machine','push','beginner'],['lateral-db','Dumbbell Lateral Raise','Yan Omuz','dumbbell','push','beginner'],['lateral-cable','Cable Lateral Raise','Yan Omuz','cable','push','intermediate'],['rear-delt','Reverse Pec Deck','Arka Omuz','machine','pull','beginner'],['face-pull','Face Pull','Arka Omuz','cable','pull','beginner'],
    ['triceps-push','Cable Triceps Pushdown','Triceps','cable','push','beginner'],['oh-triceps','Overhead Cable Triceps Extension','Triceps','cable','push','intermediate'],['db-triceps','Dumbbell Overhead Triceps Extension','Triceps','dumbbell','push','beginner'],['close-bench','Close-Grip Bench Press','Triceps','barbell','push','intermediate'],
    ['pullup','Pull-Up','Sırt','bodyweight','pull','intermediate'],['lat','Lat Pulldown','Sırt','cable','pull','beginner'],['neutral-lat','Neutral-Grip Lat Pulldown','Sırt','cable','pull','beginner'],['barbell-row','Barbell Row','Sırt','barbell','pull','intermediate'],['db-row','One-Arm Dumbbell Row','Sırt','dumbbell','pull','beginner'],['cable-row','Seated Cable Row','Sırt','cable','pull','beginner'],['chest-row','Chest-Supported Row','Sırt','machine','pull','beginner'],['tbar','T-Bar Row','Sırt','machine','pull','intermediate'],['straight-arm','Straight-Arm Pulldown','Lat','cable','pull','beginner'],
    ['barbell-curl','Barbell Curl','Biceps','barbell','pull','beginner'],['db-curl','Dumbbell Curl','Biceps','dumbbell','pull','beginner'],['hammer','Hammer Curl','Biceps','dumbbell','pull','beginner'],['preacher','Preacher Curl','Biceps','machine','pull','beginner'],['cable-curl','Cable Curl','Biceps','cable','pull','beginner'],
    ['squat','Barbell Back Squat','Quadriceps','barbell','legs','intermediate'],['front-squat','Front Squat','Quadriceps','barbell','legs','advanced'],['goblet','Goblet Squat','Quadriceps','dumbbell','legs','beginner'],['leg-press','Leg Press','Quadriceps','machine','legs','beginner'],['hack-squat','Hack Squat','Quadriceps','machine','legs','intermediate'],['split-squat','Bulgarian Split Squat','Quadriceps','dumbbell','legs','intermediate'],['lunges','Walking Lunge','Quadriceps','dumbbell','legs','beginner'],['leg-extension','Leg Extension','Quadriceps','machine','legs','beginner'],
    ['rdl','Romanian Deadlift','Hamstring','barbell','legs','intermediate'],['db-rdl','Dumbbell Romanian Deadlift','Hamstring','dumbbell','legs','beginner'],['deadlift','Conventional Deadlift','Posterior Chain','barbell','legs','advanced'],['trap-dead','Trap Bar Deadlift','Posterior Chain','machine','legs','intermediate'],['leg-curl','Lying Leg Curl','Hamstring','machine','legs','beginner'],['seated-curl','Seated Leg Curl','Hamstring','machine','legs','beginner'],['hip-thrust','Barbell Hip Thrust','Glute','barbell','legs','intermediate'],['glute-bridge','Glute Bridge','Glute','bodyweight','legs','beginner'],['calf','Standing Calf Raise','Calf','machine','legs','beginner'],['seated-calf','Seated Calf Raise','Calf','machine','legs','beginner'],
    ['cable-crunch','Cable Crunch','Core','cable','core','beginner'],['plank','Plank','Core','bodyweight','core','beginner'],['ab-wheel','Ab Wheel','Core','bodyweight','core','intermediate'],['hanging-knee','Hanging Knee Raise','Core','bodyweight','core','intermediate'],['dead-bug','Dead Bug','Core','bodyweight','core','beginner'],
    ['bike','Stationary Bike','Kardiyo','cardio','cardio','beginner'],['treadmill','Treadmill Walk','Kardiyo','cardio','cardio','beginner'],['incline-walk','Incline Treadmill Walk','Kardiyo','cardio','cardio','beginner'],['rower','Rowing Machine','Kardiyo','cardio','cardio','intermediate'],['elliptical','Elliptical','Kardiyo','cardio','cardio','beginner']
  ].map(x=>({id:x[0],name:x[1],muscle:x[2],equipment:x[3],pattern:x[4],level:x[5]}));

  const homeAllowed = new Set(['dumbbell','bodyweight','cable']);
  const dayNames = ['Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi','Pazar'];
  const goals = { muscle:'Kas kazanımı', fat:'Yağ kaybı', recomp:'Recomp', strength:'Güç', fitness:'Genel fitness', performance:'Performans' };
  const levels = { beginner:'Yeni başladım', novice:'Başlangıç', intermediate:'Orta', advanced:'İleri', athlete:'Sporcu' };

  function getLocalProfile(){ try{return JSON.parse(localStorage.getItem(key(lsKey))||'null')}catch{return null} }
  function saveLocalProfile(p){ localStorage.setItem(key(lsKey),JSON.stringify(p)); }
  function loadState(){ try{fpState=JSON.parse(localStorage.getItem(key(stateKey))||'null')||{activeDay:0,completed:[]}}catch{fpState={activeDay:0,completed:[]}} }
  function saveState(){localStorage.setItem(key(stateKey),JSON.stringify(fpState));}
  function availableEquipment(){return fpProfile?.equipment==='home' ? homeAllowed : new Set(['barbell','dumbbell','machine','cable','bodyweight']);}

  function levelRank(l){return {beginner:0,novice:1,intermediate:2,advanced:3,athlete:4}[l]??1}
  function eligible(e){
    const eq=availableEquipment();
    if(equipmentAllowed(e,eq)===false)return false;
    const lr=levelRank(fpProfile?.level||'beginner');
    if(levelRank(e.level)>Math.max(0,lr+1)) return false;
    return true;
  }
  function equipmentAllowed(e,eq){ if(e.equipment==='cardio')return true; return eq.has(e.equipment); }

  function chooseByPattern(pattern,muscle,used){
    const pool=exercises.filter(e=>eligible(e)&&(!pattern||e.pattern===pattern)&&(!muscle||e.muscle===muscle)&&!used.has(e.id));
    return pool[0] || exercises.find(e=>eligible(e)&&!used.has(e.id)) || exercises.find(e=>e.pattern===pattern) || exercises[0];
  }
  function prescription(e, role){
    const beginner=levelRank(fpProfile?.level||'beginner')<=1;
    const goal=fpProfile?.goal||'fitness';
    if(e.equipment==='cardio')return {sets:1,reps: goal==='fat'?'20 dk':'15 dk',rest:60,rir:'Konforlu tempo'};
    let sets=beginner?2:3;
    if(role==='main') sets=beginner?3:4;
    if(goal==='strength'&&role==='main') sets=4;
    if(goal==='fat') sets=Math.max(2,sets-1);
    const compound=['barbell','machine'].includes(e.equipment)&&['push','pull','legs'].includes(e.pattern);
    const reps=goal==='strength'&&role==='main'?(beginner?'6–8':'4–6'):(compound?'6–10':'10–15');
    return {sets,reps,rest:compound?120:75,rir:beginner?'3–4':'2–3'};
  }
  function makeDay(label, patterns){
    const used=new Set(); const list=[];
    patterns.forEach(([pattern,muscle,role])=>{const e=chooseByPattern(pattern,muscle,used); if(e){used.add(e.id); list.push({...e,...prescription(e,role)});}});
    return {label,exercises:list};
  }
  function generatePlan(){
    const n=fpProfile.daysPerWeek;
    const labels=fpProfile.weekdays;
    const days=[];
    if(n===2){
      days.push(makeDay('Full Body A',[['legs','Quadriceps','main'],['push','Göğüs','main'],['pull','Sırt','main'],['legs','Hamstring','accessory'],['push','Omuz','accessory'],['core','Core','accessory']]));
      days.push(makeDay('Full Body B',[['legs','Glute','main'],['push','Göğüs','main'],['pull','Sırt','main'],['legs','Quadriceps','accessory'],['pull','Biceps','accessory'],['core','Core','accessory']]));
    } else if(n===3){
      days.push(makeDay('Full Body A',[['legs','Quadriceps','main'],['push','Göğüs','main'],['pull','Sırt','main'],['core','Core','accessory']]));
      days.push(makeDay('Full Body B',[['legs','Hamstring','main'],['push','Omuz','main'],['pull','Sırt','main'],['legs','Glute','accessory'],['core','Core','accessory']]));
      days.push(makeDay('Full Body C',[['legs','Glute','main'],['push','Göğüs','main'],['pull','Biceps','accessory'],['pull','Sırt','main'],['push','Triceps','accessory']]));
    } else if(n===4){
      days.push(makeDay('Upper A',[['push','Göğüs','main'],['pull','Sırt','main'],['push','Omuz','accessory'],['pull','Biceps','accessory'],['push','Triceps','accessory']]));
      days.push(makeDay('Lower A',[['legs','Quadriceps','main'],['legs','Hamstring','main'],['legs','Glute','accessory'],['legs','Calf','accessory'],['core','Core','accessory']]));
      days.push(makeDay('Upper B',[['push','Göğüs','main'],['pull','Sırt','main'],['pull','Omuz','accessory'],['push','Triceps','accessory'],['pull','Biceps','accessory']]));
      days.push(makeDay('Lower B',[['legs','Glute','main'],['legs','Quadriceps','main'],['legs','Hamstring','accessory'],['legs','Calf','accessory'],['core','Core','accessory']]));
    } else if(n===5){
      days.push(makeDay('Push',[['push','Göğüs','main'],['push','Omuz','main'],['push','Triceps','accessory'],['push','Yan Omuz','accessory']]));
      days.push(makeDay('Pull',[['pull','Sırt','main'],['pull','Lat','accessory'],['pull','Biceps','accessory'],['pull','Arka Omuz','accessory']]));
      days.push(makeDay('Legs',[['legs','Quadriceps','main'],['legs','Hamstring','main'],['legs','Glute','accessory'],['legs','Calf','accessory'],['core','Core','accessory']]));
      days.push(makeDay('Upper',[['push','Göğüs','main'],['pull','Sırt','main'],['push','Omuz','accessory'],['pull','Biceps','accessory'],['push','Triceps','accessory']]));
      days.push(makeDay('Lower',[['legs','Glute','main'],['legs','Quadriceps','main'],['legs','Hamstring','accessory'],['legs','Calf','accessory'],['core','Core','accessory']]));
    } else {
      ['Push A','Pull A','Legs A','Push B','Pull B','Legs B'].forEach((label,i)=>{
        const p=i%3===0?[['push','Göğüs','main'],['push','Omuz','main'],['push','Triceps','accessory'],['push','Yan Omuz','accessory']]:i%3===1?[['pull','Sırt','main'],['pull','Lat','accessory'],['pull','Biceps','accessory'],['pull','Arka Omuz','accessory']]:[['legs','Quadriceps','main'],['legs','Hamstring','main'],['legs','Glute','accessory'],['legs','Calf','accessory'],['core','Core','accessory']];
        days.push(makeDay(label,p));
      });
    }
    fpPlan={days,weekdays:labels,generatedAt:new Date().toISOString()};
    localStorage.setItem(key(planKey),JSON.stringify(fpPlan));
    return fpPlan;
  }

  async function saveProfile(){
    const p={
      fullName: $('fp-name').value.trim(), age:+$('fp-age').value||null, sex:$('fp-sex').value,
      heightCm:+$('fp-height').value||null, weightKg:+$('fp-weight').value||null,
      goal:$('fp-goal').value, level:$('fp-level').value, daysPerWeek:+$('fp-days').value,
      weekdays:[...document.querySelectorAll('#fp-days-grid input:checked')].map(x=>+x.value),
      equipment:$('fp-equipment').value, sessionMinutes:+$('fp-duration').value,
      activity:$('fp-activity').value, updatedAt:new Date().toISOString()
    };
    if(p.weekdays.length!==p.daysPerWeek){alert('Lütfen seçtiğin gün sayısı kadar haftalık gün işaretle.');return;}
    fpProfile=p; saveLocalProfile(p); generatePlan(); hideModal(); renderProfile(); renderAdaptiveDashboard();
    const client = window.supabaseClient || (typeof supabaseClient !== 'undefined' ? supabaseClient : null);
    if(client && fpUser){
      try{await client.from('profiles').upsert({id:fpUser.id,full_name:p.fullName,age:p.age,height_cm:p.heightCm,weight_kg:p.weightKg,sex:p.sex,goal:p.goal,training_days:p.daysPerWeek,experience_level:p.level,activity_level:p.activity,equipment:p.equipment},{onConflict:'id'});}catch(e){console.warn('Profil cloud kaydı:',e)}
    }
  }
  function showModal(){ $('fp-profile-modal').classList.add('show'); }
  function hideModal(){ $('fp-profile-modal').classList.remove('show'); }
  function renderProfile(){
    if(!fpProfile)return;
    $('fp-profile-summary').innerHTML=`<b>${escapeHtml(fpProfile.fullName||'Sporcu')}</b><br>${levels[fpProfile.level]} · ${goals[fpProfile.goal]} · Haftada ${fpProfile.daysPerWeek} gün<br>${fpProfile.weekdays.map(i=>dayNames[i]).join(' · ')}`;
  }
  function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}

  function renderAdaptiveDashboard(){
    if(!fpPlan||!fpProfile)return;
    const today=(new Date().getDay()+6)%7;
    let idx=fpPlan.weekdays.indexOf(today); if(idx<0) idx=0;
    fpState.activeDay=idx; saveState();
    const d=fpPlan.days[idx];
    const title=$('coach-day-title'), tip=$('coach-tip');
    if(title)title.textContent=`🏋️ ${d.label} · ${dayNames[fpPlan.weekdays[idx]]||'Bugün'}`;
    if(tip)tip.textContent=`${fpProfile.daysPerWeek} günlük program · ${levels[fpProfile.level]} · ${goals[fpProfile.goal]}. Bugün ${d.exercises.length} hareket var.`;
    renderAdaptiveWorkout(d);
  }
  function renderAdaptiveWorkout(day){
    const c=$('workout-list'); if(!c)return;
    c.innerHTML=day.exercises.map((e,i)=>{
      const imageMap={bench:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bench-Press.gif',squat:'https://fitnessprogramer.com/wp-content/uploads/2021/02/BARBELL-SQUAT.gif',deadlift:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Deadlift.gif',lat:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Lat-Pulldown.gif','db-bench':'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Bench-Press.gif','leg-press':'https://fitnessprogramer.com/wp-content/uploads/2021/02/Leg-Press.gif'};
      const img=imageMap[e.id];
      const sets=Array.from({length:e.sets}).map((_,s)=>`<div class="target-set-item"><span>${s+1}. SET</span><span class="target-val">${e.reps} · RIR ${e.rir}</span><input type="checkbox" aria-label="${e.name} set ${s+1}" onchange="if(this.checked) startTimer(${e.rest})"></div>`).join('');
      return `<div class="ex-item"><div class="ex-header"><div class="ex-title">${i+1}. ${escapeHtml(e.name)}</div><span style="font-size:.7rem;color:var(--text-muted)">${e.muscle} · ${e.equipment}</span></div>${img?`<div class="ex-media-box"><img src="${img}" alt="${escapeHtml(e.name)}" loading="lazy" onerror="this.parentElement.style.display='none'"></div>`:''}<div class="ex-guide"><b>Coach:</b> Kontrollü tekrar, teknik bozulmadan bitir. Hedef ${e.reps} tekrar, RIR ${e.rir}. Dinlenme ${e.rest} sn.</div><div class="target-set-list">${sets}</div></div>`;
    }).join('');
  }
  function renderLibrary(){
    const c=$('fp-library-list');if(!c)return;
    const q=($('fp-ex-search').value||'').toLocaleLowerCase('tr'); const muscle=$('fp-ex-muscle').value; const eq=$('fp-ex-eq').value;
    const list=exercises.filter(e=>(!q||e.name.toLocaleLowerCase('tr').includes(q))&&(!muscle||e.muscle===muscle)&&(!eq||e.equipment===eq));
    c.innerHTML=`<div style="font-size:.75rem;color:var(--text-muted);margin-bottom:8px">${list.length} egzersiz bulundu · başlangıçtan ileri seviyeye</div>`+list.map(e=>`<div class="history-item"><span><b>${escapeHtml(e.name)}</b><br><small>${e.muscle} · ${e.equipment} · ${levels[e.level]}</small></span><span style="color:var(--primary);font-weight:800">${e.pattern.toUpperCase()}</span></div>`).join('');
  }
  function addProfileUI(){
    const style=document.createElement('style');style.textContent=`#fp-profile-modal{position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:20000;display:none;align-items:center;justify-content:center;padding:14px}#fp-profile-modal.show{display:flex}.fp-modal-card{background:var(--card-bg);border:1px solid var(--border);border-radius:24px;padding:20px;width:min(520px,100%);max-height:92vh;overflow:auto}.fp-field{margin-bottom:10px}.fp-field label{display:block;font-size:.72rem;color:var(--text-muted);font-weight:800;margin-bottom:4px}.fp-field input,.fp-field select{width:100%;padding:10px;border-radius:10px;border:1px solid var(--border);background:var(--input-bg);color:var(--text)}.fp-days{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}.fp-days label{background:var(--card-inner);padding:8px;border-radius:9px;text-align:center;font-size:.7rem}.fp-profile-card{border:1px solid var(--primary);background:var(--primary-glow);border-radius:16px;padding:12px;margin-bottom:12px}.fp-library{max-height:360px;overflow:auto}`;document.head.appendChild(style);
    const m=document.createElement('div');m.id='fp-profile-modal';m.innerHTML=`<div class="fp-modal-card"><h2 style="border:0;margin-bottom:4px">🎯 FitPro Profilini Oluştur</h2><p style="font-size:.78rem;color:var(--text-muted)">Bu bilgiler program motorunun sana özel plan oluşturması için kullanılır. Sonradan Profil sekmesinden değiştirebilirsin.</p><div class="fp-field"><label>AD / TAKMA AD</label><input id="fp-name" placeholder="Örn. Onur"></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><div class="fp-field"><label>YAŞ</label><input id="fp-age" type="number" min="13" max="100"></div><div class="fp-field"><label>CİNSİYET</label><select id="fp-sex"><option value="male">Erkek</option><option value="female">Kadın</option><option value="other">Belirtmek istemiyorum</option></select></div></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><div class="fp-field"><label>BOY (CM)</label><input id="fp-height" type="number"></div><div class="fp-field"><label>KİLO (KG)</label><input id="fp-weight" type="number" step="0.1"></div></div><div class="fp-field"><label>HEDEF</label><select id="fp-goal">${Object.entries(goals).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></div><div class="fp-field"><label>SEVİYE</label><select id="fp-level">${Object.entries(levels).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></div><div class="fp-field"><label>HAFTADA KAÇ GÜN?</label><select id="fp-days"><option>2</option><option>3</option><option selected>4</option><option>5</option><option>6</option></select></div><div class="fp-field"><label>HANGİ GÜNLER?</label><div class="fp-days" id="fp-days-grid">${dayNames.map((d,i)=>`<label><input type="checkbox" value="${i}"> ${d.slice(0,3)}</label>`).join('')}</div></div><div class="fp-field"><label>EKİPMAN</label><select id="fp-equipment"><option value="gym">Spor salonu</option><option value="home">Ev / sınırlı ekipman</option></select></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><div class="fp-field"><label>ANTRENMAN SÜRESİ</label><select id="fp-duration"><option>30</option><option>45</option><option selected>60</option><option>75</option><option>90</option></select></div><div class="fp-field"><label>AKTİVİTE</label><select id="fp-activity"><option value="low">Düşük</option><option value="moderate" selected>Orta</option><option value="high">Yüksek</option></select></div></div><button class="btn btn-primary" style="width:100%" onclick="fpSaveProfile()">🚀 Profilimi Kaydet ve Programı Oluştur</button></div>`;document.body.appendChild(m);
    $('fp-days').addEventListener('change',()=>{const n=+$('fp-days').value;document.querySelectorAll('#fp-days-grid input').forEach(x=>x.checked=false);[0,2,4,6,1,3].slice(0,n).forEach(i=>document.querySelector(`#fp-days-grid input[value="${i}"]`).checked=true)});
  }
  function addProfileCard(){
    const tab=$('tab-profile'); if(!tab)return;
    const old=tab.querySelector('.fp-v7-profile');if(old)old.remove();
    const d=document.createElement('div');d.className='card fp-v7-profile';d.innerHTML=`<h2>👤 Kişisel Profil <button class="btn btn-primary" onclick="fpOpenProfile()">Düzenle</button></h2><div id="fp-profile-summary" class="fp-profile-card">Profil yükleniyor...</div><div class="card" style="background:var(--card-inner)"><h2 style="font-size:.9rem">🏋️ Egzersiz Kütüphanesi</h2><div style="display:grid;grid-template-columns:1fr 1fr;gap:7px"><input id="fp-ex-search" class="progress-input" placeholder="Egzersiz ara"><select id="fp-ex-eq" class="progress-input"><option value="">Tüm ekipman</option><option value="barbell">Barbell</option><option value="dumbbell">Dambıl</option><option value="machine">Makine</option><option value="cable">Kablo</option><option value="bodyweight">Vücut ağırlığı</option></select></div><div class="fp-library" id="fp-library-list"></div></div>`;tab.prepend(d);['fp-ex-search','fp-ex-eq'].forEach(id=>$(id).addEventListener('input',renderLibrary));renderProfile();renderLibrary();
  }
  async function boot(){
    addProfileUI(); addProfileCard(); loadState();
    try{const client = window.supabaseClient || (typeof supabaseClient !== 'undefined' ? supabaseClient : null); if(client){const r=await client.auth.getUser();fpUser=r.data.user;}}catch(e){}
    fpProfile=getLocalProfile();
    if(!fpProfile && fpUser){try{const {data}=await client.from('profiles').select('*').eq('id',fpUser.id).maybeSingle();if(data){fpProfile={fullName:data.full_name,age:data.age,sex:data.sex,heightCm:data.height_cm,weightKg:data.weight_kg,goal:data.goal||'fitness',level:data.experience_level||'beginner',daysPerWeek:data.training_days||4,weekdays:[0,2,4,6],equipment:data.equipment||'gym',sessionMinutes:60,activity:data.activity_level||'moderate'};saveLocalProfile(fpProfile);}}catch(e){}}
    if(!fpProfile){setTimeout(showModal,250);return;}
    fpPlan=JSON.parse(localStorage.getItem(key(planKey))||'null')||generatePlan();
    renderProfile();renderLibrary();renderAdaptiveDashboard();
  }
  window.fpSaveProfile=saveProfile;window.fpOpenProfile=showModal;window.fpGeneratePlan=generatePlan;
  document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,350));
})();
