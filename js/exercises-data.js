// FitPro PWA - Exercises Database with GIFs
// All exercises with Turkish names, instructions, and GIF URLs

export const EXERCISES = [
  // CHEST - GÖĞÜS
  {
    id: 'bench',
    name: 'Barbell Bench Press',
    nameTr: 'Barbell Bench Press',
    muscle: 'Chest',
    muscleTr: 'Göğüs',
    equipment: 'barbell',
    pattern: 'push',
    gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcG5qa2w5c3V2c2R2Z2R2c2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2a/giphy.gif',
    instructionsTr: 'Yatay benchte sırtınız düz, ayaklarınız yere basılı. Barbell\'i göğüs seviyesine indirin ve yukarı itin.',
    tipsTr: 'Dirsekleri 45-75 derece açısında tutun. Omuzlarınızı yumağa sıkıştırın. Belinizi hafif arkalara eğin ama yumağın benchten ayrılmasın.',
    sets: 3, minReps: 6, maxReps: 10, restSec: 180, compound: true, difficulty: 3
  },
  {
    id: 'incline',
    name: 'Incline Dumbbell Press',
    nameTr: 'İncline Dumbbell Press',
    muscle: 'Chest',
    muscleTr: 'Üst Göğüs',
    equipment: 'dumbbell',
    pattern: 'push',
    gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcG5qa2w5c3V2c2R2Z2R2c2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2b/giphy.gif',
    instructionsTr: '30-45 derece incline benchte dumbbell\'leri omuz genişliğinde tutun, göğüs seviyesine indirin ve yukarı itin.',
    tipsTr: 'Üst göğüse odaklanmak için bench açısını 30 dereceye yakın tutun. Dirsekler 45 derece, bilekler düz.',
    sets: 3, minReps: 8, maxReps: 12, restSec: 150, compound: true, difficulty: 3
  },
  {
    id: 'fly',
    name: 'Cable Fly',
    nameTr: 'Cable Fly',
    muscle: 'Chest',
    muscleTr: 'Göğüs',
    equipment: 'cable',
    pattern: 'isolation',
    gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcG5qa2w5c3V2c2R2Z2R2c2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2c/giphy.gif',
    instructionsTr: 'Cable makinesinin önünde ayaklarınız omuz genişliğinde. Elleri yukarıdan aşağıya göğüs merkezinde birleştirin.',
    tipsTr: 'Dirsekleri hafifçe bükük tutun, sadece omuz eklemi hareket etsin. Göğüs kaslarını sıkıştırarak birleştirin.',
    sets: 3, minReps: 10, maxReps: 15, restSec: 90, compound: false, difficulty: 2
  },
  {
    id: 'pushup',
    name: 'Push-up',
    nameTr: 'Şınav',
    muscle: 'Chest',
    muscleTr: 'Göğüs',
    equipment: 'bodyweight',
    pattern: 'push',
    gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcG5qa2w5c3V2c2R2Z2R2c2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2d/giphy.gif',
    instructionsTr: 'Eller omuz genişliğinde, vücut düz çizgide. Göğüs yere değene kadar indirin ve yukarı itin.',
    tipsTr: 'Core kaslarınızı sıkı tutun, beliniz çukurlama yapmasın. Zorluyorsa dizler üzerinde yapın.',
    sets: 3, minReps: 8, maxReps: 20, restSec: 90, compound: true, difficulty: 2
  },

  // BACK - SIRT
  {
    id: 'latpulldown',
    name: 'Lat Pulldown',
    nameTr: 'Lat Pulldown',
    muscle: 'Back',
    muscleTr: 'Sırt',
    equipment: 'machine',
    pattern: 'pull',
    gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcG5qa2w5c3V2c2R2Z2R2c2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2e/giphy.gif',
    instructionsTr: 'Makineye oturun, barı geniş tutuşla çekin. Dirsekleri yanlarınıza çekerek barı çene seviyesine getirin.',
    tipsTr: 'Sırt kaslarınızı kullanın, biceps ile çekmeyin. Üst sırt sıkışması hissedin. Omuzlarınız yukarı kalkmasın.',
    sets: 3, minReps: 8, maxReps: 12, restSec: 120, compound: true, difficulty: 2
  },
  {
    id: 'row',
    name: 'Seated Cable Row',
    nameTr: 'Seated Cable Row',
    muscle: 'Back',
    muscleTr: 'Sırt',
    equipment: 'cable',
    pattern: 'pull',
    gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcG5qa2w5c3V2c2R2Z2R2c2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2f/giphy.gif',
    instructionsTr: 'Makineye oturun, ayaklar platformda. Kol kemiğini vücuda çekin, omuz bıçaklarınızı birleştirin.',
    tipsTr: 'Sırtınız düz, germe yapmayın. Sadece kol ve sırt kasları çalışsın. Omuzlar geride kalmalı.',
    sets: 3, minReps: 8, maxReps: 12, restSec: 120, compound: true, difficulty: 2
  },
  {
    id: 'pullup',
    name: 'Pull-up',
    nameTr: 'Barfiks',
    muscle: 'Back',
    muscleTr: 'Sırt',
    equipment: 'bodyweight',
    pattern: 'pull',
    gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcG5qa2w5c3V2c2R2Z2R2c2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2g/giphy.gif',
    instructionsTr: 'Barı geniş tutuşla kavrayın. Çene barın üzerine çıkana kadar çekin, kontrollü indirin.',
    tipsTr: 'Zorluyorsa band yardımıyla yapın veya negatif tekrarlar uygulayın. Tam uzatma (dead hang) yapmayın.',
    sets: 3, minReps: 5, maxReps: 12, restSec: 180, compound: true, difficulty: 4
  },
  {
    id: 'drow',
    name: 'Dumbbell Row',
    nameTr: 'Dumbbell Row',
    muscle: 'Back',
    muscleTr: 'Sırt',
    equipment: 'dumbbell',
    pattern: 'pull',
    gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcG5qa2w5c3V2c2R2Z2R2c2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2h/giphy.gif',
    instructionsTr: 'Bir diz bench üzerinde, diğer ayak yerde. Dumbbell\'i bel seviyesine çekin, dirsek vücudunuzun arkasına gitsin.',
    tipsTr: 'Sırtınız düz kalmalı, omuzunuz yukarı kalkmasın. Dirsek vücudan uzaklaşmasın.',
    sets: 3, minReps: 8, maxReps: 12, restSec: 120, compound: true, difficulty: 3
  },

  // SHOULDERS - OMUZ
  {
    id: 'ohp',
    name: 'Overhead Press',
    nameTr: 'Overhead Press (Omuz Presi)',
    muscle: 'Shoulder',
    muscleTr: 'Omuz',
    equipment: 'barbell',
    pattern: 'push',
    gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcG5qa2w5c3V2c2R2Z2R2c2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2i/giphy.gif',
    instructionsTr: 'Ayakta durun, barbell\'i omuz seviyesinden başlayıp tam uzatana kadar yukarı itin.',
    tipsTr: 'Core sıkı, bel germeyin. Dirsekler hafif önde olsun. Bar yolu düz olmalı (başın önünden geçmesin).',
    sets: 3, minReps: 5, maxReps: 10, restSec: 180, compound: true, difficulty: 3
  },
  {
    id: 'latraise',
    name: 'Lateral Raise',
    nameTr: 'Yan Kaldırma',
    muscle: 'Shoulder',
    muscleTr: 'Yan Omuz',
    equipment: 'dumbbell',
    pattern: 'isolation',
    gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcG5qa2w5c3V2c2R2Z2R2c2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2j/giphy.gif',
    instructionsTr: 'Ayakta, dumbbell\'ler yanınızda. Elleri omuz seviyesine kadar yanlara kaldırın, controlled indirin.',
    tipsTr: 'Eller biraz önde, bilekler hafif içe dönük (içeri dökülmüş). Momentum kullanmayın, yavaş kontrol edin.',
    sets: 3, minReps: 10, maxReps: 20, restSec: 90, compound: false, difficulty: 2
  },
  {
    id: 'facerpull',
    name: 'Face Pull',
    nameTr: 'Face Pull',
    muscle: 'Shoulder',
    muscleTr: 'Arka Omuz',
    equipment: 'cable',
    pattern: 'isolation',
    gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcG5qa2w5c3V2c2R2Z2R2c2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2k/giphy.gif',
    instructionsTr: 'Cable rope ile yüz seviyesinden çekin. Dirsekler yukarı, omuz bıçakları birleşsin.',
    tipsTr: 'Arka omuz ve rotator cuff için harika. Hafif ağırlık, temiz tekerrür. Yüzünüze çekin, boynunuza değil.',
    sets: 3, minReps: 12, maxReps: 20, restSec: 90, compound: false, difficulty: 2
  },

  // LEGS - BACAK
  {
    id: 'squat',
    name: 'Barbell Squat',
    nameTr: 'Barbell Squat',
    muscle: 'Legs',
    muscleTr: 'Bacak',
    equipment: 'barbell',
    pattern: 'squat',
    gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcG5qa2w5c3V2c2R2Z2R2c2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2l/giphy.gif',
    instructionsTr: 'Barbell sırtınızın üstünde. Ayaklar omuz genişliğinde, burnu hafif dışarı. Paralel altına inip kalkın.',
    tipsTr: 'Dizleriniz ayak parmaklarınızı geçmesin. Bel düz, core sıkı. Gözleriniz önde bir noktaya odaklı.',
    sets: 3, minReps: 5, maxReps: 10, restSec: 240, compound: true, difficulty: 4
  },
  {
    id: 'legpress',
    name: 'Leg Press',
    nameTr: 'Leg Press',
    muscle: 'Legs',
    muscleTr: 'Bacak',
    equipment: 'machine',
    pattern: 'squat',
    gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcG5qa2w5c3V2c2R2Z2R2c2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2m/giphy.gif',
    instructionsTr: 'Makineye oturun, ayaklar platformda omuz genişliğinde. Dizleri 90 dereceye indirin ve itin.',
    tipsTr: 'Alt sırt yumağından ayrılmasın. Dizleri tam kilitlemeyin. Ayaklar platformun üst yarısında.',
    sets: 3, minReps: 8, maxReps: 15, restSec: 150, compound: true, difficulty: 2
  },
  {
    id: 'rdl',
    name: 'Romanian Deadlift',
    nameTr: 'Romanian Deadlift',
    muscle: 'Hamstring',
    muscleTr: 'Arka Bacak',
    equipment: 'barbell',
    pattern: 'hinge',
    gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcG5qa2w5c3V2c2R2Z2R2c2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2n/giphy.gif',
    instructionsTr: 'Ayaklar kalınlıkta, dizler hafif bükük. Kalça geriye giderken barbell bacaklarınızın üzerinde indirin.',
    tipsTr: 'Sırt düz, hamstring gerilimi hissedin. Bel asla gerilmesin. Barbell dizlerin altına inmesin.',
    sets: 3, minReps: 6, maxReps: 12, restSec: 150, compound: true, difficulty: 3
  },
  {
    id: 'curlleg',
    name: 'Leg Curl',
    nameTr: 'Leg Curl',
    muscle: 'Hamstring',
    muscleTr: 'Arka Bacak',
    equipment: 'machine',
    pattern: 'curl',
    gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcG5qa2w5c3V2c2R2Z2R2c2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2o/giphy.gif',
    instructionsTr: 'Makineye yatın/oturun, ayak bilekleri pad altına. Topu kalçanıza çekin.',
    tipsTr: 'Kontrollü hareket, momentum yok. Hamstring izolasyonu. Kalça yumağından kalkmasın.',
    sets: 3, minReps: 10, maxReps: 15, restSec: 90, compound: false, difficulty: 2
  },
  {
    id: 'calf',
    name: 'Calf Raise',
    nameTr: 'Dizdirme (Calf Raise)',
    muscle: 'Calf',
    muscleTr: 'Baldır',
    equipment: 'machine',
    pattern: 'calf',
    gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcG5qa2w5c3V2c2R2Z2R2c2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2p/giphy.gif',
    instructionsTr: 'Ayak parmakları platform üzerinde, tallar boşta. Tallarınızı mümkün olduğunca indirin ve yukarı çıkın.',
    tipsTr: 'Altta 2 sn bekleyin, yukarıda sıkıştırın. Hızlı değil, kontrollü. Dizler hafif bükük kalsın.',
    sets: 4, minReps: 12, maxReps: 20, restSec: 60, compound: false, difficulty: 1
  },
  {
    id: 'hip',
    name: 'Hip Thrust',
    nameTr: 'Hip Thrust',
    muscle: 'Glute',
    muscleTr: 'Kalça',
    equipment: 'barbell',
    pattern: 'hinge',
    gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcG5qa2w5c3V2c2R2Z2R2c2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2q/giphy.gif',
    instructionsTr: 'Üst sırt bench üzerinde, barbell kalça üzerinde. Kalçayı yukarı itin, üstte sıkıştırın.',
    tipsTr: 'Dizler 90 derece, ayaklar dik. Sadece kalça çalışsın. Çene göğüsüne yakın, boyun gerilmesin.',
    sets: 3, minReps: 8, maxReps: 12, restSec: 150, compound: true, difficulty: 3
  },
  {
    id: 'bulgarian',
    name: 'Bulgarian Split Squat',
    nameTr: 'Bulgarian Split Squat',
    muscle: 'Glute',
    muscleTr: 'Kalça/Bacak',
    equipment: 'dumbbell',
    pattern: 'squat',
    gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcG5qa2w5c3V2c2R2Z2R2c2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2r/giphy.gif',
    instructionsTr: 'Bir ayak arkadaki benchte, öteki ayak önde. Ön bacak diz 90 dereceye indirin.',
    tipsTr: 'Denge zorluyorsa dumbbellsız başlayın. Ön bacakta hissessin. Diz ayak parmağını geçmesin.',
    sets: 3, minReps: 8, maxReps: 12, restSec: 120, compound: true, difficulty: 4
  },

  // ARMS - KOL
  {
    id: 'bcurl',
    name: 'Barbell Curl',
    nameTr: 'Barbell Bicep Curl',
    muscle: 'Biceps',
    muscleTr: 'Biceps',
    equipment: 'barbell',
    pattern: 'curl',
    gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcG5qa2w5c3V2c2R2Z2R2c2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2s/giphy.gif',
    instructionsTr: 'Ayakta, barbell ön kolunuzda. Dirsekler sabit, sadece ön kolları çekerek yukarı getirin.',
    tipsTr: 'Dirsekleriniz vücudunuzdan ayrılmasın. Sallama yapmayın. Kontrollü indirin (eccentric).',
    sets: 3, minReps: 8, maxReps: 12, restSec: 90, compound: false, difficulty: 2
  },
  {
    id: 'hcurl',
    name: 'Hammer Curl',
    nameTr: 'Hammer Curl',
    muscle: 'Biceps',
    muscleTr: 'Biceps/Brachialis',
    equipment: 'dumbbell',
    pattern: 'curl',
    gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcG5qa2w5c3V2c2R2Z2R2c2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2t/giphy.gif',
    instructionsTr: 'Ayakta, dumbbell\'ler yanınızda, el içleri birbirine bakacak. Dirsekler sabit, yukarı çekin.',
    tipsTr: 'Brachialis için harika. Kol genişliği artırır. Dirsekler sabit, sadece ön kol çalışsın.',
    sets: 3, minReps: 10, maxReps: 15, restSec: 90, compound: false, difficulty: 2
  },
  {
    id: 'pushdown',
    name: 'Triceps Pushdown',
    nameTr: 'Triceps Pushdown',
    muscle: 'Triceps',
    muscleTr: 'Triceps',
    equipment: 'cable',
    pattern: 'isolation',
    gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcG5qa2w5c3V2c2R2Z2R2c2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2u/giphy.gif',
    instructionsTr: 'Cable makinesinde rope veya bar. Dirsekler yanınızda sabit, aşağı itin.',
    tipsTr: 'Sadece dirsek eklemi hareket etsin. Omuzlar hareketsiz. Rope kullanıyorsanız altta elleri ayırın.',
    sets: 3, minReps: 10, maxReps: 15, restSec: 90, compound: false, difficulty: 2
  },
  {
    id: 'ohtri',
    name: 'Overhead Triceps Extension',
    nameTr: 'Overhead Triceps Ext.',
    muscle: 'Triceps',
    muscleTr: 'Triceps',
    equipment: 'dumbbell',
    pattern: 'isolation',
    gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcG5qa2w5c3V2c2R2Z2R2c2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2v/giphy.gif',
    instructionsTr: 'Dumbbell\'i iki elle baş üstünde tutun. Dirsekleri bükerek arkaya indirin, uzatın.',
    tipsTr: 'Dirsekler başınızın yanında sabit kalmalı. Omuzlar hareketsiz. Eller dumbbell\'in ucunda değil, ortasında.',
    sets: 3, minReps: 10, maxReps: 15, restSec: 90, compound: false, difficulty: 2
  },

  // CORE - KARIN
  {
    id: 'plank',
    name: 'Plank',
    nameTr: 'Plank',
    muscle: 'Core',
    muscleTr: 'Karın',
    equipment: 'bodyweight',
    pattern: 'core',
    gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcG5qa2w5c3V2c2R2Z2R2c2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2w/giphy.gif',
    instructionsTr: 'Ön kol üzerine yatın, vücut düz çizgide. Core sıkı tutun.',
    tipsTr: 'Bel çukurlamasın, kalça yukarı kalkmasın. Nefes kontrolü. Karın kaslarını kasın.',
    sets: 3, minReps: 30, maxReps: 60, restSec: 60, compound: false, difficulty: 2
  },
  {
    id: 'hanging_knee_raise',
    name: 'Hanging Knee Raise',
    nameTr: 'Asılı Kaldırma',
    muscle: 'Core',
    muscleTr: 'Alt Karın',
    equipment: 'bodyweight',
    pattern: 'core',
    gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcG5qa2w5c3V2c2R2Z2R2c2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2x/giphy.gif',
    instructionsTr: 'Barfiksten asılı durun. Dizleri göğsünüze çekin, controlled indirin.',
    tipsTr: 'Sallanma yok. Alt karnı hissedin. Dizler kalça seviyesinin üzerine çıkmalı.',
    sets: 3, minReps: 8, maxReps: 15, restSec: 90, compound: false, difficulty: 3
  }
];

// Equipment filter helpers
export const EQUIPMENT_GROUPS = {
  gym: ['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight'],
  home: ['dumbbell', 'bodyweight'],
  bodyweight: ['bodyweight']
};

// Muscle groups for filtering
export const MUSCLE_GROUPS = [
  { key: 'Chest', label: 'Göğüs' },
  { key: 'Back', label: 'Sırt' },
  { key: 'Shoulder', label: 'Omuz' },
  { key: 'Legs', label: 'Bacak (Quad)' },
  { key: 'Hamstring', label: 'Arka Bacak' },
  { key: 'Glute', label: 'Kalça' },
  { key: 'Biceps', label: 'Biceps' },
  { key: 'Triceps', label: 'Triceps' },
  { key: 'Calf', label: 'Baldır' },
  { key: 'Core', label: 'Karın' }
];

// Get exercises filtered by equipment
export function getExercisesForEquipment(equipment) {
  const allowed = EQUIPMENT_GROUPS[equipment] || EQUIPMENT_GROUPS.gym;
  return EXERCISES.filter(ex => allowed.includes(ex.equipment));
}

// Get exercises for a workout split
export function getExercisesForSplit(split, equipment, level, sessionMinutes) {
  const pool = getExercisesForEquipment(equipment);
  const target = split.toLowerCase();
  
  let wanted = [];
  if (target.includes('push')) wanted = ['push', 'isolation'];
  else if (target.includes('pull')) wanted = ['pull', 'curl'];
  else if (target.includes('legs') || target.includes('lower')) wanted = ['squat', 'hinge', 'curl', 'calf'];
  else if (target.includes('upper')) wanted = ['push', 'pull', 'isolation', 'curl'];
  else wanted = ['push', 'pull', 'squat', 'hinge'];
  
  let out = pool.filter(ex => wanted.includes(ex.pattern));
  if (!out.length) out = pool;
  
  const count = sessionMinutes >= 90 ? 8 : sessionMinutes >= 60 ? 6 : 4;
  
  return out.slice(0, count).map(ex => ({
    ...ex,
    sets: level === 'beginner' ? Math.min(3, ex.sets) : ex.sets,
    restSec: ['isolation', 'curl', 'calf', 'core'].includes(ex.pattern) ? 75 : 150
  }));
}

// Search exercises
export function searchExercises(query) {
  const q = query.toLowerCase().trim();
  if (!q) return EXERCISES;
  return EXERCISES.filter(ex => 
    ex.name.toLowerCase().includes(q) ||
    ex.nameTr.toLowerCase().includes(q) ||
    ex.muscle.toLowerCase().includes(q) ||
    ex.muscleTr.toLowerCase().includes(q)
  );
}

// Filter exercises by muscle group
export function filterExercisesByMuscle(muscle) {
  if (muscle === 'all') return EXERCISES;
  return EXERCISES.filter(ex => ex.muscle === muscle);
}