const dex = [
      {
        id: 1, name: "버섯요정 몽실", emoji: "🍄",
        attr: "땅", role: "서포터", rare: false,
        habitat: "이끼숲", trait: "포자 반짝임",
        cute: 92, diff: 25,
        desc: "발자국마다 작은 버섯이 자라요. 비가 오면 더 신나서 뛰어다녀요.",
        tip: "비 오는 날 출현 확률 ↑",
        tags: ["버섯", "힐", "자연"]
      },
      {
        id: 2, name: "물방울 슬라임 퐁퐁", emoji: "🫧",
        attr: "물", role: "탱커", rare: false,
        habitat: "연못가", trait: "탄성 바디",
        cute: 76, diff: 18,
        desc: "방울처럼 통통 튀며 공격을 흡수해요. 낮에는 그늘에서 쉬어요.",
        tip: "불 속성 공격에 약함",
        tags: ["슬라임", "방울", "연못"]
      },
      {
        id: 3, name: "초롱불 여우 루미", emoji: "🦊",
        attr: "빛", role: "딜러", rare: true,
        habitat: "별빛언덕", trait: "야광 꼬리",
        cute: 88, diff: 62,
        desc: "어두운 길을 안내해 주는 여우. 기분 좋을 때 꼬리가 반짝여요.",
        tip: "밤 9시~12시에 자주 등장",
        tags: ["여우", "밤", "빛"]
      },
      {
        id: 4, name: "바람연주 새싹새", emoji: "🐦",
        attr: "바람", role: "버퍼", rare: false,
        habitat: "바람절벽", trait: "휘파람 연주",
        cute: 84, diff: 30,
        desc: "휘파람으로 아군의 속도를 올려요. 놀라면 음이 삑사리 나요.",
        tip: "근처에 ‘바람종’ 아이템 있으면 출현",
        tags: ["새", "버프", "속도"]
      },
      {
        id: 5, name: "숯덩이 고양이 탄", emoji: "🐈‍⬛",
        attr: "불", role: "디버퍼", rare: true,
        habitat: "화산시장", trait: "재먼지 킁킁",
        cute: 73, diff: 55,
        desc: "검은 재먼지를 뿜어 적의 명중률을 낮춰요. 생선구이를 좋아해요.",
        tip: "시장 NPC와 대화 후 골목에서 발견",
        tags: ["고양이", "연기", "시장"]
      },
      {
        id: 6, name: "그림자꼬마 누누", emoji: "👻",
        attr: "어둠", role: "스카우터", rare: false,
        habitat: "폐성당", trait: "숨바꼭질",
        cute: 80, diff: 40,
        desc: "벽에 숨어 있다가 ‘빼꼼’ 하고 나와요. 무서운 척하지만 겁이 많아요.",
        tip: "조용히 접근하면 도망 안 감",
        tags: ["유령", "숨기", "정찰"]
      },
    ];

    // ===== State =====
    const state = {
      q: "",
      attr: "all",
      found: new Set([1,2,4,6]), // 예시: 발견한 ID
      lang: "ko"
    };

    // ===== Elements =====
    const grid = document.getElementById("grid");
    const searchInput = document.getElementById("searchInput");
    const attrFilter = document.getElementById("attrFilter");
    const visibleCount = document.getElementById("visibleCount");
    const totalCount = document.getElementById("totalCount");
    const foundCount = document.getElementById("foundCount");
    const rareCount = document.getElementById("rareCount");
    const randomBtn = document.getElementById("randomBtn");
    const addGuideBtn = document.getElementById("addGuideBtn");
    const langBtn = document.getElementById("langBtn");

    // Modal elements
    const modalOverlay = document.getElementById("modalOverlay");
    const closeBtn = document.getElementById("closeBtn");
    const mEmoji = document.getElementById("mEmoji");
    const mName = document.getElementById("mName");
    const mMeta = document.getElementById("mMeta");
    const mAttr = document.getElementById("mAttr");
    const mRole = document.getElementById("mRole");
    const mHabitat = document.getElementById("mHabitat");
    const mTrait = document.getElementById("mTrait");
    const mDesc = document.getElementById("mDesc");
    const mTags = document.getElementById("mTags");
    const mTip = document.getElementById("mTip");
    const mCuteVal = document.getElementById("mCuteVal");
    const mDiffVal = document.getElementById("mDiffVal");
    const mCuteBar = document.getElementById("mCuteBar");
    const mDiffBar = document.getElementById("mDiffBar");

    // Add Modal elements
    const addModalOverlay = document.getElementById("addModalOverlay");
    const addCloseBtn = document.getElementById("addCloseBtn");
    const addGuideForm = document.getElementById("addGuideForm");

    function matches(item){
      const q = state.q.trim().toLowerCase();
      const attrOk = state.attr === "all" ? true : item.attr === state.attr;
      if(!q) return attrOk;
      const hay = [
        item.name, item.attr, item.role, item.habitat, item.trait,
        ...(item.tags||[])
      ].join(" ").toLowerCase();
      return attrOk && hay.includes(q);
    }

    function render(){
      applyTranslations();

      // header stats
      totalCount.textContent = dex.length.toString();
      foundCount.textContent = state.found.size.toString();
      rareCount.textContent = dex.filter(d => d.rare).length.toString();

      const items = dex.filter(matches);
      visibleCount.textContent = items.length.toString();

      grid.innerHTML = "";
      items.forEach(item => {
        const card = document.createElement("article");
        card.className = "card";
        card.setAttribute("tabindex","0");
        card.dataset.id = item.id;

        const isFound = state.found.has(item.id);
        const title = isFound ? item.name : getTranslation("unfound_title");
        const desc = isFound ? item.desc : getTranslation("unfound_desc");

        card.innerHTML = `
          <div class="thumb">
            <div class="emoji">${isFound ? item.emoji : "❔"}</div>
          </div>
          <div class="cardBody">
            <div class="titleRow">
              <div class="name">${title}</div>
              <div class="id">#${String(item.id).padStart(3,"0")}</div>
            </div>
            <div class="desc">${desc}</div>
            <div class="tags">
              <span class="tag attr">${item.attr}</span>
              <span class="tag">${item.role}</span>
              ${item.rare ? `<span class="tag rare">희귀</span>` : ``}
              ${isFound ? item.tags.slice(0,2).map(t=>`<span class="tag">${t}</span>`).join("") : `<span class="tag" data-lang="unfound_tag">${getTranslation("unfound_tag")}</span>`}
            </div>
          </div>
        `;

        card.addEventListener("click", () => openModal(item));
        card.addEventListener("keydown", (e) => {
          if(e.key === "Enter" || e.key === " ") { e.preventDefault(); openModal(item); }
        });

        grid.appendChild(card);
      });
    }

    function openModal(item){
      const isFound = state.found.has(item.id);

      // 미발견이면 잠금 상태
      if(!isFound){
        mEmoji.textContent = "🔒";
        mName.textContent = getTranslation("locked_modal_title");
        mMeta.textContent = `#${String(item.id).padStart(3,"0")} ${getTranslation("locked_modal_meta")}`;
        mAttr.textContent = "-";
        mRole.textContent = "-";
        mHabitat.textContent = "-";
        mTrait.textContent = "-";
        mDesc.textContent = getTranslation("locked_modal_desc");
        mTags.innerHTML = `<span class="tag">${getTranslation("locked_modal_tag_hint")}</span><span class="tag">${item.tip}</span>`;
        mTip.textContent = item.tip;
        mCuteVal.textContent = "0";
        mDiffVal.textContent = "0";
        mCuteBar.style.width = "0%";
        mDiffBar.style.width = "0%";
      } else {
        mEmoji.textContent = item.emoji;
        mName.textContent = item.name;
        mMeta.textContent = `#${String(item.id).padStart(3,"0")} · ${item.attr} · ${item.role}`;
        mAttr.textContent = item.attr;
        mRole.textContent = item.role;
        mHabitat.textContent = item.habitat;
        mTrait.textContent = item.trait;
        mDesc.textContent = item.desc;
        mTags.innerHTML = `
          <span class="tag attr">${item.attr}</span>
          <span class="tag">${item.role}</span>
          ${item.rare ? `<span class="tag rare">희귀</span>` : ``}
          ${item.tags.map(t=>`<span class="tag">${t}</span>`).join("")}
        `;
        mTip.textContent = item.tip;
        mCuteVal.textContent = String(item.cute);
        mDiffVal.textContent = String(item.diff);
        mCuteBar.style.width = Math.max(0, Math.min(100, item.cute)) + "%";
        mDiffBar.style.width = Math.max(0, Math.min(100, item.diff)) + "%";
      }

      modalOverlay.style.display = "flex";
      modalOverlay.setAttribute("aria-hidden","false");
    }

    function closeModal(){
      modalOverlay.style.display = "none";
      modalOverlay.setAttribute("aria-hidden","true");
    }

    function openAddModal() {
      addModalOverlay.style.display = "flex";
      addModalOverlay.setAttribute("aria-hidden","false");
    }

    function closeAddModal() {
        addModalOverlay.style.display = "none";
        addModalOverlay.setAttribute("aria-hidden","true");
    }

    function applyTranslations() {
      document.querySelectorAll('[data-lang]').forEach(el => {
        const key = el.getAttribute('data-lang');
        const translation = getTranslation(key);
        if (el.placeholder) {
            el.placeholder = translation;
        } else {
            el.textContent = translation;
        }
      });
    }

    function getTranslation(key) {
        return translations[state.lang][key] || key;
    }

    // Events
    searchInput.addEventListener("input", (e) => {
      state.q = e.target.value;
      render();
    });
    attrFilter.addEventListener("change", (e) => {
      state.attr = e.target.value;
      render();
    });
    randomBtn.addEventListener("click", () => {
      const candidates = dex.filter(matches);
      const pick = candidates[Math.floor(Math.random()*candidates.length)] || dex[0];
      openModal(pick);
    });

    addGuideBtn.addEventListener("click", openAddModal);
    langBtn.addEventListener("click", () => {
        state.lang = state.lang === "ko" ? "en" : "ko";
        render();
    });

    addGuideForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newGuide = {
            id: dex.length + 1,
            name: formData.get("name"),
            emoji: formData.get("emoji"),
            attr: formData.get("attr"),
            role: formData.get("role"),
            desc: formData.get("desc"),
            tags: formData.get("tags").split(",").map(tag => tag.trim()),
            rare: false, // Defaulting rare to false
            habitat: "", // Defaulting habitat to empty string
            trait: "", // Defaulting trait to empty string
            cute: 50, // Defaulting cute to 50
            diff: 50, // Defaulting diff to 50
            tip: "", // Defaulting tip to empty string
        };
        dex.push(newGuide);
        state.found.add(newGuide.id);
        e.target.reset();
        closeAddModal();
        render();
    });


    closeBtn.addEventListener("click", closeModal);
    addCloseBtn.addEventListener("click", closeAddModal);
    modalOverlay.addEventListener("click", (e) => {
      if(e.target === modalOverlay) closeModal();
    });
    addModalOverlay.addEventListener("click", (e) => {
      if(e.target === addModalOverlay) closeAddModal();
    });
    window.addEventListener("keydown", (e) => {
      // Ctrl+K focus search
      if((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k"){
        e.preventDefault();
        searchInput.focus();
      }
      if(e.key === "Escape") {
        closeModal();
        closeAddModal();
      }
    });

    // Initial
    render();
