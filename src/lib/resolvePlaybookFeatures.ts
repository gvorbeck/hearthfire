import type { CharacterData, PlaybookFeatures } from '@/types';

// playbookFeatures wins — written on every save, flat fields are the pre-migration fallback.
export const resolvePlaybookFeatures = (data: CharacterData | undefined): PlaybookFeatures => {
  const flat: PlaybookFeatures = {
    sacredPouchIs: data?.sacredPouchIs,
    sacredPouchTrait: data?.sacredPouchTrait,
    earthMotherShrine: data?.earthMotherShrine,
    earthMotherOfferings: data?.earthMotherOfferings,
    foxTallTales: data?.foxTallTales,
    heavyViolence: data?.heavyViolence,
    judgeChronicle: data?.judgeChronicle,
    judgeLawkeeper: data?.judgeLawkeeper,
    lightbearerPraiseTheDay: data?.lightbearerPraiseTheDay,
    marshalWarStories: data?.marshalWarStories,
    marshalWarStoriesAnswers: data?.marshalWarStoriesAnswers,
    rangerSomethingWicked: data?.rangerSomethingWicked,
    rangerSomethingWickedAnswers: data?.rangerSomethingWickedAnswers,
    seekerCollection: data?.seekerCollection,
    seekerCollectionAnswers: data?.seekerCollectionAnswers,
    wouldBeHeroFearAnger: data?.wouldBeHeroFearAnger,
    wouldBeHeroFearAngerAnswers: data?.wouldBeHeroFearAngerAnswers,
    initiateHp: data?.initiateHp,
    initiateLoyalty: data?.initiateLoyalty,
    initiatePicks: data?.initiatePicks,
    initiateRites: data?.initiateRites,
  };
  return { ...flat, ...data?.playbookFeatures };
};

export const featurePatch = (
  data: CharacterData | undefined,
  patch: Partial<PlaybookFeatures>,
): Partial<CharacterData> => ({
  playbookFeatures: { ...resolvePlaybookFeatures(data), ...patch },
});
