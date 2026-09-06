/* FitPro ELITE v4 - Coach Engine
   Deterministic decision-support layer: readiness, overload, fatigue, deload,
   weekly volume, PR/1RM trends and next-session recommendations.
*/
(function(){
  const muscles={ex1:'chest',ex2:'chest',ex3:'chest',ex4:'shoulders',ex5:'shoulders',ex6:'triceps',ex7:'back',ex8:'back',ex9:'legs',ex10:'hamstrings',ex11:'biceps',ex12:'biceps'};
  const labels={chest:'Göğüs',shoulders:'Omuz',triceps:'Arka kol',back:'Sırt',legs:'Bacak',hamstrings:'Arka bacak',biceps:'Ön kol'};
  const state={weekly:null, recommendation:null};
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));

  function addStyles(){if($('fp-v4-style'))return;const st=document.createElement('style');st.id='fp-v4-style';st.textContent=`
    .fp-v4-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.fp-v4-box{background:var(--card-inner);border:1px solid var(--border);border-radius:12px;padding:12px}.fp-v4-box b{font-size:1.25rem}.fp-v4-box span{display:block;font-size:.66rem;color:var(--text-muted);margin-top:3px}.fp-v4-list{display:flex;flex-direction:column;gap:8px}.fp-v4-row{display:flex;justify-content:space-between;gap:10px;padding:10px 12px;background:var(--input-bg);border:1px solid var(--border);border-radius:10px;font-size:.76rem}.fp-v4-badge{display:inline-block;padding:4px 8px;border-radius:999px;border:1px solid var(--border);font-size:.65rem;font-weight:800}.fp-v4-green{color:var(--primary)}.fp-v4-yellow{color:var(--warning)}.fp-v4-red{color:var(--danger)}
  `;document.head.appendChild(st)}

  function startOfWeek(d=new Date()){const x=new Date(d);const day=(x.getDay()+6)%7;x.setHours(0,0,0,0);x.setDate(x.getDate()-day);return x}
  function daysAgo(n){const d=new Date();d.setDate(d.getDate()-n);return d.toISOString()}

  async function getWeekSets(){
    if(!window.currentUser||!window.supabaseClient)return [];
    const {data,error}=await window.supabaseClient.from('workout_sets').select('exercise_id,weight_kg,reps,rir,created_at,completed').eq('completed',true).gte('created_at',daysAgo(7)).order('created_at',{ascending:false});
    if(error){console.warn(error.message);return []} return data||[];
  }
  async function getRecentWorkouts(){
    if(!window.currentUser)return [];
    const {data,error}=await window.supabaseClient.from('workouts').select('id,cycle_day,name,started_at,completed_at,total_volume_kg,duration_seconds').eq('user_id',window.currentUser.id).eq('completed_at',null,{not:true}).order('started_at',{ascending:false}).limit(14);
    if(error)return [];
    return data||[];
  }

  function volumeByMuscle(sets){const out={};for(const s of sets){const m=muscles[s.exercise_id]||'other';out[m]=(out[m]||0)+Number(s.weight_kg||0)*Number(s.reps||0)}return out}
  function avgRir(sets){const a=sets.filter(x=>x.rir!=null).map(x=>Number(x.rir));return a.length?a.reduce((x,y)=>x+y,0)/a.length:null}
  function trendScore(sets){
    if(sets.length<4)return 0;
    const sorted=[...sets].sort((a,b)=>new Date(a.created_at)-new Date(b.created_at));
    const half=Math.floor(sorted.length/2),a=sorted.slice(0,half),b=sorted.slice(half);
    const va=a.reduce((x,s)=>x+Number(s.weight_kg||0)*Number(s.reps||0),0),vb=b.reduce((x,s)=>x+Number(s.weight_kg||0)*Number(s.reps||0),0);
    return va?Math.round(((vb-va)/va)*100):0;
  }
  function readiness(){
    const card=$('fp-recovery-card');
    const scoreText=card?.querySelector('.fp-score')?.textContent||''; const m=scoreText.match(/\d+/);return m?Number(m[0]):null;
  }
  function coachDecision({score,sets,volume}){
    const rir=avgRir(sets), trend=trendScore(sets), total=Object.values(volume).reduce((a,b)=>a+b,0);
    let mode='progress', title='🟢 Normal ilerleme', bullets=[];
    if(score!=null&&score<=5){mode='recovery';title='🔴 Recovery öncelikli';bullets=['Ana hareketlerde hedef ağırlığı yaklaşık %5 azalt.','Setleri failure’a götürme; RIR 3 civarında kal.','İzolasyon hareketlerinden 1 set azaltmayı düşün.']}
    else if(score!=null&&score<=7){mode='moderate';title='🟡 Kontrollü ilerleme';bullets=['Planlanan ağırlığı koru veya küçük artış yap.','Çoğu sette RIR 2–3 hedefle.','Teknik bozuluyorsa yük artırma.']}
    else {bullets=['Üst tekrar sınırına ulaşan hareketlerde küçük yük artışı dene.','RIR 1–2 aralığını koru.','Performans yükseliyorsa mevcut hacmi koru.']}
    if(rir!=null&&rir<1.2&&mode==='progress'){bullets.push('Son seanslarda RIR çok düşük: toparlanmayı korumak için ekstra failure setlerinden kaçın.');}
    if(trend<-10){title='🟠 Performans düşüşü';bullets=['Son kayıtlarında hacim düşmüş. Bugün ağırlığı zorlamadan kaliteyi koru.','Uyku ve beslenme hedeflerini kontrol et.'];mode='fatigue'}
    return {mode,title,bullets,trend,rir,total}
  }
  function deloadNeeded({sets,score}){
    const trend=trendScore(sets),rir=avgRir(sets);
    return sets.length>=12 && ((trend<=-12 && (score==null||score<=7)) || (rir!=null&&rir<1&&score!=null&&score<=6));
  }

  async function renderCoachEngine(){
    const tab=$('tab-workout');if(!tab||!window.currentUser)return;addStyles();
    let card=$('fp-v4-coach');if(!card){card=document.createElement('div');card.id='fp-v4-coach';card.className='card';tab.insertBefore(card,tab.firstChild)}
    card.innerHTML='<h2>🧠 FitPro Coach Engine</h2><p style="font-size:.75rem;color:var(--text-muted)">Performans, recovery ve haftalık hacim analiz ediliyor...</p>';
    const sets=await getWeekSets(),volume=volumeByMuscle(sets),score=readiness(),decision=coachDecision({score,sets,volume});
    const deload=deloadNeeded({sets,score}); state.weekly={sets,volume,decision,score,deload};
    card.innerHTML=`<h2>🧠 FitPro Coach Engine</h2><div class="fp-v4-box"><span>BUGÜNKÜ KARAR</span><b class="${decision.mode==='recovery'||decision.mode==='fatigue'?'fp-v4-red':decision.mode==='moderate'?'fp-v4-yellow':'fp-v4-green'}">${decision.title}</b></div><div style="margin-top:10px" class="fp-v4-list">${decision.bullets.map(x=>`<div class="fp-v4-row">💡 <span>${esc(x)}</span></div>`).join('')}</div><div class="fp-v4-grid" style="margin-top:10px"><div class="fp-v4-box"><b>${sets.length}</b><span>7 GÜN SET</span></div><div class="fp-v4-box"><b>${Math.round(decision.total)} kg</b><span>HAFTALIK HACİM</span></div><div class="fp-v4-box"><b>${decision.trend>0?'+':''}${decision.trend}%</b><span>HACİM TRENDİ</span></div><div class="fp-v4-box"><b>${decision.rir==null?'—':decision.rir.toFixed(1)}</b><span>ORT. RIR</span></div></div>${deload?'<div style="margin-top:10px;padding:12px;border:1px solid var(--warning);border-radius:12px;color:var(--warning);font-size:.75rem;font-weight:800">⚠️ DELOAD SİNYALİ: Son performans + recovery verilerine göre 1 hafif hafta planlamak mantıklı.</div>':''}`;
    renderWeeklyMuscles(volume);
  }
  function renderWeeklyMuscles(volume){
    const tab=$('tab-progress');if(!tab)return;let card=$('fp-v4-muscles');if(!card){card=document.createElement('div');card.id='fp-v4-muscles';card.className='card';tab.appendChild(card)}
    const entries=Object.entries(volume).sort((a,b)=>b[1]-a[1]);
    card.innerHTML=`<h2>💪 Son 7 Gün Kas Hacmi</h2>${entries.length?`<div class="fp-v4-list">${entries.map(([m,v])=>`<div class="fp-v4-row"><span>${labels[m]||m}</span><b>${Math.round(v)} kg</b></div>`).join('')}</div>`:'<p style="font-size:.75rem;color:var(--text-muted)">Henüz yeterli antrenman verisi yok.</p>'}`;
  }

  function nextTargetWithRecovery(base,target,score){let kg=Number(target||base||0);if(score!=null&&score<=5)kg*=.95;else if(score!=null&&score>=9)kg*=1.025;return Math.max(0,Math.round(kg*2)/2)}
  const originalRender=window.renderWorkoutList;
  if(originalRender){window.renderWorkoutList=async function(){await originalRender();const score=readiness();document.querySelectorAll('.fp-set').forEach(r=>{const input=r.querySelector('.fp-kg');if(input&&score!=null)input.value=nextTargetWithRecovery(input.value,input.value,score)});};}

  const oldFinish=window.finishWorkout;
  if(oldFinish){window.finishWorkout=async function(){await oldFinish();setTimeout(renderCoachEngine,600);};}

  document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{renderCoachEngine();},1200));
  window.fitproCoach={refresh:renderCoachEngine,getState:()=>state};
})();
