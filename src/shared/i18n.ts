import type { Language } from '@/features/household/api'

export type { Language }

/**
 * All UI copy lives here — one flat dictionary, no framework dependency.
 * Auth/household-setup screens run before a household (and so a language)
 * exists, and stay English-only; everything past that point reads from here.
 */
const dict = {
  en: {
    signOut: 'Sign out',
    tabShopping: 'Shopping list',
    tabPantry: 'Pantry',
    tabMeals: 'Meals',
    invitePartner: 'Invite your partner',
    inviteShareHint: 'Share this code (valid 7 days)',
    addItemPlaceholder: 'Add an item…',
    amountPlaceholder: 'Amount',
    add: 'Add',
    loading: 'Loading…',
    nothingOnList: 'Nothing on the list yet.',
    checkedOff: 'Checked off',
    pantryEmpty: 'The pantry is empty. Buy something and check it off.',
    used: 'Used',
    suggestAMeal: 'Suggest a meal',
    thinking: 'Thinking…',
    suggestError: "Couldn't get suggestions right now. Try again in a moment.",
    fallbackNotice: "Couldn't reach the AI — here are a few staples instead.",
    cachedNotice: "Same as last time — your pantry hasn't changed.",
    getNewIdeas: 'Get new ideas',
    uses: 'Uses:',
    alsoNeed: "You'll also need:",
    cookedThis: 'Cooked this',
    language: 'Language',
    tabSettings: 'Settings',
    preferencesLabel: 'Household preferences',
    preferencesPlaceholder: 'Allergies, dislikes, kosher/vegetarian, "no oven"…',
    save: 'Save',
    expiryPlaceholder: '+ expiry',
    expiresOn: 'Expires',
    expiringSoon: 'Expiring soon',
    deleteItem: 'Delete item',
    confirmDeleteItem: 'Remove this item from the list?',
  },
  he: {
    signOut: 'התנתקות',
    tabShopping: 'רשימת קניות',
    tabPantry: 'מזווה',
    tabMeals: 'ארוחות',
    invitePartner: 'הזמנת בן/בת הזוג',
    inviteShareHint: 'שתפו את הקוד הזה (בתוקף ל-7 ימים)',
    addItemPlaceholder: 'הוספת פריט…',
    amountPlaceholder: 'כמות',
    add: 'הוספה',
    loading: 'טוען…',
    nothingOnList: 'הרשימה עדיין ריקה.',
    checkedOff: 'סומן',
    pantryEmpty: 'המזווה ריק. קנו משהו וסמנו אותו.',
    used: 'נגמר',
    suggestAMeal: 'הצעת ארוחה',
    thinking: 'חושב…',
    suggestError: 'לא הצלחנו לקבל הצעות כרגע. נסו שוב בעוד רגע.',
    fallbackNotice: 'לא הצלחנו להגיע ל-AI — הנה כמה רעיונות בסיסיים במקום.',
    cachedNotice: 'זהה לפעם הקודמת — המזווה לא השתנה.',
    getNewIdeas: 'רעיונות חדשים',
    uses: 'משתמש ב:',
    alsoNeed: 'תצטרכו גם:',
    cookedThis: 'בישלתי את זה',
    language: 'שפה',
    tabSettings: 'הגדרות',
    preferencesLabel: 'העדפות משק הבית',
    preferencesPlaceholder: 'אלרגיות, מאכלים שלא אוהבים, כשר/צמחוני, "אין תנור"…',
    save: 'שמירה',
    expiryPlaceholder: '+ תפוגה',
    expiresOn: 'בתוקף עד',
    expiringSoon: 'עומד לפוג בקרוב',
    deleteItem: 'מחיקת פריט',
    confirmDeleteItem: 'להסיר את הפריט הזה מהרשימה?',
  },
} as const satisfies Record<Language, Record<string, string>>

export type TKey = keyof (typeof dict)['en']

export function t(lang: Language, key: TKey): string {
  return dict[lang][key]
}
