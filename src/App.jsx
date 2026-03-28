import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "mayday-rhythm-game-levels";
const LEGACY_STORAGE_KEY = "mayday-rhythm-game-groups";
const ENTRY_SETTLE_MS = 0;
const COUNTDOWN_AUDIO_SRC = "/audio/Countdown .m4a";
const BGM4_AUDIO_SRC = "/audio/Bgm4.m4a";
const BGM4_START_OFFSET_SEC = 2.0;
const BGM4_END_TRIM_SEC = 2.1;
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

function createGroup(name = "新的一组") {
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
      createGroup(`第${index + 1}组`)
    ),
  };
}

const INITIAL_LEVELS = [
  {
    id: crypto.randomUUID(),
    name: "Level 1",
    groups: [
      {
        id: crypto.randomUUID(),
        name: "第一组",
        cards: [
          { id: crypto.randomUUID(), text: "阿信", image: "", imagePosition: { x: 50, y: 50 } },
          { id: crypto.randomUUID(), text: "阿信", image: "", imagePosition: { x: 50, y: 50 } },
          { id: crypto.randomUUID(), text: "阿萨", image: "", imagePosition: { x: 50, y: 50 } },
          { id: crypto.randomUUID(), text: "阿娇", image: "", imagePosition: { x: 50, y: 50 } },
          { id: crypto.randomUUID(), text: "", image: "", imagePosition: { x: 50, y: 50 } },
          { id: crypto.randomUUID(), text: "", image: "", imagePosition: { x: 50, y: 50 } },
          { id: crypto.randomUUID(), text: "", image: "", imagePosition: { x: 50, y: 50 } },
          { id: crypto.randomUUID(), text: "", image: "", imagePosition: { x: 50, y: 50 } },
        ],
      },
      createGroup("第二组"),
      createGroup("第三组"),
      createGroup("第四组"),
      createGroup("第五组"),
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
    name: typeof group.name === "string" ? group.name : "新的一组",
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
  const [bpm, setBpm] = useState(DEFAULT_BPM);
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
  const stepMs = Math.round((60 / bpm) * 1000);
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

    const bgmAudio = new Audio(BGM4_AUDIO_SRC);
    bgmAudio.preload = "auto";
    bgmAudioRef.current = bgmAudio;

    const stopBeforeTail = () => {
      if (!Number.isFinite(bgmAudio.duration)) return;
      if (bgmAudio.currentTime >= bgmAudio.duration - BGM4_END_TRIM_SEC) {
        bgmAudio.pause();
      }
    };

    bgmAudio.addEventListener("timeupdate", stopBeforeTail);

    return () => {
      countdownAudio.pause();
      bgmAudio.pause();
      bgmAudio.removeEventListener("timeupdate", stopBeforeTail);
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
      bgmAudioRef.current.currentTime = BGM4_START_OFFSET_SEC;
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
      bgmAudioRef.current.currentTime = BGM4_START_OFFSET_SEC;
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

        beginGroupEntry(nextPosition.levelIndex, nextPosition.groupIndex);
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

        beginGroupEntry(nextPosition.levelIndex, nextPosition.groupIndex);
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
      groups: [...level.groups, createGroup(`第${level.groups.length + 1}组`)],
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
      window.alert("图片上传失败，请先启动上传服务后再试。");
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
              配置页
            </button>
            <button
              type="button"
              onClick={goToPlayer}
              className={page === "player" ? "mode-button active" : "mode-button"}
            >
              播放页
            </button>
          </div>

          <section className="config-layout">
            <div className="section-header">
              <div>
                <h2>关卡配置</h2>
                <p>先设置 Level，再为每个 Level 配自己的五组词卡与图片。</p>
              </div>
              <button type="button" className="play-button" onClick={handleAddLevel}>
                新增 Level
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
                        {level.visible === false ? "显示" : "隐藏"}
                      </button>
                      <button
                        type="button"
                        className="ghost-button"
                        onClick={() => handleAddGroup(level.id)}
                      >
                        新增一组
                      </button>
                      <button
                        type="button"
                        className="ghost-button danger"
                        onClick={() => handleRemoveLevel(level.id)}
                      >
                        删除 Level
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
                            placeholder={`第${groupIndex + 1}组`}
                          />
                          <div className="group-actions">
                            <button
                              type="button"
                              className="ghost-button"
                              onClick={() => handleAddCard(level.id, group.id)}
                            >
                              新增词卡
                            </button>
                            <button
                              type="button"
                              className="ghost-button danger"
                              onClick={() => handleRemoveGroup(level.id, group.id)}
                            >
                              删除本组
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
                                    <div className="drag-hint">拖动图片调整位置</div>
                                  </div>
                                ) : (
                                  <div className="image-placeholder">上传图片</div>
                                )}
                              </div>

                              <div className="config-card-fields">
                                <label className="field-block">
                                  <span>词语</span>
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
                                    placeholder="输入这一拍显示的词"
                                  />
                                </label>

                                <label className="field-block">
                                  <span>图片</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) =>
                                      handleUpload(level.id, group.id, card.id, event.target.files?.[0])
                                    }
                                  />
                                </label>

                                <label className="field-block">
                                  <span>形状</span>
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
                                    <option value="square">方形</option>
                                    <option value="circle">圆形</option>
                                  </select>
                                </label>

                                <label className="field-block">
                                  <span>图片大小 {getImageScale(card).toFixed(2)}x</span>
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
                                  删除这张词卡
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
                配置页
              </button>
              <button
                type="button"
                onClick={goToPlayer}
                className={page === "player" ? "mode-button active" : "mode-button"}
              >
                播放页
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

                <label className="bpm-control">
                  <span>BPM {bpm}</span>
                  <input
                    type="range"
                    min="120"
                    max="200"
                    step="1"
                    value={bpm}
                    onChange={(event) => setBpm(Number(event.target.value))}
                  />
                </label>
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
