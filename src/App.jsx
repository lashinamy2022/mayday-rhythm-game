import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "mayday-rhythm-game-groups";
const FIXED_BPM = 180;
const ENTRY_SETTLE_MS = 0;

const INITIAL_GROUPS = [
  {
    id: crypto.randomUUID(),
    name: "第一组",
    cards: [
      { id: crypto.randomUUID(), text: "阿信", image: "" },
      { id: crypto.randomUUID(), text: "阿信", image: "" },
      { id: crypto.randomUUID(), text: "阿萨", image: "" },
      { id: crypto.randomUUID(), text: "阿娇", image: "" },
      { id: crypto.randomUUID(), text: "", image: "" },
      { id: crypto.randomUUID(), text: "", image: "" },
      { id: crypto.randomUUID(), text: "", image: "" },
      { id: crypto.randomUUID(), text: "", image: "" },
    ],
  },
];

function createGroup(name = "新的一组") {
  return {
    id: crypto.randomUUID(),
    name,
    cards: Array.from({ length: 8 }, () => createCard()),
  };
}

function createCard() {
  return {
    id: crypto.randomUUID(),
    text: "",
    image: "",
  };
}

function getPlayableCards(group) {
  return group.cards.filter((card) => card.text.trim());
}

function findFirstPlayableGroupIndex(groups) {
  return groups.findIndex((group) => getPlayableCards(group).length > 0);
}

function getImagePaths(cards) {
  return cards
    .map((card) => card.image)
    .filter((imagePath) => typeof imagePath === "string" && imagePath.startsWith("/uploads/"));
}

function padCardsToEight(cards) {
  if (cards.length >= 8) return cards;
  return [...cards, ...Array.from({ length: 8 - cards.length }, () => createCard())];
}

function normalizeInitialGroups(groups) {
  if (!Array.isArray(groups) || groups.length === 0) {
    return INITIAL_GROUPS;
  }

  return groups.map((group, index) => {
    if (index !== 0 || group.name !== "第一组") {
      return group;
    }

    return {
      ...group,
      cards: padCardsToEight(Array.isArray(group.cards) ? group.cards : []),
    };
  });
}

export default function App() {
  const [page, setPage] = useState("config");
  const [groups, setGroups] = useState(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (!saved) return INITIAL_GROUPS;

      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed) || parsed.length === 0) return INITIAL_GROUPS;
      return normalizeInitialGroups(parsed);
    } catch {
      return INITIAL_GROUPS;
    }
  });
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [revealedCount, setRevealedCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStartedPlayback, setHasStartedPlayback] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const timerRef = useRef(null);
  const groupRef = useRef(0);
  const playheadRef = useRef(-1);
  const playerLayoutRef = useRef(null);
  const revealTimerRef = useRef(null);
  const settleTimerRef = useRef(null);

  const activeGroup = groups[activeGroupIndex] ?? groups[0];
  const visibleCards = getPlayableCards(activeGroup ?? { cards: [] });
  const hasPlayableGroups = groups.some((group) => getPlayableCards(group).length > 0);
  const stepMs = Math.round((60 / FIXED_BPM) * 1000);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    if (page !== "player") return;

    const frame = window.requestAnimationFrame(() => {
      playerLayoutRef.current?.scrollIntoView({
        block: "center",
        behavior: "smooth",
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [activeGroupIndex, page]);

  useEffect(() => {
    if (revealTimerRef.current) {
      window.clearInterval(revealTimerRef.current);
      revealTimerRef.current = null;
    }

    if (page !== "player" || !hasStartedPlayback) {
      setRevealedCount(0);
      return undefined;
    }

    if (!isEntering) {
      return undefined;
    }

    if (visibleCards.length === 0) {
      setRevealedCount(0);
      return undefined;
    }

    setRevealedCount(0);
    let nextCount = 0;

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
    }, 220);

    return () => {
      if (revealTimerRef.current) {
        window.clearInterval(revealTimerRef.current);
        revealTimerRef.current = null;
      }
    };
  }, [activeGroupIndex, hasStartedPlayback, isEntering, page, visibleCards.length]);

  function resetPlaybackPosition() {
    const firstPlayableGroupIndex = findFirstPlayableGroupIndex(groups);
    const startIndex = firstPlayableGroupIndex >= 0 ? firstPlayableGroupIndex : 0;

    groupRef.current = startIndex;
    playheadRef.current = -1;
    setActiveGroupIndex(startIndex);
    setActiveIndex(-1);
    setRevealedCount(0);
    setIsEntering(false);
    setIsPlaying(false);
    setHasStartedPlayback(false);
    if (revealTimerRef.current) {
      window.clearInterval(revealTimerRef.current);
      revealTimerRef.current = null;
    }
    if (settleTimerRef.current) {
      window.clearTimeout(settleTimerRef.current);
      settleTimerRef.current = null;
    }
  }

  function beginGroupEntry(groupIndex) {
    groupRef.current = groupIndex;
    playheadRef.current = -1;
    setActiveGroupIndex(groupIndex);
    setActiveIndex(-1);
    setRevealedCount(0);
    setHasStartedPlayback(true);
    setIsPlaying(false);
    setIsEntering(true);
  }

  useEffect(() => {
    if (page !== "player" || !isPlaying || isEntering) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return undefined;
    }

    timerRef.current = setInterval(() => {
      const currentGroupIndex = groupRef.current;
      const currentGroup = groups[currentGroupIndex];
      const currentCards = currentGroup ? getPlayableCards(currentGroup) : [];

      if (!currentGroup || currentCards.length === 0) {
        const nextPlayableGroupIndex = groups.findIndex(
          (group, index) => index > currentGroupIndex && getPlayableCards(group).length > 0
        );

        if (nextPlayableGroupIndex === -1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          setIsPlaying(false);
          resetPlaybackPosition();
          return;
        }

        clearInterval(timerRef.current);
        timerRef.current = null;
        beginGroupEntry(nextPlayableGroupIndex);
        return;
      }

      let nextCardIndex = playheadRef.current + 1;

      if (nextCardIndex >= currentCards.length) {
        const nextGroupIndex = groups.findIndex(
          (group, index) => index > currentGroupIndex && getPlayableCards(group).length > 0
        );

        if (nextGroupIndex === -1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          setIsPlaying(false);
          resetPlaybackPosition();
          return;
        }

        clearInterval(timerRef.current);
        timerRef.current = null;
        beginGroupEntry(nextGroupIndex);
        return;
      }

      playheadRef.current = nextCardIndex;
      setActiveIndex(nextCardIndex);
    }, stepMs);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [groups, isEntering, isPlaying, page, stepMs]);

  function updateGroup(groupId, updater) {
    setGroups((prev) =>
      prev.map((group) => (group.id === groupId ? updater(group) : group))
    );
  }

  async function deleteUploadedImages(paths) {
    if (!Array.isArray(paths) || paths.length === 0) return;

    try {
      await fetch("/api/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paths }),
      });
    } catch (error) {
      console.error("Failed to delete uploaded images", error);
    }
  }

  function handleAddGroup() {
    setGroups((prev) => [...prev, createGroup(`第${prev.length + 1}组`)]);
  }

  function handleRemoveGroup(groupId) {
    const groupToRemove = groups.find((group) => group.id === groupId);
    if (groupToRemove) {
      deleteUploadedImages(getImagePaths(groupToRemove.cards));
    }

    setGroups((prev) => {
      if (prev.length === 1) return prev;
      const next = prev.filter((group) => group.id !== groupId);
      const nextIndex = Math.min(activeGroupIndex, next.length - 1);
      setActiveGroupIndex(nextIndex);
      groupRef.current = nextIndex;
      return next;
    });
  }

  function handleGroupNameChange(groupId, name) {
    updateGroup(groupId, (group) => ({ ...group, name }));
  }

  function handleAddCard(groupId) {
    updateGroup(groupId, (group) => ({
      ...group,
      cards: [...group.cards, createCard()],
    }));
  }

  function handleRemoveCard(groupId, cardId) {
    const group = groups.find((item) => item.id === groupId);
    const cardToRemove = group?.cards.find((card) => card.id === cardId);
    if (cardToRemove?.image) {
      deleteUploadedImages([cardToRemove.image]);
    }

    updateGroup(groupId, (group) => ({
      ...group,
      cards:
        group.cards.length === 1
          ? group.cards
          : group.cards.filter((card) => card.id !== cardId),
    }));
  }

  function handleCardTextChange(groupId, cardId, text) {
    updateGroup(groupId, (group) => ({
      ...group,
      cards: group.cards.map((card) =>
        card.id === cardId ? { ...card, text } : card
      ),
    }));
  }

  async function handleUpload(groupId, cardId, file) {
    if (!file) return;

    const currentGroup = groups.find((group) => group.id === groupId);
    const currentCard = currentGroup?.cards.find((card) => card.id === cardId);

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
      if (!imagePath) {
        throw new Error("Missing uploaded file path");
      }

      updateGroup(groupId, (group) => ({
        ...group,
        cards: group.cards.map((card) =>
          card.id === cardId ? { ...card, image: imagePath } : card
        ),
      }));
    } catch (error) {
      console.error(error);
      window.alert("图片上传失败，请先启动上传服务后再试。");
    }
  }

  function goToPlayer() {
    const firstPlayableGroupIndex = findFirstPlayableGroupIndex(groups);
    const startIndex = firstPlayableGroupIndex >= 0 ? firstPlayableGroupIndex : 0;
    if (revealTimerRef.current) {
      window.clearInterval(revealTimerRef.current);
      revealTimerRef.current = null;
    }
    if (settleTimerRef.current) {
      window.clearTimeout(settleTimerRef.current);
      settleTimerRef.current = null;
    }
    setPage("player");
    setIsPlaying(false);
    setIsEntering(false);
    setHasStartedPlayback(false);
    setActiveGroupIndex(startIndex);
    setActiveIndex(-1);
    setRevealedCount(0);
    groupRef.current = startIndex;
    playheadRef.current = -1;
  }

  function goToConfig() {
    if (revealTimerRef.current) {
      window.clearInterval(revealTimerRef.current);
      revealTimerRef.current = null;
    }
    if (settleTimerRef.current) {
      window.clearTimeout(settleTimerRef.current);
      settleTimerRef.current = null;
    }
    setPage("config");
    setIsPlaying(false);
    setIsEntering(false);
    setHasStartedPlayback(false);
    setRevealedCount(0);
  }

  function handleRestart() {
    resetPlaybackPosition();
    const firstPlayableGroupIndex = findFirstPlayableGroupIndex(groups);
    const startIndex = firstPlayableGroupIndex >= 0 ? firstPlayableGroupIndex : 0;
    beginGroupEntry(startIndex);
  }

  function togglePlayback() {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }

    const playableGroups = groups.filter((group) =>
      getPlayableCards(group).length > 0
    );
    if (playableGroups.length === 0) return;

    const currentPlayableCards = groups[groupRef.current]
      ? getPlayableCards(groups[groupRef.current])
      : [];

    if (
      groupRef.current >= groups.length ||
      (currentPlayableCards.length > 0 &&
        playheadRef.current >= currentPlayableCards.length - 1 &&
        findFirstPlayableGroupIndex(groups) !== groupRef.current)
    ) {
      resetPlaybackPosition();
    }

    if (
      currentPlayableCards.length > 0 &&
      playheadRef.current >= currentPlayableCards.length - 1 &&
      groups.findIndex(
        (group, index) => index > groupRef.current && getPlayableCards(group).length > 0
      ) === -1
    ) {
      resetPlaybackPosition();
    }

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
      return;
    }

    const shouldStartFromBeginning = playheadRef.current < 0 && revealedCount === 0;
    if (shouldStartFromBeginning || !hasStartedPlayback) {
      beginGroupEntry(groupRef.current);
      return;
    }

    setIsPlaying(true);
  }

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
              <h2>分组配置</h2>
              <p>你可以自由新增页面、调整每组词语，并给每个词配图。</p>
            </div>
            <button type="button" className="play-button" onClick={handleAddGroup}>
              新增一组
            </button>
          </div>

          <div className="config-groups">
            {groups.map((group, groupIndex) => (
              <section key={group.id} className="config-group-card">
                <div className="config-group-header">
                  <input
                    className="group-name-input"
                    value={group.name}
                    onChange={(event) =>
                      handleGroupNameChange(group.id, event.target.value)
                    }
                    placeholder={`第${groupIndex + 1}组`}
                  />
                  <div className="group-actions">
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={() => handleAddCard(group.id)}
                    >
                      新增词卡
                    </button>
                    <button
                      type="button"
                      className="ghost-button danger"
                      onClick={() => handleRemoveGroup(group.id)}
                    >
                      删除本组
                    </button>
                  </div>
                </div>

                <div className="config-card-list">
                  {group.cards.map((card, cardIndex) => (
                    <article key={card.id} className="config-card-item">
                      <div className="config-card-preview">
                        {card.image ? (
                          <img src={card.image} alt={card.text || `card-${cardIndex + 1}`} />
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
                              handleCardTextChange(group.id, card.id, event.target.value)
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
                              handleUpload(group.id, card.id, event.target.files?.[0])
                            }
                          />
                        </label>

                        <button
                          type="button"
                          className="ghost-button danger"
                          onClick={() => handleRemoveCard(group.id, card.id)}
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
          </section>
        </>
      ) : (
        <div className="player-shell">
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
            </div>
          </div>

          <section ref={playerLayoutRef} className="player-layout">
            <div className="cards-grid">
              {visibleCards.slice(0, revealedCount).map((card, index) => (
                <article
                  key={card.id}
                  className={
                    index === activeIndex
                      ? "rhythm-card spin-fly-in active"
                      : "rhythm-card spin-fly-in"
                  }
                >
                  <div className="card-image">
                    {card.image ? (
                      <img src={card.image} alt={card.text} />
                    ) : (
                      <div className="image-placeholder text-only-placeholder">
                        {card.text}
                      </div>
                    )}
                  </div>
                  <div className="card-title">{card.text}</div>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}

    </div>
  );
}
