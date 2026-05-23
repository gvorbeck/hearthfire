export const INSERT_INSTINCT_OPTIONS = [
  { value: 'denial', label: 'DENIAL', description: 'To refuse to accept that you are dead.' },
  { value: 'obsession', label: 'OBSESSION', description: 'To pursue your Terrible Purpose no matter what.' },
  { value: 'ennui', label: 'ENNUI', description: 'To bemoan your condition, to wish for release.' },
] as const;

export const INSERT_PURPOSE_OPTIONS = [
  {
    value: 'longing',
    label: 'LONGING',
    namePrompt: 'Name the person or persons you refuse to let go of.',
    namePlaceholder: 'Name the person or persons…',
    triggers: [
      'When you *spend the night watching them*, regain all your HP or clear all your debilities.',
      'When they *genuinely return your affections*, free of fear or horror, either regain all your HP and clear your debilities, or clear a consequence.',
      'When they *rebuff you or recoil from you*, mark a consequence.',
      'When they *die peacefully and pass through the Last Door*, so do you.',
      'Should they be *taken from you violently*, mark the Final Consequence.',
    ],
  },
  {
    value: 'vengeance',
    label: 'VENGEANCE',
    namePrompt: 'Name the person or persons who must pay.',
    namePlaceholder: 'Name the person or persons…',
    triggers: [
      'When you *spend the night wailing, howling, and raging in a lonely place*, regain all your HP or clear all your debilities.',
      'When you *make one of them pay and ensure that they know why*, either regain all your HP and clear your debilities, or clear a consequence.',
      'When they *defeat or escape you*, mark a consequence.',
      'When you *kill the last of them*, pass through the Last Door.',
      "Should they *die before you're finished with them*, mark the Final Consequence.",
    ],
  },
  {
    value: 'duty',
    label: 'DUTY',
    namePrompt: 'Name the task you refuse to leave undone.',
    namePlaceholder: 'Name the task…',
    triggers: [
      'When you *spend the night working on your task*, regain all your HP or clear all your debilities.',
      'When you *achieve a significant milestone towards your task*, either regain all your HP and clear your debilities, or clear a consequence.',
      'When you *fail to perform your task or suffer a material setback*, mark a consequence.',
      'When the *task is finally complete*, pass through the Last Door.',
      'Should the *task become impossible to perform*, mark the Final Consequence.',
    ],
  },
] as const;
