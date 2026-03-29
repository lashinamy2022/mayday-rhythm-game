import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "mayday-rhythm-game-levels";
const LEGACY_STORAGE_KEY = "mayday-rhythm-game-groups";
const ENTRY_SETTLE_MS = 200;
const COUNTDOWN_AUDIO_SRC = "/audio/Countdown .m4a";
const BGM_AUDIO_SRC = "/audio/Bgm5.m4a";
const DEFAULT_BPM = 165;
const LEVEL_INTRO_MS = 1200;

function createCard() {
  return {
    id: crypto.randomUUID(),
    text: "",
    image: "",
    imagePosition: { x: 50, y: 50 },
    shape: "square",
    imageScale: 1,
  };
}

function createGroup(name = "New Group") {
  return {
    id: crypto.randomUUID(),
    name,
    cards: Array.from({ length: 8 }, () => createCard()),
  };
}

function createLevel(name = "Level 1", groupCount = 5) {
  return {
    id: crypto.randomUUID(),
    name,
    visible: true,
    groups: Array.from({ length: groupCount }, (_, index) =>
      createGroup(`Group ${index + 1}`)
    ),
  };
}

const INITIAL_LEVELS = [
  {
    id: "060d3d47-3ba3-48cf-b49b-b7ce9dce12f9",
    name: "Level 1",
    groups: [
      {
        id: "af75fd73-6dd3-415e-bb1b-e95ff2453a15",
        name: "第一组",
        cards: [
          { id: "6e335a29-fbdd-4f7b-ad48-36d4e9441bf1", text: "阿信", image: "/uploads/1774392766816-IMG_2920.jpg", imagePosition: { x: 43.00623575846354, y: 35.060807341377625 }, shape: "square", imageScale: 1 },
          { id: "fc49b80a-387c-4b6a-80fd-5e3a418d4994", text: "阿信", image: "/uploads/1774404415234-IMG_2931.jpg", imagePosition: { x: 47.12554931640625, y: 11.254875879053063 }, shape: "square", imageScale: 1 },
          { id: "a7b90aa6-2ea5-40d2-90c9-32891f6e7333", text: "阿SA", image: "/uploads/1774403983207-652155435_18086959304184975_371901828456.jpg", imagePosition: { x: 65.63683403862848, y: 1.612762518235105 }, shape: "square", imageScale: 1 },
          { id: "4c4399fb-d228-4a7d-bcb6-ba676eb20c20", text: "阿娇", image: "/uploads/1774404103202-6787e2b4eed28_original.jpg", imagePosition: { x: 66.81857638888889, y: 18.004134424083162 }, shape: "square", imageScale: 1 },
          { id: "7674d5b2-f242-49c4-8721-ab065667a1db", text: "阿倫", image: "/uploads/1774404176036-images.webp", imagePosition: { x: 50, y: 50 }, shape: "square", imageScale: 1 },
          { id: "6fd66ac7-c8e7-4e5c-847e-99dd34dab855", text: "阿B", image: "/uploads/1774404208837-images--1-.webp", imagePosition: { x: 0, y: 38.09131200194468 }, shape: "square", imageScale: 1 },
          { id: "81c3466a-1cb4-4d72-8810-8217547dc5de", text: "阿信", image: "/uploads/1774404397782-IMG_2934.jpg", imagePosition: { x: 50, y: 50 }, shape: "square", imageScale: 1 },
          { id: "2f79d30d-48dc-455c-b93d-91abc64ecb1f", text: "阿信", image: "/uploads/1774404405523-IMG_2933.jpg", imagePosition: { x: 66.48713853624132, y: 0 }, shape: "square", imageScale: 1 },
        ],
      },
      {
        id: "05d5cb29-7a05-41c1-b794-54b279cd51af",
        name: "第2组",
        cards: [
          { id: "28643d95-4af3-4a52-b09c-0e39b3146794", text: "金莎", image: "/uploads/1774404699760-IMG_2935.jpg", imagePosition: { x: 69.2649163140191, y: 14.094973464157858 }, shape: "square", imageScale: 1 },
          { id: "3dceca32-b107-4eb4-8c15-026bd00836ce", text: "银莎", image: "/uploads/1774404709517-IMG_2937.jpg", imagePosition: { x: 60.2667236328125, y: 40.263821640341774 }, shape: "square", imageScale: 1 },
          { id: "a027ef77-faf6-413b-b442-d44470a2ee1d", text: "铜莎", image: "/uploads/1774404715740-IMG_2938.jpg", imagePosition: { x: 61.00654602050781, y: 0 }, shape: "square", imageScale: 1 },
          { id: "29ede274-bc85-4415-9624-a0c8fb94cb01", text: "玛莎", image: "/uploads/1774393222016-IMG_2922.jpg", imagePosition: { x: 67.75962829589844, y: 34.06056888894672 }, shape: "square", imageScale: 1 },
          { id: "38d4f25c-5e45-4210-82f7-de360f3ef3c6", text: "猫砂", image: "/uploads/1774404725265-IMG_2939.jpg", imagePosition: { x: 98.02911546495226, y: 0 }, shape: "square", imageScale: 1 },
          { id: "92862b40-b114-4e34-b73b-c3ef2a17eff3", text: "ELSA", image: "/uploads/1774404731301-IMG_2940.jpg", imagePosition: { x: 48.14748975965712, y: 14.79467707931949 }, shape: "square", imageScale: 1 },
          { id: "da344c2a-3c6d-4247-a358-2475c753668a", text: "艾莎", image: "/uploads/1774404737905-IMG_2941.jpg", imagePosition: { x: 75.40443420410156, y: 0 }, shape: "square", imageScale: 1 },
          { id: "a559c989-282f-4560-9d5b-32ce9106e702", text: "玛莎", image: "/uploads/1774393237824-IMG_2922.jpg", imagePosition: { x: 54.92818196614583, y: 30.75019066829867 }, shape: "square", imageScale: 1 },
        ],
      },
      {
        id: "18d7df7f-474c-4f9a-994f-c9fcc70dcb70",
        name: "第3组",
        cards: [
          { id: "4cf744c2-1c61-4e10-b674-76992ce39fac", text: "石头", image: "/uploads/1774393037092-IMG_2923.jpg", imagePosition: { x: 57.443576388888886, y: 38.02936760029813 }, shape: "square", imageScale: 1 },
          { id: "3bd77b6c-dd0b-4b5d-99a1-103829ed99c5", text: "石头", image: "/uploads/1774404963760-IMG_2942.jpg", imagePosition: { x: 62.81367831759983, y: 9.892177902665471 }, shape: "square", imageScale: 1 },
          { id: "8b9ebbdd-6a4c-4b57-ab24-0332a3456ff4", text: "拳头", image: "/uploads/1774404970313-IMG_2944.jpg", imagePosition: { x: 51.9215562608507, y: 100 }, shape: "square", imageScale: 1 },
          { id: "2cc74041-baaa-4cca-af50-fe846f5dc749", text: "拳头", image: "/uploads/1774404979778-IMG_2945.jpg", imagePosition: { x: 35.68300035264757, y: 100 }, shape: "square", imageScale: 1 },
          { id: "2531358a-d552-461e-aa42-5f02937a1707", text: "舌头", image: "/uploads/1774405048422-Screenshot-2026-03-24-at-19-17-19.png", imagePosition: { x: 48.10211181640625, y: 100 }, shape: "square", imageScale: 1 },
          { id: "c22cb490-3b3c-4527-bf12-3397cd7e8ed5", text: "舌头", image: "/uploads/1774405109139-Screenshot-2026-03-24-at-19-18-20.png", imagePosition: { x: 42.94704861111111, y: 100 }, shape: "square", imageScale: 1 },
          { id: "232bc2e5-8c8a-49d1-b9e6-a97f7fbbd1b6", text: "石头", image: "/uploads/1774405127727-IMG_2943.jpg", imagePosition: { x: 44.35368855794271, y: 58.6671248423173 }, shape: "square", imageScale: 1 },
          { id: "d1239904-e784-453f-a9b9-d0b231cc9603", text: "骨头", image: "/uploads/1774666234168-IMG_2985.jpg", imagePosition: { x: 48.2934824625651, y: 100 }, shape: "square", imageScale: 1 },
        ],
      },
      {
        id: "27ccd6b7-7610-43bc-8b92-0bf209fe5cc3",
        name: "第4组",
        cards: [
          { id: "1407a985-a984-4a09-8d7f-f1c9a3e4167f", text: "冠佑", image: "/uploads/1774666241028-IMG_2983.jpg", imagePosition: { x: 56.177003648546005, y: 72.1518808908914 }, shape: "square", imageScale: 1 },
          { id: "9b3ec4cc-6d25-4a7f-ae3a-023da176bee2", text: "冠佑", image: "/uploads/1774666254477-IMG_2984.jpg", imagePosition: { x: 75.28409322102864, y: 59.08695489739794 }, shape: "square", imageScale: 1 },
          { id: "1272ba0e-b457-43e4-a5d6-96a6bea94196", text: "谚明", image: "/uploads/1774666263989-Screenshot-2026-03-27-at-19-48-33.png", imagePosition: { x: 83.35109286838107, y: 0 }, shape: "square", imageScale: 1 },
          { id: "a62fd8b8-5608-4d2b-b33d-b544c9df7da0", text: "谚明", image: "/uploads/1774666270856-Screenshot-2026-03-27-at-19-48-33.png", imagePosition: { x: 73.97805955674913, y: 0 }, shape: "square", imageScale: 1 },
          { id: "d7bcc224-9a80-42ae-90d9-558166ea616a", text: "老刘", image: "/uploads/1774666281834-IMG_2983.jpg", imagePosition: { x: 67.70438300238715, y: 70.46110627930321 }, shape: "square", imageScale: 1 },
          { id: "1d934daa-3b03-407f-834d-26b1b848deff", text: "老刘", image: "/uploads/1774666288038-IMG_2984.jpg", imagePosition: { x: 71.84540642632379, y: 63.00757024858888 }, shape: "square", imageScale: 1 },
          { id: "23a8d443-67d5-4544-a7d7-d13656427bd1", text: "品冠", image: "/uploads/1774666305382-Screenshot-2026-03-27-at-19-48-33.png", imagePosition: { x: 72.03677707248264, y: 0 }, shape: "square", imageScale: 1 },
          { id: "64368a66-3fc4-4e83-8f13-c59ac57eac52", text: "冠佑", image: "/uploads/1774666315536-IMG_2983.jpg", imagePosition: { x: 51.64536370171441, y: 67.6164348236758 }, shape: "square", imageScale: 1 },
        ],
      },
      {
        id: "1b4d16db-241c-48fd-953c-ac74525b40c5",
        name: "第5组",
        cards: [
          { id: "aab8010d-998f-494d-8dcf-f94539c77324", text: "怪兽", image: "/uploads/1774666604406-IMG_2986.jpg", imagePosition: { x: 75.99233839246962, y: 0 }, shape: "square", imageScale: 1 },
          { id: "0936a7fc-841f-4459-b1ab-613889aee94f", text: "野兽", image: "/uploads/1774666624863-IMG_2987.jpg", imagePosition: { x: 79.78416442871094, y: 11.48887272919404 }, shape: "square", imageScale: 1 },
          { id: "534c4184-9182-42e9-bb6f-e603e63b74f3", text: "野兽", image: "/uploads/1774666632507-IMG_2988.jpg", imagePosition: { x: 50, y: 50 }, shape: "square", imageScale: 1 },
          { id: "b6dd1422-5a4f-4cca-ba5a-27f4c2664052", text: "咳嗽", image: "/uploads/1774666638980-IMG_2989.jpg", imagePosition: { x: 76.25670539008247, y: 16.584085631530765 }, shape: "square", imageScale: 1 },
          { id: "cb5eab1f-ce73-450b-b46c-1871f42176e1", text: "Master", image: "/uploads/1774666645621-IMG_2990.jpg", imagePosition: { x: 90.33103942871094, y: 0 }, shape: "square", imageScale: 1 },
          { id: "aa821253-79f3-4ef9-9767-ae8daedefbe7", text: "MASA", image: "/uploads/1774666652194-IMG_2991.jpg", imagePosition: { x: 87.80381096733942, y: 35.790319974772736 }, shape: "square", imageScale: 1 },
          { id: "877d1b12-2125-474b-9f86-0003cb462f81", text: "独角兽", image: "/uploads/1774666657138-IMG_2992.jpg", imagePosition: { x: 50, y: 50 }, shape: "square", imageScale: 1 },
          { id: "d0da11a0-9a44-4b7a-a8e8-dc3f8c641a71", text: "怪兽", image: "/uploads/1774666664239-IMG_2986.jpg", imagePosition: { x: 58.193257649739586, y: 8.194542485293379 }, shape: "square", imageScale: 1 },
        ],
      },
    ],
    visible: true,
  },
  {
    id: "d8d063a6-1983-4824-90f6-b8b6e388ea89",
    name: "Level 2",
    groups: [
      {
        id: "309c9009-f6fe-40da-884a-8eb57b94ca3e",
        name: "第1组",
        cards: [
          { id: "12aa5258-194a-410c-b957-77d51be16fca", text: "", image: "/uploads/1774667783089-IMG_2995.jpg", imagePosition: { x: 50, y: 50 }, shape: "circle", imageScale: 1.1 },
          { id: "1136feda-9551-4763-b378-084008d569d3", text: "", image: "/uploads/1774667799712-IMG_2995.jpg", imagePosition: { x: 50, y: 50 }, shape: "circle", imageScale: 1.1 },
          { id: "ac4155e1-5d11-49e3-bcc4-5e277d5350fa", text: "", image: "/uploads/1774667806411-IMG_2995.jpg", imagePosition: { x: 50, y: 50 }, shape: "circle", imageScale: 1.1 },
          { id: "c53239f3-ebd6-4d81-857e-9f4cb9ce2f8b", text: "", image: "/uploads/1774667811132-IMG_2995.jpg", imagePosition: { x: 50, y: 50 }, shape: "circle", imageScale: 1.1 },
          { id: "68dade03-d171-4fd3-98d1-70c1916bb659", text: "", image: "/uploads/1774667815907-IMG_2996.jpg", imagePosition: { x: 50, y: 50 }, shape: "circle", imageScale: 1.1 },
          { id: "ed2be304-2f51-45d5-97bd-235e2950eb13", text: "", image: "/uploads/1774667819772-IMG_2996.jpg", imagePosition: { x: 50, y: 50 }, shape: "circle", imageScale: 1.1 },
          { id: "1ad8abbc-3fcc-44a4-9db3-505fc54febc0", text: "", image: "/uploads/1774667824036-IMG_2996.jpg", imagePosition: { x: 50, y: 50 }, shape: "circle", imageScale: 1.1 },
          { id: "7ef5eaea-bc91-401e-a4dc-2df71f875461", text: "", image: "/uploads/1774667828844-IMG_2996.jpg", imagePosition: { x: 50, y: 50 }, shape: "circle", imageScale: 1.1 },
        ],
      },
      {
        id: "b8f456f2-1a02-4530-a920-caf49fa3e4a4",
        name: "第2组",
        cards: [
          { id: "49597f1b-e686-42e8-b19a-15cab204e092", text: "", image: "/uploads/1774667835263-IMG_3002.jpg", imagePosition: { x: 50, y: 50 }, shape: "circle", imageScale: 1.1 },
          { id: "74acc71a-22b9-43fe-91aa-56ef05e2f1b1", text: "", image: "/uploads/1774667839613-IMG_3002.jpg", imagePosition: { x: 50, y: 50 }, shape: "circle", imageScale: 1.1 },
          { id: "3e193817-59e0-4e39-92c4-6a01cd257aa4", text: "", image: "/uploads/1774667843724-IMG_3002.jpg", imagePosition: { x: 50, y: 50 }, shape: "circle", imageScale: 1.1 },
          { id: "f4d4b88c-75cb-40bf-b735-6d7b25f8ea47", text: "", image: "/uploads/1774667848510-IMG_3002.jpg", imagePosition: { x: 50, y: 50 }, shape: "circle", imageScale: 1.1 },
          { id: "3d9f7928-0427-42e8-9365-3e64ebdbd895", text: "", image: "/uploads/1774667852841-IMG_3003.jpg", imagePosition: { x: 50, y: 50 }, shape: "circle", imageScale: 1.1 },
          { id: "d98da298-9da3-430f-a46c-2e755b12e3af", text: "", image: "/uploads/1774667856671-IMG_3003.jpg", imagePosition: { x: 50, y: 50 }, shape: "circle", imageScale: 1.1 },
          { id: "cdfbaa60-38d6-4051-bce7-31b6d92b58b2", text: "", image: "/uploads/1774667860886-IMG_3003.jpg", imagePosition: { x: 50, y: 50 }, shape: "circle", imageScale: 1.1 },
          { id: "a3ef1198-264c-44d1-8f1f-ef18061574ff", text: "", image: "/uploads/1774667868109-IMG_3003.jpg", imagePosition: { x: 50, y: 50 }, shape: "circle", imageScale: 1.1 },
        ],
      },
      {
        id: "de0094d0-96fe-4446-964f-0301d481a94a",
        name: "第3组",
        cards: [
          { id: "9d452ed6-2f21-4477-a489-529684444c81", text: "", image: "/uploads/1774667881830-IMG_3004.jpg", imagePosition: { x: 50, y: 50 }, shape: "circle", imageScale: 1.1 },
          { id: "9ca5c701-f322-491d-afd2-c5f77fbd7e9c", text: "", image: "/uploads/1774667885974-IMG_3004.jpg", imagePosition: { x: 50, y: 50 }, shape: "circle", imageScale: 1.1 },
          { id: "ff79973a-73cc-43ac-a4bf-aaad44226165", text: "", image: "/uploads/1774667890655-IMG_3004.jpg", imagePosition: { x: 50, y: 50 }, shape: "circle", imageScale: 1.1 },
          { id: "e69783e2-7c13-471e-9b6d-b3cb0086bada", text: "", image: "/uploads/1774667895206-IMG_3004.jpg", imagePosition: { x: 50, y: 50 }, shape: "circle", imageScale: 1.1 },
          { id: "ce5e6b1c-32e0-4efd-b879-1e1d07047384", text: "", image: "/uploads/1774667904369-IMG_2996.jpg", imagePosition: { x: 50, y: 50 }, shape: "circle", imageScale: 1.1 },
          { id: "289823a2-b749-4d56-82ad-2672f4628a1a", text: "", image: "/uploads/1774667909048-IMG_3002.jpg", imagePosition: { x: 50, y: 50 }, shape: "circle", imageScale: 1.1 },
          { id: "b958eeaa-dc87-4c77-8dac-1279c74da231", text: "", image: "/uploads/1774667913728-IMG_3004.jpg", imagePosition: { x: 50, y: 50 }, shape: "circle", imageScale: 1.1 },
          { id: "fac35cd1-4bcb-439f-a441-2d9f0ad9e40a", text: "", image: "/uploads/1774667918071-IMG_2995.jpg", imagePosition: { x: 50, y: 50 }, shape: "circle", imageScale: 1.1 },
        ],
      },
      {
        id: "d030f237-f48d-420a-8eb2-f85e46925f0e",
        name: "第4组",
        cards: [
          { id: "263e8b1e-fda0-464c-8f13-14e2ff377a7d", text: "", image: "/uploads/1774667923240-IMG_2996.jpg", imagePosition: { x: 50, y: 50 }, shape: "circle", imageScale: 1.1 },
          { id: "c62c7dfe-ad10-40d0-81bc-911c467bd2ba", text: "", image: "/uploads/1774667927393-IMG_3002.jpg", imagePosition: { x: 50, y: 50 }, shape: "circle", imageScale: 1.1 },
          { id: "4a97e256-5bb8-43c1-a1d5-1756ad7317bc", text: "", image: "/uploads/1774667933418-IMG_2995.jpg", imagePosition: { x: 50, y: 50 }, shape: "circle", imageScale: 1.1 },
          { id: "56a30b80-b518-46b5-8d18-9177aaa88f48", text: "", image: "/uploads/1774667938190-IMG_3003.jpg", imagePosition: { x: 50, y: 50 }, shape: "circle", imageScale: 1.1 },
          { id: "e0397250-21a8-47db-ad64-00f0d103e5bd", text: "", image: "/uploads/1774667942210-IMG_3004.jpg", imagePosition: { x: 50, y: 50 }, shape: "circle", imageScale: 1.1 },
          { id: "b5fa05a4-6f9b-4443-a907-a0c2e925e0bc", text: "", image: "/uploads/1774667953811-IMG_2995.jpg", imagePosition: { x: 50, y: 50 }, shape: "circle", imageScale: 1.1 },
          { id: "dab00825-a1fb-4862-89be-f01a8592faa8", text: "", image: "/uploads/1774667958208-IMG_2996.jpg", imagePosition: { x: 50, y: 50 }, shape: "circle", imageScale: 1.1 },
          { id: "c7cd9c6f-cb1a-4328-9b4a-ccaa2aabdedc", text: "", image: "/uploads/1774667962499-IMG_3004.jpg", imagePosition: { x: 50, y: 50 }, shape: "circle", imageScale: 1.1 },
        ],
      },
    ],
    visible: true,
  },
  {
    id: "0e807ff0-3a0e-4c70-b1d5-aa515d2b0353",
    name: "Level 3",
    visible: true,
    groups: [
      {
        id: "2abf2d34-37d0-4d16-a24a-f377a6eb2de3",
        name: "第1组",
        cards: [
          { id: "954b7053-92d9-4fce-b233-c07f1a14a35f", text: "", image: "/uploads/1774674225619-image-L.png", imagePosition: { x: 41.331278483072914, y: 38.8988317999531 }, shape: "square", imageScale: 1.4 },
          { id: "51a187b5-187a-417a-83cf-33e5759c8009", text: "", image: "/uploads/1774674262505-image-O.png", imagePosition: { x: 44.07749599880643, y: 40.15830717897565 }, shape: "square", imageScale: 1.4 },
          { id: "1bda40b6-a0b7-4e62-a9b8-2e595ce4c697", text: "", image: "/uploads/1774674266862-image-V.png", imagePosition: { x: 46.41927083333333, y: 43.041984681279594 }, shape: "square", imageScale: 1.4 },
          { id: "c6ce332e-8905-4d0a-9a0f-62e7bd9a8adb", text: "", image: "/uploads/1774674270682-image-E.png", imagePosition: { x: 37.02256944444444, y: 42.47992844652727 }, shape: "square", imageScale: 1.4 },
          { id: "01bba130-8e11-41b1-a4d6-6b54bbe0610e", text: "", image: "/uploads/1774674274526-image-L.png", imagePosition: { x: 27.46014912923177, y: 44.21656251746622 }, shape: "square", imageScale: 1.4 },
          { id: "b34c9f92-4448-4c0b-9b97-248eedbb7958", text: "", image: "/uploads/1774674278284-image-O.png", imagePosition: { x: 34.270434909396705, y: 40.25464432685786 }, shape: "square", imageScale: 1.4 },
          { id: "2e63fa85-fc87-4a38-898d-e1e7e5799458", text: "", image: "/uploads/1774674282414-image-V.png", imagePosition: { x: 53.23942396375868, y: 42.388162704797764 }, shape: "square", imageScale: 1.4 },
          { id: "a04dae8b-cca7-40af-9be1-fe7b3c14df30", text: "", image: "/uploads/1774674286820-image-E.png", imagePosition: { x: 36.73650105794271, y: 41.39940328733143 }, shape: "square", imageScale: 1.4 },
        ],
      },
      {
        id: "a63e4cfa-ba68-4bea-9204-1a7b01c1103f",
        name: "第2组",
        cards: [
          { id: "6cfb6a60-4447-41d0-913b-2c70515bc761", text: "", image: "/uploads/1774674291454-image-L.png", imagePosition: { x: 43.09895833333333, y: 45.299386933772816 }, shape: "square", imageScale: 1.4 },
          { id: "33092a9d-c6f2-428f-9207-77d4b32ef094", text: "", image: "/uploads/1774674294776-image-L.png", imagePosition: { x: 40.11797587076823, y: 44.746490761915155 }, shape: "square", imageScale: 1.4 },
          { id: "951229b7-5b81-4e4a-a269-759b60da2ce4", text: "", image: "/uploads/1774674298180-image-O.png", imagePosition: { x: 40.86963229709201, y: 42.28951397795532 }, shape: "square", imageScale: 1.4 },
          { id: "000b7519-bd55-430b-9f99-c12a906b1029", text: "", image: "/uploads/1774674301279-image-O.png", imagePosition: { x: 41.28787570529514, y: 40.0298247902008 }, shape: "square", imageScale: 1.4 },
          { id: "125d03ce-6103-49e1-bdfe-469900a53ffd", text: "", image: "/uploads/1774674306056-image-V.png", imagePosition: { x: 48.40198940700955, y: 42.09222638175002 }, shape: "square", imageScale: 1.4 },
          { id: "cdcbbc59-cb9d-430f-b138-28e8971ddd18", text: "", image: "/uploads/1774674310239-image-V.png", imagePosition: { x: 43.75, y: 42.28493024995315 }, shape: "square", imageScale: 1.4 },
          { id: "6f6248ed-6705-4988-b47f-8d263e58bd3a", text: "", image: "/uploads/1774674314110-image-E.png", imagePosition: { x: 46.35219150119357, y: 44.01007789281785 }, shape: "square", imageScale: 1.4 },
          { id: "72c5a641-675f-42df-a84e-b405fbb957d7", text: "", image: "/uploads/1774674317770-image-E.png", imagePosition: { x: 42.7221425374349, y: 45.95549091677616 }, shape: "square", imageScale: 1.4 },
        ],
      },
      {
        id: "58f02d78-7580-41dc-9ce3-1424700b18ad",
        name: "第3组",
        cards: [
          { id: "19892170-548f-4312-a9d8-2f377475f31c", text: "", image: "/uploads/1774674321753-image-L.png", imagePosition: { x: 43.481691148546005, y: 39.01813194650425 }, shape: "square", imageScale: 1.4 },
          { id: "1658583a-35d8-4fe8-89c5-4cce1f59f6b4", text: " ", image: "", imagePosition: { x: 50, y: 50 }, shape: "square", imageScale: 1.4 },
          { id: "6c857714-3d2b-4fe2-8129-9c467043b57f", text: "", image: "/uploads/1774674328366-image-O.png", imagePosition: { x: 51.02785746256511, y: 43.11539333167136 }, shape: "square", imageScale: 1.4 },
          { id: "631d81cb-a3eb-414f-912e-fe281e6ed43d", text: " ", image: "", imagePosition: { x: 50, y: 50 }, shape: "square", imageScale: 1.4 },
          { id: "394bcfc2-eb21-48b9-b5a4-9cef4949dfeb", text: "", image: "/uploads/1774674333148-image-V.png", imagePosition: { x: 44.3872324625651, y: 42.9272731914704 }, shape: "square", imageScale: 1.4 },
          { id: "76e9528e-0984-4a04-8b9d-d9e74736c9af", text: " ", image: "", imagePosition: { x: 50, y: 50 }, shape: "square", imageScale: 1.4 },
          { id: "7352334e-ea82-4d4e-bbb8-ec1e66f41231", text: "", image: "/uploads/1774674337952-image-E.png", imagePosition: { x: 49.133919609917534, y: 45.879785473643516 }, shape: "square", imageScale: 1.4 },
          { id: "c5e865b8-73cb-46a8-ad77-b416561496ae", text: " ", image: "", imagePosition: { x: 50, y: 50 }, shape: "square", imageScale: 1.4 },
        ],
      },
      {
        id: "00d05d6c-9ff3-47f0-a2ca-32df602a39dc",
        name: "第4组",
        cards: [
          { id: "bc73110b-2a32-4a5c-964a-46ea80e7214e", text: "", image: "/uploads/1774674343129-image-L.png", imagePosition: { x: 41.51080661349826, y: 45.82473145021958 }, shape: "square", imageScale: 1.4 },
          { id: "39f46b42-0503-400a-b894-d222447754e3", text: "", image: "/uploads/1774674346538-image-O.png", imagePosition: { x: 51.36127048068576, y: 41.642567593476755 }, shape: "square", imageScale: 1.4 },
          { id: "3b87ff74-17a9-4988-9ebc-ba3907659cd1", text: "", image: "/uploads/1774674349699-image-V.png", imagePosition: { x: 50.00197516547309, y: 44.65473734203512 }, shape: "square", imageScale: 1.4 },
          { id: "841e0c49-ebf6-4421-bbe1-c30c31d086e2", text: "", image: "/uploads/1774674354534-image-E.png", imagePosition: { x: 50.29197692871094, y: 42.13351936368787 }, shape: "square", imageScale: 1.4 },
          { id: "d9a814e7-28d8-48ad-b1eb-18ca4e41876f", text: "", image: "/uploads/1774674358770-image-L.png", imagePosition: { x: 41.52461581759982, y: 39.3461888667457 }, shape: "square", imageScale: 1.4 },
          { id: "9f3605d3-11cf-408c-8693-d306dd4e5d4a", text: "", image: "/uploads/1774674362435-image-O.png", imagePosition: { x: 58.42803107367621, y: 40.37166246688749 }, shape: "square", imageScale: 1.4 },
          { id: "772c8fab-d9e2-4a03-ae07-4e8b3117892d", text: "", image: "/uploads/1774674366199-image-V.png", imagePosition: { x: 51.927473280164925, y: 42.560220082031975 }, shape: "square", imageScale: 1.4 },
          { id: "09012312-1013-4a82-957d-98bcc8a1a143", text: "", image: "/uploads/1774674370319-image-E.png", imagePosition: { x: 44.29055955674913, y: 41.50724411387715 }, shape: "square", imageScale: 1.4 },
        ],
      },
    ],
  },
];

function normalizeCard(card) {
  return {
    ...card,
    image: typeof card.image === "string" ? card.image : "",
    shape: card.shape === "circle" ? "circle" : "square",
    imageScale: Number.isFinite(card.imageScale) ? card.imageScale : 1,
    imagePosition: {
      x: Number.isFinite(card.imagePosition?.x) ? card.imagePosition.x : 50,
      y: Number.isFinite(card.imagePosition?.y) ? card.imagePosition.y : 50,
    },
  };
}

function padCardsToEight(cards) {
  if (cards.length >= 8) return cards;
  return [...cards, ...Array.from({ length: 8 - cards.length }, () => createCard())];
}

function normalizeGroup(group) {
  return {
    ...group,
    name: typeof group.name === "string" ? group.name : "New Group",
    cards: padCardsToEight(Array.isArray(group.cards) ? group.cards : []).map(normalizeCard),
  };
}

function normalizeLevel(level, index) {
  const groups = Array.isArray(level.groups) ? level.groups : [];
  return {
    ...level,
    name: typeof level.name === "string" ? level.name : `Level ${index + 1}`,
    visible: level.visible !== false,
    groups: groups.map(normalizeGroup),
  };
}

function normalizeInitialLevels(data) {
  if (!Array.isArray(data) || data.length === 0) {
    return INITIAL_LEVELS;
  }

  const looksLikeOldGroups = data.every((item) => Array.isArray(item?.cards));
  if (looksLikeOldGroups) {
    return [
      {
        id: crypto.randomUUID(),
        name: "Level 1",
        groups: data.map(normalizeGroup),
      },
    ];
  }

  return data.map(normalizeLevel);
}

function countConfiguredCards(levels) {
  if (!Array.isArray(levels)) return 0;

  return levels.reduce(
    (total, level) =>
      total +
      (Array.isArray(level.groups)
        ? level.groups.reduce(
            (groupTotal, group) =>
              groupTotal +
              (Array.isArray(group.cards)
                ? group.cards.filter((card) => (card.text?.length ?? 0) > 0 || card.image).length
                : 0),
            0
          )
        : 0),
    0
  );
}

function getPlayableCards(group) {
  return group.cards.filter((card) => (card.text?.length ?? 0) > 0 || card.image);
}

function getObjectPosition(card) {
  const x = Math.max(0, Math.min(100, card.imagePosition?.x ?? 50));
  const y = Math.max(0, Math.min(100, card.imagePosition?.y ?? 50));
  return `${x}% ${y}%`;
}

function getImageScale(card) {
  const scale = Number.isFinite(card.imageScale) ? card.imageScale : 1;
  return Math.max(0.8, Math.min(2, scale));
}

function getImagePaths(cards) {
  return cards
    .map((card) => card.image)
    .filter((imagePath) => typeof imagePath === "string" && imagePath.startsWith("/uploads/"));
}

function findFirstPlayablePosition(levels) {
  for (let levelIndex = 0; levelIndex < levels.length; levelIndex += 1) {
    if (levels[levelIndex].visible === false) continue;
    for (let groupIndex = 0; groupIndex < levels[levelIndex].groups.length; groupIndex += 1) {
      if (getPlayableCards(levels[levelIndex].groups[groupIndex]).length > 0) {
        return { levelIndex, groupIndex };
      }
    }
  }
  return null;
}

function findNextPlayablePosition(levels, currentLevelIndex, currentGroupIndex) {
  for (let levelIndex = currentLevelIndex; levelIndex < levels.length; levelIndex += 1) {
    if (levels[levelIndex].visible === false) continue;
    const startGroupIndex = levelIndex === currentLevelIndex ? currentGroupIndex + 1 : 0;
    for (
      let groupIndex = startGroupIndex;
      groupIndex < levels[levelIndex].groups.length;
      groupIndex += 1
    ) {
      if (getPlayableCards(levels[levelIndex].groups[groupIndex]).length > 0) {
        return { levelIndex, groupIndex };
      }
    }
  }
  return null;
}

export default function App() {
  const [page, setPage] = useState("config");
  const [levels, setLevels] = useState(() => {
    try {
      const savedLevels = window.localStorage.getItem(STORAGE_KEY);
      const savedLegacyGroups = window.localStorage.getItem(LEGACY_STORAGE_KEY);

      const parsedLevels = savedLevels ? normalizeInitialLevels(JSON.parse(savedLevels)) : null;
      const parsedLegacyLevels = savedLegacyGroups
        ? normalizeInitialLevels(JSON.parse(savedLegacyGroups))
        : null;

      if (parsedLegacyLevels && !parsedLevels) {
        return parsedLegacyLevels;
      }

      if (parsedLegacyLevels && parsedLevels) {
        const legacyConfiguredCount = countConfiguredCards(parsedLegacyLevels);
        const currentConfiguredCount = countConfiguredCards(parsedLevels);

        if (legacyConfiguredCount > currentConfiguredCount) {
          return parsedLegacyLevels;
        }
      }

      if (parsedLevels) return parsedLevels;
      if (parsedLegacyLevels) return parsedLegacyLevels;
      return INITIAL_LEVELS;
    } catch {
      return INITIAL_LEVELS;
    }
  });
  const [activeLevelIndex, setActiveLevelIndex] = useState(0);
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [revealedCount, setRevealedCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStartedPlayback, setHasStartedPlayback] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const [levelIntroValue, setLevelIntroValue] = useState(null);
  const [countdownValue, setCountdownValue] = useState(null);
  const timerRef = useRef(null);
  const levelRef = useRef(0);
  const groupRef = useRef(0);
  const playheadRef = useRef(-1);
  const playerLayoutRef = useRef(null);
  const revealTimerRef = useRef(null);
  const settleTimerRef = useRef(null);
  const dragStateRef = useRef(null);
  const levelIntroTimerRef = useRef(null);
  const countdownTimerRef = useRef(null);
  const countdownAudioRef = useRef(null);
  const bgmAudioRef = useRef(null);
  const levelTwoCircleInitRef = useRef(false);
  const levelTwoScaleInitRef = useRef(false);
  const levelThreeScaleInitRef = useRef(false);

  const activeLevel = levels[activeLevelIndex] ?? levels[0];
  const activeGroup = activeLevel?.groups[activeGroupIndex] ?? activeLevel?.groups?.[0];
  const visibleCards = getPlayableCards(activeGroup ?? { cards: [] });
  const hasPlayableGroups = levels.some((level) =>
    level.visible !== false && level.groups.some((group) => getPlayableCards(group).length > 0)
  );
  const stepMs = Math.round((60 / DEFAULT_BPM) * 1000);
  const entryRevealMs = Math.max(140, Math.round(stepMs * 0.72));
  const entryAnimationMs = Math.max(entryRevealMs + 220, Math.round(stepMs * 1.9));

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(levels));
  }, [levels]);

  useEffect(() => {
    if (levelTwoCircleInitRef.current) return;
    levelTwoCircleInitRef.current = true;

    setLevels((prev) =>
      prev.map((level, levelIndex) =>
        levelIndex === 1
          ? {
              ...level,
              groups: level.groups.map((group) => ({
                ...group,
                cards: group.cards.map((card) => ({ ...card, shape: "circle" })),
              })),
            }
          : level
      )
    );
  }, []);

  useEffect(() => {
    if (levelTwoScaleInitRef.current) return;
    levelTwoScaleInitRef.current = true;

    setLevels((prev) =>
      prev.map((level, levelIndex) =>
        levelIndex === 1
          ? {
              ...level,
              groups: level.groups.map((group) => ({
                ...group,
                cards: group.cards.map((card) => ({ ...card, imageScale: 1.1 })),
              })),
            }
          : level
      )
    );
  }, []);

  useEffect(() => {
    if (levelThreeScaleInitRef.current) return;
    levelThreeScaleInitRef.current = true;

    setLevels((prev) =>
      prev.map((level, levelIndex) =>
        levelIndex === 2
          ? {
              ...level,
              groups: level.groups.map((group) => ({
                ...group,
                cards: group.cards.map((card) => ({ ...card, imageScale: 1.4 })),
              })),
            }
          : level
      )
    );
  }, []);

  useEffect(() => {
    const countdownAudio = new Audio(COUNTDOWN_AUDIO_SRC);
    countdownAudio.preload = "auto";
    countdownAudioRef.current = countdownAudio;

    const bgmAudio = new Audio(BGM_AUDIO_SRC);
    bgmAudio.preload = "auto";
    bgmAudioRef.current = bgmAudio;

    return () => {
      countdownAudio.pause();
      bgmAudio.pause();
      countdownAudioRef.current = null;
      bgmAudioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (page !== "player") return;

    const frame = window.requestAnimationFrame(() => {
      playerLayoutRef.current?.scrollIntoView({
        block: "center",
        behavior: "smooth",
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [activeLevelIndex, activeGroupIndex, page]);

  useEffect(() => {
    if (revealTimerRef.current) {
      window.clearInterval(revealTimerRef.current);
      revealTimerRef.current = null;
    }

    if (page !== "player" || !hasStartedPlayback || !isEntering) {
      if (page !== "player" || !hasStartedPlayback) {
        setRevealedCount(0);
      }
      return undefined;
    }

    if (visibleCards.length === 0) {
      setRevealedCount(0);
      return undefined;
    }

    let nextCount = revealedCount;

    revealTimerRef.current = window.setInterval(() => {
      nextCount += 1;
      setRevealedCount(nextCount);

      if (nextCount >= visibleCards.length) {
        window.clearInterval(revealTimerRef.current);
        revealTimerRef.current = null;
        setRevealedCount(visibleCards.length);
        setIsEntering(false);
        playheadRef.current = -1;
        setActiveIndex(-1);
        settleTimerRef.current = window.setTimeout(() => {
          settleTimerRef.current = null;
          setIsPlaying(true);
        }, ENTRY_SETTLE_MS);
      }
    }, entryRevealMs);

    return () => {
      if (revealTimerRef.current) {
        window.clearInterval(revealTimerRef.current);
        revealTimerRef.current = null;
      }
    };
  }, [
    activeLevelIndex,
    activeGroupIndex,
    entryRevealMs,
    hasStartedPlayback,
    isEntering,
    page,
    revealedCount,
    visibleCards.length,
  ]);

  function stopBgm(resetToStart = false) {
    if (!bgmAudioRef.current) return;
    bgmAudioRef.current.pause();
    if (resetToStart) {
      bgmAudioRef.current.currentTime = 0;
    }
  }

  function updateLevel(levelId, updater) {
    setLevels((prev) => prev.map((level) => (level.id === levelId ? updater(level) : level)));
  }

  function updateGroup(levelId, groupId, updater) {
    updateLevel(levelId, (level) => ({
      ...level,
      groups: level.groups.map((group) => (group.id === groupId ? updater(group) : group)),
    }));
  }

  async function deleteUploadedImages(paths) {
    if (!Array.isArray(paths) || paths.length === 0) return;

    try {
      await fetch("/api/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paths }),
      });
    } catch (error) {
      console.error("Failed to delete uploaded images", error);
    }
  }

  function resetPlaybackPosition() {
    const firstPlayable = findFirstPlayablePosition(levels) ?? { levelIndex: 0, groupIndex: 0 };

    levelRef.current = firstPlayable.levelIndex;
    groupRef.current = firstPlayable.groupIndex;
    playheadRef.current = -1;
    setActiveLevelIndex(firstPlayable.levelIndex);
    setActiveGroupIndex(firstPlayable.groupIndex);
    setActiveIndex(-1);
    setRevealedCount(0);
    setIsEntering(false);
    setIsPlaying(false);
    setHasStartedPlayback(false);
    setLevelIntroValue(null);
    setCountdownValue(null);
    if (revealTimerRef.current) {
      window.clearInterval(revealTimerRef.current);
      revealTimerRef.current = null;
    }
    if (settleTimerRef.current) {
      window.clearTimeout(settleTimerRef.current);
      settleTimerRef.current = null;
    }
    if (levelIntroTimerRef.current) {
      window.clearTimeout(levelIntroTimerRef.current);
      levelIntroTimerRef.current = null;
    }
    if (countdownTimerRef.current) {
      window.clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    if (countdownAudioRef.current) {
      countdownAudioRef.current.pause();
      countdownAudioRef.current.currentTime = 0;
    }
    stopBgm(true);
  }

  function beginGroupEntry(levelIndex, groupIndex, options = {}) {
    const { restartBgm = false } = options;

    levelRef.current = levelIndex;
    groupRef.current = groupIndex;
    playheadRef.current = -1;
    setActiveLevelIndex(levelIndex);
    setActiveGroupIndex(groupIndex);
    setActiveIndex(-1);
    setRevealedCount(0);
    setHasStartedPlayback(true);
    setIsPlaying(false);
    setIsEntering(true);
    setLevelIntroValue(null);
    setCountdownValue(null);

    if (restartBgm && bgmAudioRef.current) {
      bgmAudioRef.current.pause();
      bgmAudioRef.current.currentTime = 0;
      bgmAudioRef.current.play().catch(() => {});
    }
  }

  function startCountdown(levelIndex, groupIndex) {
    if (levelIntroTimerRef.current) {
      window.clearTimeout(levelIntroTimerRef.current);
      levelIntroTimerRef.current = null;
    }
    if (countdownTimerRef.current) {
      window.clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }

    levelRef.current = levelIndex;
    groupRef.current = groupIndex;
    playheadRef.current = -1;
    setActiveLevelIndex(levelIndex);
    setActiveGroupIndex(groupIndex);
    setActiveIndex(-1);
    setRevealedCount(0);
    setIsPlaying(false);
    setIsEntering(false);
    setHasStartedPlayback(false);
    setLevelIntroValue(levels[levelIndex]?.name ?? `Level ${levelIndex + 1}`);
    setCountdownValue(null);

    if (countdownAudioRef.current) {
      countdownAudioRef.current.pause();
      countdownAudioRef.current.currentTime = 0;
    }

    stopBgm(true);

    levelIntroTimerRef.current = window.setTimeout(() => {
      levelIntroTimerRef.current = null;
      setLevelIntroValue(null);
      setCountdownValue(3);

      if (countdownAudioRef.current) {
        countdownAudioRef.current.pause();
        countdownAudioRef.current.currentTime = 0;
        countdownAudioRef.current.play().catch(() => {});
      }

      let currentValue = 3;
      countdownTimerRef.current = window.setInterval(() => {
        currentValue -= 1;

        if (currentValue > 0) {
          setCountdownValue(currentValue);
          return;
        }

        window.clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
        setCountdownValue(null);
        beginGroupEntry(levelIndex, groupIndex, { restartBgm: true });
      }, 1000);
    }, LEVEL_INTRO_MS);
  }

  useEffect(() => {
    if (page !== "player" || !isPlaying || isEntering) {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return undefined;
    }

    timerRef.current = window.setInterval(() => {
      const currentLevelIndex = levelRef.current;
      const currentGroupIndex = groupRef.current;
      const currentGroup = levels[currentLevelIndex]?.groups?.[currentGroupIndex];
      const currentCards = currentGroup ? getPlayableCards(currentGroup) : [];

      if (!currentGroup || currentCards.length === 0) {
        const nextPosition = findNextPlayablePosition(levels, currentLevelIndex, currentGroupIndex);

        if (!nextPosition) {
          setIsPlaying(false);
          resetPlaybackPosition();
          return;
        }

        if (nextPosition.levelIndex !== currentLevelIndex) {
          startCountdown(nextPosition.levelIndex, nextPosition.groupIndex);
          return;
        }

        beginGroupEntry(nextPosition.levelIndex, nextPosition.groupIndex, { restartBgm: true });
        return;
      }

      const nextCardIndex = playheadRef.current + 1;

      if (nextCardIndex >= currentCards.length) {
        const nextPosition = findNextPlayablePosition(levels, currentLevelIndex, currentGroupIndex);

        if (!nextPosition) {
          setIsPlaying(false);
          resetPlaybackPosition();
          return;
        }

        if (nextPosition.levelIndex !== currentLevelIndex) {
          startCountdown(nextPosition.levelIndex, nextPosition.groupIndex);
          return;
        }

        beginGroupEntry(nextPosition.levelIndex, nextPosition.groupIndex, { restartBgm: true });
        return;
      }

      playheadRef.current = nextCardIndex;
      setActiveIndex(nextCardIndex);
    }, stepMs);

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isEntering, isPlaying, levels, page, stepMs]);

  function handleAddLevel() {
    setLevels((prev) => [...prev, createLevel(`Level ${prev.length + 1}`)]);
  }

  function handleRemoveLevel(levelId) {
    const levelToRemove = levels.find((level) => level.id === levelId);
    if (levelToRemove) {
      levelToRemove.groups.forEach((group) => {
        deleteUploadedImages(getImagePaths(group.cards));
      });
    }

    setLevels((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((level) => level.id !== levelId);
    });
  }

  function handleLevelNameChange(levelId, name) {
    updateLevel(levelId, (level) => ({ ...level, name }));
  }

  function handleLevelVisibilityToggle(levelId) {
    updateLevel(levelId, (level) => ({ ...level, visible: level.visible === false }));
  }

  function handleAddGroup(levelId) {
    updateLevel(levelId, (level) => ({
      ...level,
      groups: [...level.groups, createGroup(`Group ${level.groups.length + 1}`)],
    }));
  }

  function handleRemoveGroup(levelId, groupId) {
    const level = levels.find((item) => item.id === levelId);
    const groupToRemove = level?.groups.find((group) => group.id === groupId);
    if (groupToRemove) {
      deleteUploadedImages(getImagePaths(groupToRemove.cards));
    }

    updateLevel(levelId, (level) => ({
      ...level,
      groups: level.groups.length === 1
        ? level.groups
        : level.groups.filter((group) => group.id !== groupId),
    }));
  }

  function handleGroupNameChange(levelId, groupId, name) {
    updateGroup(levelId, groupId, (group) => ({ ...group, name }));
  }

  function handleAddCard(levelId, groupId) {
    updateGroup(levelId, groupId, (group) => ({
      ...group,
      cards: [...group.cards, createCard()],
    }));
  }

  function handleRemoveCard(levelId, groupId, cardId) {
    const level = levels.find((item) => item.id === levelId);
    const group = level?.groups.find((item) => item.id === groupId);
    const cardToRemove = group?.cards.find((card) => card.id === cardId);
    if (cardToRemove?.image) {
      deleteUploadedImages([cardToRemove.image]);
    }

    updateGroup(levelId, groupId, (group) => ({
      ...group,
      cards: group.cards.length === 1 ? group.cards : group.cards.filter((card) => card.id !== cardId),
    }));
  }

  function handleCardTextChange(levelId, groupId, cardId, text) {
    updateGroup(levelId, groupId, (group) => ({
      ...group,
      cards: group.cards.map((card) => (card.id === cardId ? { ...card, text } : card)),
    }));
  }

  function handleCardShapeChange(levelId, groupId, cardId, shape) {
    updateGroup(levelId, groupId, (group) => ({
      ...group,
      cards: group.cards.map((card) =>
        card.id === cardId ? { ...card, shape: shape === "circle" ? "circle" : "square" } : card
      ),
    }));
  }

  function handleCardImageScaleChange(levelId, groupId, cardId, imageScale) {
    updateGroup(levelId, groupId, (group) => ({
      ...group,
      cards: group.cards.map((card) =>
        card.id === cardId
          ? { ...card, imageScale: Math.max(0.8, Math.min(2, imageScale)) }
          : card
      ),
    }));
  }

  async function handleUpload(levelId, groupId, cardId, file) {
    if (!file) return;

    const level = levels.find((item) => item.id === levelId);
    const group = level?.groups.find((item) => item.id === groupId);
    const currentCard = group?.cards.find((card) => card.id === cardId);

    const formData = new FormData();
    formData.append("image", file);
    if (currentCard?.image) {
      formData.append("previousImagePath", currentCard.image);
    }

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      const imagePath = typeof data.path === "string" ? data.path : "";
      if (!imagePath) throw new Error("Missing uploaded file path");

      updateGroup(levelId, groupId, (group) => ({
        ...group,
        cards: group.cards.map((card) =>
          card.id === cardId
            ? { ...card, image: imagePath, imagePosition: { x: 50, y: 50 } }
            : card
        ),
      }));
    } catch (error) {
      console.error(error);
      window.alert("Image upload failed. Please start the upload server and try again.");
    }
  }

  function handleImageDragStart(event, levelId, groupId, cardId) {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    const previewRect = event.currentTarget.getBoundingClientRect();
    const level = levels.find((item) => item.id === levelId);
    const group = level?.groups.find((item) => item.id === groupId);
    const card = group?.cards.find((item) => item.id === cardId);
    if (!card?.image) return;

    dragStateRef.current = { levelId, groupId, cardId, previewRect, pointerId: event.pointerId };
    event.currentTarget.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  }

  function handleImageDragMove(event) {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    const x = ((event.clientX - dragState.previewRect.left) / dragState.previewRect.width) * 100;
    const y = ((event.clientY - dragState.previewRect.top) / dragState.previewRect.height) * 100;

    updateGroup(dragState.levelId, dragState.groupId, (group) => ({
      ...group,
      cards: group.cards.map((card) =>
        card.id === dragState.cardId
          ? {
              ...card,
              imagePosition: {
                x: Math.max(0, Math.min(100, x)),
                y: Math.max(0, Math.min(100, y)),
              },
            }
          : card
      ),
    }));
  }

  function handleImageDragEnd(event) {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;
    dragStateRef.current = null;
  }

  function goToPlayer() {
    const firstPlayable = findFirstPlayablePosition(levels) ?? { levelIndex: 0, groupIndex: 0 };
    stopBgm(true);
    setPage("player");
    setIsPlaying(false);
    setIsEntering(false);
    setHasStartedPlayback(false);
    setLevelIntroValue(null);
    setCountdownValue(null);
    setActiveLevelIndex(firstPlayable.levelIndex);
    setActiveGroupIndex(firstPlayable.groupIndex);
    setActiveIndex(-1);
    setRevealedCount(0);
    levelRef.current = firstPlayable.levelIndex;
    groupRef.current = firstPlayable.groupIndex;
    playheadRef.current = -1;
  }

  function goToConfig() {
    stopBgm(true);
    setPage("config");
    setIsPlaying(false);
    setIsEntering(false);
    setHasStartedPlayback(false);
    setRevealedCount(0);
    setLevelIntroValue(null);
    setCountdownValue(null);
  }

  function handleRestart() {
    resetPlaybackPosition();
    const firstPlayable = findFirstPlayablePosition(levels) ?? { levelIndex: 0, groupIndex: 0 };
    startCountdown(firstPlayable.levelIndex, firstPlayable.groupIndex);
  }

  function togglePlayback() {
    if (levelIntroValue !== null || countdownValue !== null) {
      resetPlaybackPosition();
      return;
    }

    if (isPlaying) {
      setIsPlaying(false);
      bgmAudioRef.current?.pause();
      return;
    }

    if (!hasPlayableGroups) return;

    if (isEntering) {
      setIsEntering(false);
      if (revealTimerRef.current) {
        window.clearInterval(revealTimerRef.current);
        revealTimerRef.current = null;
      }
      if (settleTimerRef.current) {
        window.clearTimeout(settleTimerRef.current);
        settleTimerRef.current = null;
      }
      bgmAudioRef.current?.pause();
      return;
    }

    if (hasStartedPlayback && revealedCount > 0 && revealedCount < visibleCards.length) {
      setIsEntering(true);
      bgmAudioRef.current?.play().catch(() => {});
      return;
    }

    const shouldStartFromBeginning = playheadRef.current < 0 && revealedCount === 0;
    if (shouldStartFromBeginning || !hasStartedPlayback) {
      const firstPlayable = findFirstPlayablePosition(levels) ?? {
        levelIndex: levelRef.current,
        groupIndex: groupRef.current,
      };
      startCountdown(firstPlayable.levelIndex, firstPlayable.groupIndex);
      return;
    }

    bgmAudioRef.current?.play().catch(() => {});
    setIsPlaying(true);
  }

  const hideCardsForStageOverlay = levelIntroValue !== null || countdownValue !== null;
  const hidePlayerToolbar = isPlaying || isEntering || levelIntroValue !== null || countdownValue !== null;

  return (
    <div className="page-shell">
      {page === "config" ? (
        <>
          <div className="top-switcher">
            <button
              type="button"
              onClick={goToConfig}
              className={page === "config" ? "mode-button active" : "mode-button"}
            >
              Config
            </button>
            <button
              type="button"
              onClick={goToPlayer}
              className={page === "player" ? "mode-button active" : "mode-button"}
            >
              Player
            </button>
          </div>

          <section className="config-layout">
            <div className="section-header">
              <div>
                <h2>Level Setup</h2>
                <p>Set up each level first, then configure its groups, cards, and images.</p>
              </div>
              <button type="button" className="play-button" onClick={handleAddLevel}>
                Add Level
              </button>
            </div>

            <div className="level-list">
              {levels.map((level, levelIndex) => (
                <section key={level.id} className="level-card">
                  <div className="config-group-header">
                    <input
                      className="group-name-input"
                      value={level.name}
                      onChange={(event) => handleLevelNameChange(level.id, event.target.value)}
                      placeholder={`Level ${levelIndex + 1}`}
                    />
                    <div className="group-actions">
                      <button
                        type="button"
                        className="ghost-button"
                        onClick={() => handleLevelVisibilityToggle(level.id)}
                      >
                        {level.visible === false ? "Show" : "Hide"}
                      </button>
                      <button
                        type="button"
                        className="ghost-button"
                        onClick={() => handleAddGroup(level.id)}
                      >
                        Add Group
                      </button>
                      <button
                        type="button"
                        className="ghost-button danger"
                        onClick={() => handleRemoveLevel(level.id)}
                      >
                        Delete Level
                      </button>
                    </div>
                  </div>

                  {level.visible === false ? null : (
                    <div className="config-groups">
                      {level.groups.map((group, groupIndex) => (
                      <section key={group.id} className="config-group-card nested-group-card">
                        <div className="config-group-header">
                          <input
                            className="group-name-input"
                            value={group.name}
                            onChange={(event) =>
                              handleGroupNameChange(level.id, group.id, event.target.value)
                            }
                            placeholder={`Group ${groupIndex + 1}`}
                          />
                          <div className="group-actions">
                            <button
                              type="button"
                              className="ghost-button"
                              onClick={() => handleAddCard(level.id, group.id)}
                            >
                              Add Card
                            </button>
                            <button
                              type="button"
                              className="ghost-button danger"
                              onClick={() => handleRemoveGroup(level.id, group.id)}
                            >
                              Delete Group
                            </button>
                          </div>
                        </div>

                        <div className="config-card-list">
                          {group.cards.map((card, cardIndex) => (
                            <article key={card.id} className="config-card-item">
                              <div
                                className={
                                  card.shape === "circle"
                                    ? `config-card-preview circle-card-preview${card.image ? " has-image" : ""}`
                                    : `config-card-preview${card.image ? " has-image" : ""}`
                                }
                              >
                                {card.image ? (
                                  <div
                                    className="draggable-image-frame"
                                    onPointerDown={(event) =>
                                      handleImageDragStart(event, level.id, group.id, card.id)
                                    }
                                    onPointerMove={handleImageDragMove}
                                    onPointerUp={handleImageDragEnd}
                                    onPointerCancel={handleImageDragEnd}
                                  >
                                    <img
                                      src={card.image}
                                      alt={card.text || `card-${cardIndex + 1}`}
                                      style={{
                                        objectPosition: getObjectPosition(card),
                                        transform: `scale(${getImageScale(card)})`,
                                      }}
                                    />
                                    <div className="drag-hint">Drag to adjust image position</div>
                                  </div>
                                ) : (
                                  <div className="image-placeholder">Upload Image</div>
                                )}
                              </div>

                              <div className="config-card-fields">
                                <label className="field-block">
                                  <span>Text</span>
                                  <input
                                    type="text"
                                    value={card.text}
                                    onChange={(event) =>
                                      handleCardTextChange(
                                        level.id,
                                        group.id,
                                        card.id,
                                        event.target.value
                                      )
                                    }
                                    placeholder="Enter the word shown on this beat"
                                  />
                                </label>

                                <label className="field-block">
                                  <span>Image</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) =>
                                      handleUpload(level.id, group.id, card.id, event.target.files?.[0])
                                    }
                                  />
                                </label>

                                <label className="field-block">
                                  <span>Shape</span>
                                  <select
                                    value={card.shape}
                                    onChange={(event) =>
                                      handleCardShapeChange(
                                        level.id,
                                        group.id,
                                        card.id,
                                        event.target.value
                                      )
                                    }
                                  >
                                    <option value="square">Square</option>
                                    <option value="circle">Circle</option>
                                  </select>
                                </label>

                                <label className="field-block">
                                  <span>Image Scale {getImageScale(card).toFixed(2)}x</span>
                                  <input
                                    type="range"
                                    min="0.8"
                                    max="2"
                                    step="0.05"
                                    value={getImageScale(card)}
                                    onChange={(event) =>
                                      handleCardImageScaleChange(
                                        level.id,
                                        group.id,
                                        card.id,
                                        Number(event.target.value)
                                      )
                                    }
                                  />
                                </label>

                                <button
                                  type="button"
                                  className="ghost-button danger"
                                  onClick={() => handleRemoveCard(level.id, group.id, card.id)}
                                >
                                  Delete Card
                                </button>
                              </div>
                            </article>
                          ))}
                        </div>
                      </section>
                    ))}
                    </div>
                  )}
                </section>
              ))}
            </div>
          </section>
        </>
      ) : (
        <div className="player-shell">
          {!hidePlayerToolbar ? (
            <div className="top-switcher player-toolbar-row">
              <button
                type="button"
                onClick={goToConfig}
                className={page === "config" ? "mode-button active" : "mode-button"}
              >
                Config
              </button>
              <button
                type="button"
                onClick={goToPlayer}
                className={page === "player" ? "mode-button active" : "mode-button"}
              >
                Player
              </button>
              <div className="controls player-controls">
                <button
                  type="button"
                  onClick={togglePlayback}
                  className="play-button"
                  disabled={!hasPlayableGroups}
                >
                  {isPlaying || isEntering ? "Pause" : "Play"}
                </button>

                <button
                  type="button"
                  onClick={handleRestart}
                  className="restart-button"
                  disabled={!hasPlayableGroups}
                >
                  Restart
                </button>

              </div>
            </div>
          ) : null}

          <section ref={playerLayoutRef} className="player-layout">
            {levelIntroValue !== null ? <div className="level-intro-overlay">{levelIntroValue}</div> : null}
            {countdownValue !== null ? <div className="countdown-overlay">{countdownValue}</div> : null}
            {!hideCardsForStageOverlay ? (
              <div className="cards-grid">
                {visibleCards.slice(0, revealedCount).map((card, index) => {
                  return (
                <article
                  key={card.id}
                  className={
                    index === activeIndex
                      ? `rhythm-card spin-fly-in active${card.shape === "circle" ? " circle-card" : ""}`
                      : `rhythm-card spin-fly-in${card.shape === "circle" ? " circle-card" : ""}`
                  }
                  style={{ "--fly-in-duration": `${entryAnimationMs}ms` }}
                >
                  <div className={card.image ? "card-image has-image" : "card-image"}>
                    {card.image ? (
                      <img
                        src={card.image}
                        alt={card.text}
                        style={{
                          objectPosition: getObjectPosition(card),
                          transform: `scale(${getImageScale(card)})`,
                        }}
                      />
                    ) : (
                      <div className="image-placeholder text-only-placeholder">{card.text}</div>
                    )}
                  </div>
                  {card.image && card.text.trim() ? <div className="card-title">{card.text}</div> : null}
                </article>
                  );
                })}
              </div>
            ) : null}
          </section>
        </div>
      )}
    </div>
  );
}
