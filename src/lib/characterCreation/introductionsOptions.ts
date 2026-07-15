import type { IntroductionsConfig, PlaybookType } from '@/types';

const BLESSED: IntroductionsConfig = {
  step3: "On your third turn, **describe your sacred pouch** and its remarkable trait. Then, **tell us about Danu's shrine** in Stonetop and how she is worshipped.",
  step4Questions: [
    { id: 'q4-kin', text: 'Who is your closest kin?' },
    { id: 'q4-heart', text: 'Whose heart & soul is entwined with yours?' },
    { id: 'q4-taught', text: 'Who taught you the secret ways?' },
    { id: 'q4-beloved', text: 'Who is beloved by the goddess, your charge to nurture/guide/protect/heal?' },
  ],
  step6Questions: [
    { id: 'q6-whisper', text: 'Which one of you do the spirits whisper of?' },
    { id: 'q6-rite', text: 'Which one of you has joined me in a sacred rite?' },
    { id: 'q6-oath', text: 'Which of you has made a blood-oath with me?' },
    { id: 'q6-doubt', text: 'Which one of you doubts the power of Danu?' },
  ],
};

const FOX: IntroductionsConfig = {
  step3: "On your third turn, **tell us your tall tales**. Feel free to embellish and exaggerate to the other players, but always answer the GM truthfully.",
  step4Questions: [
    { id: 'q4-kin', text: 'Who is your closest kin?' },
    { id: 'q4-heart', text: 'Who holds the reins to your heart?' },
    { id: 'q4-respect', text: 'Whose respect means the world to you?' },
    { id: 'q4-debt', text: 'To whom do you owe a debt that cannot be repaid?' },
  ],
  step6Questions: [
    { id: 'q6-hijinx', text: 'Which one of you joined me in my latest hijinx?' },
    { id: 'q6-problems', text: 'Which one of you brings your problems to me?' },
    { id: 'q6-bacon', text: "Which one of you saved my bacon, mor'n once?" },
    { id: 'q6-trust', text: 'Which one of you trusts me not one bit?' },
  ],
};

const HEAVY: IntroductionsConfig = {
  step3: "On your third turn, **tell us about your history of violence**, and what keeps you up at night.",
  step4Questions: [
    { id: 'q4-kin', text: 'Who is your closest kin?' },
    { id: 'q4-lover', text: 'Who is your lover/spouse/betrothed?' },
    { id: 'q4-protect', text: 'Who most needs/deserves your protection?' },
    { id: 'q4-forgive', text: 'Whose forgiveness do you strive to earn?' },
  ],
  step6Questions: [
    { id: 'q6-dragged', text: 'Which one of you once dragged me home, bleeding and unconscious?' },
    { id: 'q6-back', text: 'Which one of you can I trust to always have my back?' },
    { id: 'q6-hand', text: 'Which one of you has stayed my hand?' },
    { id: 'q6-blows', text: 'Which one of you has traded blows with me?' },
  ],
};

const JUDGE: IntroductionsConfig = {
  step3: "On your third turn, **describe the Chronicle**. Then, **tell us about Aratis and her shrine**, and what she demands of her true disciples.",
  step4Questions: [
    { id: 'q4-kin', text: 'Who is your closest kin?' },
    { id: 'q4-lover', text: 'Who is your lover/spouse/betrothed?' },
    { id: 'q4-apprentice', text: 'Who is your apprentice?' },
    { id: 'q4-wisest', text: 'Who is the wisest of the town elders?' },
  ],
  step6Questions: [
    { id: 'q6-disciple', text: 'Which one of you is a true disciple of Aratis?' },
    { id: 'q6-confidant', text: 'Which one of you is my closest confidant?' },
    { id: 'q6-chaos', text: 'Which one of you has stood beside me in battle against unnatural chaos?' },
    { id: 'q6-judgement', text: 'Against which of you have I passed judgement?' },
  ],
};

const LIGHTBEARER: IntroductionsConfig = {
  step3: "On your third turn, **praise the day! Tell us of Helior**, his worship and his shrine. Tell us, too, of the prior Lightbearer and how you gained your powers.",
  step4Questions: [
    { id: 'q4-kin', text: 'Who is your closest kin?' },
    { id: 'q4-heart', text: 'Who fans the flames of your heart?' },
    { id: 'q4-kindness', text: 'Whose kindness and generosity warm your soul?' },
    { id: 'q4-light', text: "Who needs Helior's light, badly?" },
  ],
  step6Questions: [
    { id: 'q6-friend', text: 'Which one of you is an old and dear friend?' },
    { id: 'q6-faith', text: 'Which one of you shares my faith?' },
    { id: 'q6-scoffs', text: 'Which one of you scoffs at mercy and hope?' },
    { id: 'q6-guidance', text: 'Which one of you will need my guidance soon?' },
  ],
};

const MARSHAL: IntroductionsConfig = {
  step3: "On your third turn, **tell us the town's war stories**, plus the answers to the questions you chose.",
  step4Questions: [
    { id: 'q4-kin', text: 'Who is your closest kin?' },
    { id: 'q4-lover', text: 'Who is your lover/spouse/betrothed?' },
    { id: 'q4-lieutenant', text: 'Who is your lieutenant?' },
    { id: 'q4-dead', text: 'Whose kin is dead because of your decisions?' },
  ],
  step6Questions: [
    { id: 'q6-crew', text: 'Which one of you is or was part of my crew?' },
    { id: 'q6-safe', text: 'Which one of you have I promised to keep safe?' },
    { id: 'q6-doubts', text: 'Which one of you do I still have doubts about?' },
    { id: 'q6-orders', text: 'Which one of you ignored my orders and got someone killed?' },
  ],
};

const RANGER: IntroductionsConfig = {
  step3: "On your third turn, **tell us what you're worried about** (see \"Something wicked this way comes\").",
  step4Questions: [
    { id: 'q4-kin', text: 'Who is your closest kin?' },
    { id: 'q4-return', text: 'To whom do you always return home?' },
    { id: 'q4-lost', text: 'Who would be lost without you?' },
    { id: 'q4-learn', text: 'Who has much to learn from you?' },
  ],
  step6Questions: [
    { id: 'q6-fears', text: 'Which one of you fears the wider world?' },
    { id: 'q6-beauty', text: 'Which one of you has shown me great beauty?' },
    { id: 'q6-horizon', text: 'Which one of you have I caught sometimes staring out at the horizon?' },
    { id: 'q6-misery', text: 'Which one of you lacked the stomach to put something out of its misery?' },
  ],
};

const SEEKER: IntroductionsConfig = {
  step3: "On your third turn, **describe your major arcana**. Tell us your answers to the questions you chose. Then, **tell us about your minor arcana**, too.",
  step4Questions: [
    { id: 'q4-kin', text: 'Who is your closest kin?' },
    { id: 'q4-spouse', text: 'Who is your spouse/lover/betrothed?' },
    { id: 'q4-trust', text: 'Whom do you trust, even more than yourself?' },
    { id: 'q4-watch', text: 'Whom do you secretly watch over, and why?' },
  ],
  step6Questions: [
    { id: 'q6-discovery', text: 'Which one of you led me to a key discovery?' },
    { id: 'q6-side', text: 'Which one of you has been at my side the entire way?' },
    { id: 'q6-fears', text: 'Which one of you most fears the path I tread?' },
    { id: 'q6-secrets', text: 'Which one of you is keeping secrets from me?' },
  ],
};

const WOULD_BE_HERO: IntroductionsConfig = {
  step3: "On your third turn, **tell us of your fear & anger**, and of the last time they caused you trouble.",
  step4Questions: [
    { id: 'q4-heart', text: 'Whose heart do you hope to win?' },
    { id: 'q4-counting', text: 'Who is counting on you?' },
    { id: 'q4-understands', text: 'Who quietly understands the path you are on?' },
    { id: 'q4-wrong', text: 'Who do you intend to prove wrong?' },
  ],
  step6Questions: [
    { id: 'q6-friend', text: 'Which one of you is my closest, truest friend?' },
    { id: 'q6-believes', text: 'Which one of you believes in me, despite it all?' },
    { id: 'q6-teach', text: 'Which one of you has promised to teach me?' },
    { id: 'q6-hurt', text: "Which one of you have I hurt, through what I have done or what I've failed to do?" },
  ],
};

export const INTRODUCTIONS_OPTIONS: Partial<Record<PlaybookType, IntroductionsConfig>> = {
  blessed: BLESSED,
  fox: FOX,
  heavy: HEAVY,
  judge: JUDGE,
  lightbearer: LIGHTBEARER,
  marshal: MARSHAL,
  ranger: RANGER,
  seeker: SEEKER,
  'would-be-hero': WOULD_BE_HERO,
};
