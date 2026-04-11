export type Lang = 'fr' | 'en' | 'ar';

export const t: Record<Lang, {
  // Header
  tagline: string;
  countryPlaceholder: string;
  // Tabs
  calendar: string;
  planner: string;
  // Explainer cards
  card1Title: string;
  card1Desc: string;
  card2Title: string;
  card2Desc: string;
  card3Title: string;
  card3Desc: string;
  // Calendar
  nextHoliday: string;
  days: string;
  selectedHoliday: string;
  // CongeForm
  formTitle: string;
  formDesc: string;
  daysLabel: string;
  monthLabel: string;
  monthOptional: string;
  monthAuto: string;
  sixDayTitle: string;
  sixDayHint: string;
  submitBtn: string;
  calculating: string;
  // CongeResult
  bestPeriods: string;
  noPeriods: string;
  daysUsed: string;
  totalRest: string;
  holiday: string;
  holidays: string;
  included: string;
  // Months
  months: string[];
}> = {
  fr: {
    tagline: 'Planificateur de congés',
    countryPlaceholder: 'Pays...',
    calendar: 'Calendrier',
    planner: 'Planifier',
    card1Title: 'Jours fériés officiels',
    card1Desc: 'Tous les jours fériés officiels sont marqués pour vous aider à planifier au mieux.',
    card2Title: 'Posez moins, profitez plus',
    card2Desc: 'Notre algorithme trouve les ponts idéaux pour maximiser vos vacances.',
    card3Title: 'Personnalisé pour vous',
    card3Desc: 'Indiquez combien de jours vous avez et obtenez un plan sur mesure.',
    nextHoliday: 'Prochain\njour férié',
    days: 'jours',
    selectedHoliday: 'Jour férié sélectionné',
    formTitle: 'Optimiser mes congés',
    formDesc: "Entrez vos jours disponibles et l'algorithme trouve les meilleures périodes.",
    daysLabel: 'Jours de congé disponibles',
    monthLabel: 'Mois souhaité',
    monthOptional: 'optionnel',
    monthAuto: 'Meilleur mois automatique',
    sixDayTitle: 'Semaine de 6 jours',
    sixDayHint: 'Samedi compté comme jour ouvrable (congé vendredi = samedi aussi déduit)',
    submitBtn: 'Trouver les meilleures périodes ✦',
    calculating: 'Calcul...',
    bestPeriods: 'Meilleures périodes',
    noPeriods: 'Aucune période trouvée pour ce mois.',
    daysUsed: 'j posés',
    totalRest: 'j de repos total',
    holiday: 'férié inclus',
    holidays: 'fériés inclus',
    included: '',
    months: ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
  },
  en: {
    tagline: 'Leave Planner',
    countryPlaceholder: 'Country...',
    calendar: 'Calendar',
    planner: 'Plan',
    card1Title: 'Official Public Holidays',
    card1Desc: 'All official public holidays are marked to help you plan ahead.',
    card2Title: 'Take less, enjoy more',
    card2Desc: 'Our algorithm finds the best bridge days to maximize your time off.',
    card3Title: 'Personalized for you',
    card3Desc: 'Enter your available days and get a tailored plan.',
    nextHoliday: 'Next\nholiday',
    days: 'days',
    selectedHoliday: 'Selected holiday',
    formTitle: 'Optimize my leave',
    formDesc: 'Enter your available days and the algorithm finds the best periods.',
    daysLabel: 'Available leave days',
    monthLabel: 'Preferred month',
    monthOptional: 'optional',
    monthAuto: 'Best month automatically',
    sixDayTitle: '6-day work week',
    sixDayHint: 'Saturday counts as a workday (Friday off = Saturday also deducted)',
    submitBtn: 'Find the best periods ✦',
    calculating: 'Calculating...',
    bestPeriods: 'Best periods',
    noPeriods: 'No periods found for this month.',
    daysUsed: 'd taken',
    totalRest: 'd total off',
    holiday: 'holiday included',
    holidays: 'holidays included',
    included: '',
    months: ['January','February','March','April','May','June','July','August','September','October','November','December'],
  },
  ar: {
    tagline: 'مخطط الإجازات',
    countryPlaceholder: 'البلد...',
    calendar: 'التقويم',
    planner: 'تخطيط',
    card1Title: 'الأعياد الرسمية',
    card1Desc: 'جميع الأعياد الرسمية مُحددة لمساعدتك على التخطيط بشكل أفضل.',
    card2Title: 'خذ أقل، استمتع أكثر',
    card2Desc: 'يجد خوارزميتنا أفضل الجسور لتعظيم عطلتك.',
    card3Title: 'مخصص لك',
    card3Desc: 'أدخل عدد أيامك واحصل على خطة مخصصة.',
    nextHoliday: 'العطلة\nالقادمة',
    days: 'أيام',
    selectedHoliday: 'العطلة المختارة',
    formTitle: 'تحسين إجازتي',
    formDesc: 'أدخل أيامك المتاحة وسيجد الخوارزم أفضل الفترات.',
    daysLabel: 'أيام الإجازة المتاحة',
    monthLabel: 'الشهر المفضل',
    monthOptional: 'اختياري',
    monthAuto: 'أفضل شهر تلقائياً',
    sixDayTitle: 'أسبوع عمل 6 أيام',
    sixDayHint: 'السبت يُحسب يوم عمل (إجازة الجمعة = خصم السبت أيضاً)',
    submitBtn: 'إيجاد أفضل الفترات ✦',
    calculating: 'جارٍ الحساب...',
    bestPeriods: 'أفضل الفترات',
    noPeriods: 'لا توجد فترات لهذا الشهر.',
    daysUsed: 'ي مأخوذة',
    totalRest: 'ي إجمالي راحة',
    holiday: 'عطلة مشمولة',
    holidays: 'عطل مشمولة',
    included: '',
    months: ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'],
  },
};