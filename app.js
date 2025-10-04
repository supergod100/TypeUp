(() => {
  // AI生成QUOTESの管理
  const AI_QUOTES = {
    generated: [],
    mistakeBased: [],
    currentIndex: 0
  };

  // デフォルトのQUOTES（フォールバック用）
  const DEFAULT_QUOTES = [
    "Knowledge is a treasure that no one can take away from you. It accumulates over time and helps in various life situations.",
    "Small steps lead to big changes. Daily accumulation will eventually lead to great results.",
    "Concentrating and typing accurately improves work efficiency and reduces stress.",
    "Practice makes perfect. Continuing to practice a little each day will definitely lead to improvement.",
    "Take deep breaths and relax while typing rhythmically. This is important for good performance.",
    "Don't be afraid of errors when challenging yourself. This is the first step to growth. We learn a lot from failures.",
    "Typing skills are one of the important abilities in modern society. Accurate and fast typing greatly improves work efficiency.",
    "Through repeated practice, your fingers will move naturally, and your thoughts and finger movements will become integrated.",
    "It is important to sit with correct posture, relax your wrists, and be conscious of finger positions while typing.",
    "Focus on accuracy rather than speed, and gradually increase your speed. This is the key to improvement."
  ];

  const quoteDisplay = document.getElementById("quote");
  const romajiDisplay = document.getElementById("romaji");
  const inputField = document.getElementById("input");
  const startButton = document.getElementById("start");
  const nextButton = document.getElementById("next");
  const elapsedTimeDisplay = document.getElementById("elapsedTime");
  const totalCharsDisplay = document.getElementById("totalChars");
  const errorCountDisplay = document.getElementById("errorCount");
  const accuracyDisplay = document.getElementById("accuracy");
  const wpmDisplay = document.getElementById("wpm");
  const feedback = document.getElementById("feedback");
  const weakKeysSection = document.getElementById("weakKeysSection");
  const weakKeysList = document.getElementById("weakKeysList");
  const aiStatusSection = document.getElementById("aiStatusSection");
  const aiStatusList = document.getElementById("aiStatusList");
  const apiKeyInput = document.getElementById("apiKeyInput");
  const saveApiKeyButton = document.getElementById("saveApiKey");
  const clearApiKeyButton = document.getElementById("clearApiKey");
  const apiKeyStatus = document.getElementById("apiKeyStatus");

  const API_STORAGE_KEY = "typeup.openai.apiKey";
  const OPENAI_ENDPOINT = "https://api.openai.com/v1/chat/completions";
  const OPENAI_MODEL = "gpt-4o-mini";
  const MAX_CACHED_QUOTES = 10;

  let isRunning = false;
  let currentQuote = { text: "", romajiTokens: [] };
  let sessionStart = null;
  let totalTyped = 0;
  let correctTyped = 0;
  let errorCount = 0;
  let keyErrors = {}; // 苦手キー分析用
  let sessionTotalTyped = 0; // セッション累積入力文字数
  let sessionTotalErrors = 0; // セッション累積ミス文字数
  let currentRomajiTarget = ""; // ローマ字入力比較用
  let currentRomajiCharMap = []; // ローマ字インデックスから日本語文字へのマッピング
  let currentRomajiTokens = []; // 文字単位のローマ字配列
  let currentRomajiErrorSnapshot = 0; // 最新のミス数スナップショット

  const getStoredApiKey = () => localStorage.getItem(API_STORAGE_KEY) || "";

  const setStoredApiKey = (key) => {
    if (key) {
      localStorage.setItem(API_STORAGE_KEY, key);
    }
  };

  const clearStoredApiKey = () => {
    localStorage.removeItem(API_STORAGE_KEY);
  };

  const updateApiKeyStatus = (message) => {
    if (apiKeyStatus) {
      apiKeyStatus.textContent = message;
    }
  };

  const convertTextToRomajiTokens = (text) => {
    return [...text].map(char => {
      const romaji = getRomajiForChar(char);
      return typeof romaji === "string" ? romaji.toLowerCase() : String(romaji || "");
    });
  };

  const trimQuoteHistory = (list, limit = MAX_CACHED_QUOTES) => {
    if (list.length > limit) {
      list.splice(0, list.length - limit);
    }
  };

  const prepareRomajiData = (text, romajiTokens = null) => {
    const textChars = [...text];
    const tokens = Array.isArray(romajiTokens) && romajiTokens.length === textChars.length
      ? romajiTokens
      : convertTextToRomajiTokens(text);

    currentRomajiTokens = tokens;

    const romajiChars = [];
    const charMap = [];

    textChars.forEach((char, index) => {
      const token = tokens[index] ?? "";
      const normalizedDisplay = String(token);
      const letters = [...normalizedDisplay];

      if (letters.length === 0) {
        letters.push(" ");
      }

      letters.forEach(letter => {
        const displayLetter = letter;
        const targetLetter = letter.toUpperCase();
        romajiChars.push(targetLetter);
        charMap.push({ display: displayLetter, target: targetLetter, char, index });
      });
    });

    currentRomajiTarget = romajiChars.join("");
    currentRomajiCharMap = charMap;
  };

  const syncApiKeyUI = () => {
    const storedKey = getStoredApiKey();
    if (apiKeyInput) {
      apiKeyInput.value = storedKey;
    }
    if (storedKey) {
      updateApiKeyStatus("APIキーが設定されています。AI生成文章を利用します。");
    } else {
      updateApiKeyStatus("APIキー未設定です。デフォルト文章を使用します。");
    }
  };

  const resetAIQuoteCache = () => {
    AI_QUOTES.generated.length = 0;
    AI_QUOTES.mistakeBased.length = 0;
    AI_QUOTES.currentIndex = 0;
  };

  // AIでQUOTESを生成する関数
  const generateAIQuote = async (mistakeKeys = []) => {
    const apiKey = getStoredApiKey();
    if (!apiKey) {
      throw new Error("API key is not set");
    }

    const baseInstruction = "タイピング練習に役立つ自然な日本語文を1つ生成してください。";
    const keyInstruction = mistakeKeys.length > 0
      ? `次の文字を自然に散りばめてください（不自然にならないようにしてください）: ${mistakeKeys.join(', ')}`
      : "";

    const userPrompt = `${baseInstruction}\n${keyInstruction ? `${keyInstruction}\n` : ""}制約:\n- 60文字以内の自然な日本語文\n- タイピング学習に有用な内容\n- ローマ字転写はヘボン式で単語ごとにスペースを入れてください`;

    const response = await fetch(OPENAI_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        temperature: 0.8,
        top_p: 0.95,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "You create Japanese typing practice sentences. Respond only as JSON with keys 'text', 'romaji', and 'romaji_tokens'. 'romaji_tokens' must be an array whose length equals the number of characters in 'text', each item containing the Hepburn romaji for the matching character (preserve spaces and punctuation)."
          },
          {
            role: "user",
            content: userPrompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const rawContent = data?.choices?.[0]?.message?.content;
    if (!rawContent) {
      throw new Error("OpenAI response did not include content");
    }

    let payload;
    try {
      payload = JSON.parse(rawContent);
    } catch (parseError) {
      throw new Error("Failed to parse AI response JSON");
    }

    const text = typeof payload.text === "string" ? payload.text.trim() : "";
    const romaji = typeof payload.romaji === "string" ? payload.romaji.trim() : "";
    const romajiTokens = Array.isArray(payload.romaji_tokens)
      ? payload.romaji_tokens.map(token => typeof token === "string" ? token : String(token ?? ""))
      : Array.isArray(payload.romajiTokens)
        ? payload.romajiTokens.map(token => typeof token === "string" ? token : String(token ?? ""))
        : null;

    if (!text) {
      throw new Error("AI did not return a text value");
    }

    return {
      text,
      romaji: romaji,
      romajiTokens: romajiTokens
    };
  };


  const pickRandomQuote = async (mistakeKeys = []) => {
    try {
      const quote = await generateAIQuote(mistakeKeys);
      if (mistakeKeys.length > 0) {
        AI_QUOTES.mistakeBased.push(quote);
        trimQuoteHistory(AI_QUOTES.mistakeBased);
        updateApiKeyStatus("AIがミスしたキーを盛り込んだ文章を生成しました。");
      } else {
        AI_QUOTES.generated.push(quote);
        AI_QUOTES.currentIndex = AI_QUOTES.generated.length;
        trimQuoteHistory(AI_QUOTES.generated);
        updateApiKeyStatus("AIが新しい練習文を生成しました。");
      }
      return quote;
    } catch (error) {
      console.error("AI生成エラー:", error);
      if (error?.message?.includes("API key is not set")) {
        updateApiKeyStatus("APIキー未設定です。デフォルト文章を使用します。");
      } else {
        updateApiKeyStatus("AI生成に失敗しました。デフォルト文章で続行します。");
      }
      const fallbacks = DEFAULT_QUOTES.map(text => ({
        text,
        romajiTokens: convertTextToRomajiTokens(text)
      }));
      const index = Math.floor(Math.random() * fallbacks.length);
      return fallbacks[index];
    }
  };

  const renderQuote = text => {
    quoteDisplay.innerHTML = "";
    [...text].forEach(char => {
      const span = document.createElement("span");
      span.textContent = char;
      span.dataset.char = char;
      quoteDisplay.appendChild(span);
    });
  };

  // ローマ字表示用の関数
  const renderRomaji = () => {
    romajiDisplay.innerHTML = "";
    currentRomajiCharMap.forEach(({ display, index }) => {
      const span = document.createElement("span");
      span.textContent = display;
      span.dataset.charIndex = String(index);
      romajiDisplay.appendChild(span);
    });
  };

  // 文字に対応するローマ字を取得（大文字で返す）
  const getRomajiForChar = (char) => {
    const romajiMap = {
      // ひらがな
      'あ': 'A', 'い': 'I', 'う': 'U', 'え': 'E', 'お': 'O',
      'か': 'KA', 'き': 'KI', 'く': 'KU', 'け': 'KE', 'こ': 'KO',
      'が': 'GA', 'ぎ': 'GI', 'ぐ': 'GU', 'げ': 'GE', 'ご': 'GO',
      'さ': 'SA', 'し': 'SHI', 'す': 'SU', 'せ': 'SE', 'そ': 'SO',
      'ざ': 'ZA', 'じ': 'JI', 'ず': 'ZU', 'ぜ': 'ZE', 'ぞ': 'ZO',
      'た': 'TA', 'ち': 'CHI', 'つ': 'TSU', 'て': 'TE', 'と': 'TO',
      'だ': 'DA', 'ぢ': 'DI', 'づ': 'DU', 'で': 'DE', 'ど': 'DO',
      'な': 'NA', 'に': 'NI', 'ぬ': 'NU', 'ね': 'NE', 'の': 'NO',
      'は': 'HA', 'ひ': 'HI', 'ふ': 'FU', 'へ': 'HE', 'ほ': 'HO',
      'ば': 'BA', 'び': 'BI', 'ぶ': 'BU', 'べ': 'BE', 'ぼ': 'BO',
      'ぱ': 'PA', 'ぴ': 'PI', 'ぷ': 'PU', 'ぺ': 'PE', 'ぽ': 'PO',
      'ま': 'MA', 'み': 'MI', 'む': 'MU', 'め': 'ME', 'も': 'MO',
      'や': 'YA', 'ゆ': 'YU', 'よ': 'YO',
      'ら': 'RA', 'り': 'RI', 'る': 'RU', 'れ': 'RE', 'ろ': 'RO',
      'わ': 'WA', 'を': 'WO', 'ん': 'N',
      'っ': 'LTU', 'ー': '-', '、': ',', '。': '.', '　': ' ', ' ': ' ',
      
      // カタカナ
      'ア': 'A', 'イ': 'I', 'ウ': 'U', 'エ': 'E', 'オ': 'O',
      'カ': 'KA', 'キ': 'KI', 'ク': 'KU', 'ケ': 'KE', 'コ': 'KO',
      'ガ': 'GA', 'ギ': 'GI', 'グ': 'GU', 'ゲ': 'GE', 'ゴ': 'GO',
      'サ': 'SA', 'シ': 'SHI', 'ス': 'SU', 'セ': 'SE', 'ソ': 'SO',
      'ザ': 'ZA', 'ジ': 'JI', 'ズ': 'ZU', 'ゼ': 'ZE', 'ゾ': 'ZO',
      'タ': 'TA', 'チ': 'CHI', 'ツ': 'TSU', 'テ': 'TE', 'ト': 'TO',
      'ダ': 'DA', 'ヂ': 'DI', 'ヅ': 'DU', 'デ': 'DE', 'ド': 'DO',
      'ナ': 'NA', 'ニ': 'NI', 'ヌ': 'NU', 'ネ': 'NE', 'ノ': 'NO',
      'ハ': 'HA', 'ヒ': 'HI', 'フ': 'FU', 'ヘ': 'HE', 'ホ': 'HO',
      'バ': 'BA', 'ビ': 'BI', 'ブ': 'BU', 'ベ': 'BE', 'ボ': 'BO',
      'パ': 'PA', 'ピ': 'PI', 'プ': 'PU', 'ペ': 'PE', 'ポ': 'PO',
      'マ': 'MA', 'ミ': 'MI', 'ム': 'MU', 'メ': 'ME', 'モ': 'MO',
      'ヤ': 'YA', 'ユ': 'YU', 'ヨ': 'YO',
      'ラ': 'RA', 'リ': 'RI', 'ル': 'RU', 'レ': 'RE', 'ロ': 'RO',
      'ワ': 'WA', 'ヲ': 'WO', 'ン': 'N',
      'ッ': 'LTU',
      
      // 漢字の読み仮名（よく使われる漢字）
      '学': 'GAKU', '習': 'SHUU', '練': 'REN', '練': 'REN', '習': 'SHUU',
      '正': 'SEI', '確': 'KAKU', '速': 'SOKU', '度': 'DO',
      '時': 'JI', '間': 'KAN', '分': 'BUN', '秒': 'BYOU',
      '文': 'BUN', '字': 'JI', '入': 'NYUU', '力': 'RYOKU',
      '上': 'JOU', '手': 'TE', '達': 'TATSU', '成': 'SEI', '長': 'CHOU',
      '重': 'JUU', '要': 'YOU', '技': 'GI', '術': 'JUTSU',
      '現': 'GEN', '代': 'DAI', '社': 'SHA', '会': 'KAI',
      '効': 'KOU', '率': 'RITSU', '向': 'KOU', '上': 'JOU',
      '継': 'KEI', '続': 'ZOKU', '力': 'RYOKU', '成': 'SEI', '果': 'KA',
      '小': 'SHOU', '一': 'ICHI', '歩': 'HO', '大': 'DAI', '変': 'HEN', '化': 'KA',
      '集': 'SHUU', '中': 'CHUU', '作': 'SAKU', '業': 'GYOU',
      '深': 'SHIN', '呼': 'KO', '吸': 'KYUU', 'リ': 'RI', 'ズ': 'ZU', 'ム': 'MU',
      '指': 'SHI', '自': 'JI', '然': 'ZEN', '動': 'DOU', '思': 'SHI', '考': 'KOU',
      '体': 'TAI', '化': 'KA', '状': 'JOU', '態': 'TAI',
      '座': 'ZA', '手': 'TE', '首': 'SHU', 'ラ': 'RA', 'ク': 'KU', 'ス': 'SU',
      '位': 'I', '置': 'CHI', '意': 'I', '識': 'SHIKI',
      '速': 'SOKU', 'さ': 'SA', 'よ': 'YO', 'り': 'RI', '正': 'SEI', '確': 'KAKU',
      '性': 'SEI', '重': 'JUU', '視': 'SHI', '徐': 'JO', '々': 'JO', 'ス': 'SU', 'ピ': 'PI', 'ー': 'D', 'ド': 'DO',
      '上': 'JOU', '達': 'TATSU', 'コ': 'KO', 'ツ': 'TSU',
      'エ': 'E', 'ラ': 'RA', 'ー': 'D', '恐': 'KYOU', 'れ': 'RE', 'ず': 'ZU', '挑': 'CHOU', '戦': 'SEN',
      '成': 'SEI', '長': 'CHOU', '第': 'DAI', '一': 'ICHI', '歩': 'HO',
      '失': 'SHITSU', '敗': 'HAI', 'か': 'KA', 'ら': 'RA', '学': 'GAKU', 'ぶ': 'BU',
      '現': 'GEN', '代': 'DAI', '社': 'SHA', '会': 'KAI', 'お': 'O', 'い': 'I', 'て': 'TE',
      '重': 'JUU', '要': 'YOU', '能': 'NOU', '力': 'RYOKU', '一': 'ICHI', 'つ': 'TSU',
      '正': 'SEI', '確': 'KAKU', '速': 'SOKU', 'タ': 'TA', 'イ': 'I', 'ピ': 'PI', 'ン': 'N', 'グ': 'GU',
      '仕': 'SHI', '事': 'JI', '効': 'KOU', '率': 'RITSU', '大': 'DAI', '幅': 'HABA', '向': 'KOU', '上': 'JOU',
      '練': 'REN', '習': 'SHUU', '重': 'JUU', 'ね': 'NE', 'る': 'RU', 'こ': 'KO', 'と': 'TO',
      '指': 'SHI', '自': 'JI', '然': 'ZEN', '動': 'DOU', 'よ': 'YO', 'う': 'U', 'に': 'NI',
      '思': 'SHI', '考': 'KOU', '指': 'SHI', '動': 'DOU', '一': 'ICHI', '体': 'TAI', '化': 'KA', '状': 'JOU', '態': 'TAI',
      '正': 'SEI', '座': 'ZA', '手': 'TE', '首': 'SHU', 'ラ': 'RA', 'ク': 'KU', 'ス': 'SU',
      '指': 'SHI', '位': 'I', '置': 'CHI', '意': 'I', '識': 'SHIKI', 'な': 'NA', 'が': 'GA', 'ら': 'RA',
      '速': 'SOKU', 'さ': 'SA', 'よ': 'YO', 'り': 'RI', '正': 'SEI', '確': 'KAKU', '性': 'SEI', '重': 'JUU', '視': 'SHI',
      '徐': 'JO', '々': 'JO', 'ス': 'SU', 'ピ': 'PI', 'ー': 'D', 'ド': 'DO', '上': 'JOU', 'げ': 'GE', 'る': 'RU', 'こ': 'KO', 'と': 'TO',
      'エ': 'E', 'ラ': 'RA', 'ー': 'D', '恐': 'KYOU', 'れ': 'RE', 'ず': 'ZU', '挑': 'CHOU', '戦': 'SEN',
      '成': 'SEI', '長': 'CHOU', '第': 'DAI', '一': 'ICHI', '歩': 'HO',
      '失': 'SHITSU', '敗': 'HAI', 'か': 'KA', 'ら': 'RA', '学': 'GAKU', 'ぶ': 'BU',
      '現': 'GEN', '代': 'DAI', '社': 'SHA', '会': 'KAI', 'お': 'O', 'い': 'I', 'て': 'TE',
      '重': 'JUU', '要': 'YOU', '能': 'NOU', '力': 'RYOKU', '一': 'ICHI', 'つ': 'TSU',
      '正': 'SEI', '確': 'KAKU', '速': 'SOKU', 'タ': 'TA', 'イ': 'I', 'ピ': 'PI', 'ン': 'N', 'グ': 'GU',
      '仕': 'SHI', '事': 'JI', '効': 'KOU', '率': 'RITSU', '大': 'DAI', '幅': 'HABA', '向': 'KOU', '上': 'JOU',
      '練': 'REN', '習': 'SHUU', '重': 'JUU', 'ね': 'NE', 'る': 'RU', 'こ': 'KO', 'と': 'TO',
      '指': 'SHI', '自': 'JI', '然': 'ZEN', '動': 'DOU', 'よ': 'YO', 'う': 'U', 'に': 'NI',
      '思': 'SHI', '考': 'KOU', '指': 'SHI', '動': 'DOU', '一': 'ICHI', '体': 'TAI', '化': 'KA', '状': 'JOU', '態': 'TAI',
      '正': 'SEI', '座': 'ZA', '手': 'TE', '首': 'SHU', 'ラ': 'RA', 'ク': 'KU', 'ス': 'SU',
      '指': 'SHI', '位': 'I', '置': 'CHI', '意': 'I', '識': 'SHIKI', 'な': 'NA', 'が': 'GA', 'ら': 'RA',
      '速': 'SOKU', 'さ': 'SA', 'よ': 'YO', 'り': 'RI', '正': 'SEI', '確': 'KAKU', '性': 'SEI', '重': 'JUU', '視': 'SHI',
      '徐': 'JO', '々': 'JO', 'ス': 'SU', 'ピ': 'PI', 'ー': 'D', 'ド': 'DO', '上': 'JOU', 'げ': 'GE', 'る': 'RU', 'こ': 'KO', 'と': 'TO'
    };
    
    // マッピングにない文字はそのまま返す（英数字など）
    return romajiMap[char] || char.toUpperCase();
  };


  const updateStats = () => {
    const now = Date.now();
    const elapsedSeconds = sessionStart ? Math.floor((now - sessionStart) / 1000) : 0;
    const elapsedMinutes = sessionStart ? (now - sessionStart) / 60000 : 0;
    const wpm = elapsedMinutes > 0 ? Math.round((correctTyped / 5) / elapsedMinutes) : 0;
    const accuracy = sessionTotalTyped > 0 ? Math.round(((sessionTotalTyped - sessionTotalErrors) / sessionTotalTyped) * 100) : 100;

    elapsedTimeDisplay.textContent = `${elapsedSeconds}秒`;
    totalCharsDisplay.textContent = String(sessionTotalTyped);
    errorCountDisplay.textContent = String(sessionTotalErrors);
    accuracyDisplay.textContent = `${accuracy}%`;
    wpmDisplay.textContent = String(wpm);
  };

  const resetTypingState = () => {
    totalTyped = 0;
    correctTyped = 0;
    errorCount = 0;
    keyErrors = {};
    inputField.value = "";
    currentRomajiErrorSnapshot = 0;
    const quoteSpans = quoteDisplay.querySelectorAll("span");
    const romajiSpans = romajiDisplay.querySelectorAll("span");
    
    quoteSpans.forEach(span => {
      span.className = "";
    });
    romajiSpans.forEach(span => {
      span.className = "";
    });
    
    if (quoteSpans.length) {
      quoteSpans[0].classList.add("current");
    }
    if (romajiSpans.length) {
      romajiSpans[0].classList.add("current");
    }
    feedback.textContent = "";
    weakKeysSection.style.display = "none";
    updateStats();
  };

  const resetSessionStats = () => {
    sessionTotalTyped = 0;
    sessionTotalErrors = 0;
    keyErrors = {};
    currentRomajiErrorSnapshot = 0;
  };

  const showWeakKeys = () => {
    const sortedKeys = Object.entries(keyErrors)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5); // 上位5つの苦手キー

    if (sortedKeys.length > 0) {
      weakKeysList.innerHTML = sortedKeys
        .map(([key, count]) => `<div class="weak-key-item">「${key}」: ${count}回</div>`)
        .join('');
      weakKeysSection.style.display = "block";
    }
  };

  const showAIStatus = () => {
    const statusItems = [
      `AI生成QUOTES: ${AI_QUOTES.generated.length}個`,
      `ミスベースQUOTES: ${AI_QUOTES.mistakeBased.length}個`,
      `現在のインデックス: ${AI_QUOTES.currentIndex}`
    ];

    aiStatusList.innerHTML = statusItems
      .map(item => `<div class="ai-status-item">${item}</div>`)
      .join('');
    aiStatusSection.style.display = "block";
  };

  const loadNewQuote = async (mistakeKeys = []) => {
    try {
      currentQuote = await pickRandomQuote(mistakeKeys);
    } catch (error) {
      console.error('QUOTES読み込みエラー:', error);
      const index = Math.floor(Math.random() * DEFAULT_QUOTES.length);
      const text = DEFAULT_QUOTES[index];
      currentQuote = {
        text,
        romajiTokens: convertTextToRomajiTokens(text)
      };
    }

    renderQuote(currentQuote.text);
    prepareRomajiData(currentQuote.text, currentQuote.romajiTokens);
    renderRomaji();
    resetTypingState();
  };


  const finishSession = () => {
    isRunning = false;
    sessionStart = null;
    inputField.disabled = true;
    startButton.textContent = "スタート";
    feedback.textContent = `完了！ WPM: ${wpmDisplay.textContent} / 正確率: ${accuracyDisplay.textContent}`;
  };

  const handleInput = () => {
    if (!isRunning) {
      return;
    }

    const typedRaw = inputField.value.replace(/\n/g, "");
    const typed = typedRaw.toUpperCase();
    const previousLength = totalTyped;
    totalTyped = typed.length;
    correctTyped = 0;
    errorCount = 0;

    const newChars = totalTyped - previousLength;
    if (newChars > 0) {
      sessionTotalTyped += newChars;
    }

    const romajiSpans = romajiDisplay.querySelectorAll("span");
    const quoteSpans = quoteDisplay.querySelectorAll("span");

    romajiSpans.forEach(span => {
      span.className = "";
    });
    quoteSpans.forEach(span => {
      span.className = "";
    });

    for (let i = 0; i < romajiSpans.length; i++) {
      const expected = currentRomajiTarget[i] || "";
      const entered = typed[i];
      const romajiSpan = romajiSpans[i];
      const mapping = currentRomajiCharMap[i];
      const quoteIndex = mapping ? mapping.index : null;

      if (entered == null) {
        continue;
      }

      if (entered === expected) {
        romajiSpan.classList.add("correct");
        correctTyped += 1;
        if (quoteIndex != null && quoteSpans[quoteIndex]) {
          quoteSpans[quoteIndex].classList.add("correct");
        }
      } else {
        romajiSpan.classList.add("incorrect");
        errorCount += 1;
        if (quoteIndex != null && quoteSpans[quoteIndex]) {
          quoteSpans[quoteIndex].classList.add("incorrect");
          const mistakeKey = quoteSpans[quoteIndex].dataset.char;
          if (mistakeKey) {
            keyErrors[mistakeKey] = (keyErrors[mistakeKey] || 0) + 1;
          }
        }
      }
    }

    if (typed.length > currentRomajiTarget.length) {
      errorCount += typed.length - currentRomajiTarget.length;
    }

    const newMistakes = Math.max(0, errorCount - currentRomajiErrorSnapshot);
    sessionTotalErrors += newMistakes;
    currentRomajiErrorSnapshot = errorCount;

    const currentRomajiIndex = Math.min(typed.length, romajiSpans.length - 1);
    if (romajiSpans[currentRomajiIndex]) {
      romajiSpans[currentRomajiIndex].classList.add("current");
      romajiSpans[currentRomajiIndex].scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    }

    if (quoteSpans.length) {
      const mapped = currentRomajiCharMap[Math.min(typed.length, currentRomajiCharMap.length - 1)];
      const quoteIndex = mapped ? mapped.index : 0;
      if (quoteSpans[quoteIndex]) {
        quoteSpans[quoteIndex].classList.add("current");
        quoteSpans[quoteIndex].scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
      }
    }

    updateStats();

    const targetLength = currentRomajiTarget.length;

    if (typed.length === targetLength && correctTyped === targetLength) {
      feedback.textContent = "よくできました！新しいお題で続けましょう。";
      showWeakKeys();
      showAIStatus();
      setTimeout(async () => {
        if (isRunning) {
          const mistakeKeys = Object.keys(keyErrors).filter(key => keyErrors[key] > 0);
          await loadNewQuote(mistakeKeys);
        }
      }, 900);
    } else if (typed.length >= targetLength) {
      feedback.textContent = "全て入力しました。間違いを修正してみよう。";
      showWeakKeys();
      showAIStatus();
    } else {
      feedback.textContent = "";
    }
  };

  const beginSession = () => {
    sessionStart = Date.now();
    isRunning = true;
    inputField.disabled = false;
    inputField.focus();
    startButton.textContent = "リセット";
    feedback.textContent = "";
    resetSessionStats();
    resetTypingState();
  };

  const resetSession = () => {
    finishSession();
    resetSessionStats();
    loadNewQuote();
    feedback.textContent = "練習をリセットしました。";
  };

  startButton.addEventListener("click", () => {
    if (isRunning) {
      resetSession();
    } else {
      beginSession();
    }
  });

  nextButton.addEventListener("click", () => {
    if (!isRunning) {
      loadNewQuote();
    } else {
      loadNewQuote();
      inputField.focus();
    }
  });

  if (saveApiKeyButton) {
    saveApiKeyButton.addEventListener("click", async () => {
      const key = (apiKeyInput?.value || "").trim();
      if (!key) {
        updateApiKeyStatus("APIキーを入力してください。");
        return;
      }
      setStoredApiKey(key);
      if (apiKeyInput) {
        apiKeyInput.value = key;
      }
      resetAIQuoteCache();
      updateApiKeyStatus("APIキーを保存しました。AI生成文章を利用します。");
      try {
        await loadNewQuote();
      } catch (error) {
        console.error('APIキー保存後の文章取得に失敗しました:', error);
      }
    });
  }

  if (clearApiKeyButton) {
    clearApiKeyButton.addEventListener("click", async () => {
      clearStoredApiKey();
      if (apiKeyInput) {
        apiKeyInput.value = "";
      }
      resetAIQuoteCache();
      updateApiKeyStatus("APIキーを削除しました。デフォルト文章を使用します。");
      try {
        await loadNewQuote();
      } catch (error) {
        console.error('APIキー削除後の文章取得に失敗しました:', error);
      }
    });
  }

  inputField.addEventListener("input", handleInput);

  // AI生成QUOTESを初期化
  const initializeAIQuotes = async () => {
    const apiKey = getStoredApiKey();
    if (!apiKey) {
      resetAIQuoteCache();
      return;
    }

    updateApiKeyStatus("APIキーが設定されています。AI生成文章を利用します。");
  };

  inputField.disabled = true;
  
  // 初期化
  syncApiKeyUI();
  initializeAIQuotes().then(() => {
    loadNewQuote();
    updateStats();
    showAIStatus();
  });
})();
