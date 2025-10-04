(() => {
  // AI生成QUOTESの管理
  const AI_QUOTES = {
    generated: [],
    mistakeBased: [],
    currentIndex: 0
  };

    const ROMAJI_MAP = {
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
    'わ': 'WA', 'を': 'WO', 'ん': 'N', 'ゔ': 'VU',
    'っ': 'LTU', 'ー': '-', '、': ',', '。': '.', '　': ' ', ' ': ' ',
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
    'ワ': 'WA', 'ヲ': 'WO', 'ン': 'N', 'ヴ': 'VU',
    'ッ': 'LTU',
    '学': 'GAKU', '習': 'SHUU', '練': 'REN', '正': 'SEI', '確': 'KAKU', '速': 'SOKU', '度': 'DO',
    '時': 'JI', '間': 'KAN', '分': 'BUN', '秒': 'BYOU',
    '文': 'BUN', '字': 'JI', '入': 'NYUU', '力': 'RYOKU',
    '上': 'JOU', '手': 'TE', '達': 'TATSU', '成': 'SEI', '長': 'CHOU',
    '重': 'JUU', '要': 'YOU', '技': 'GI', '術': 'JUTSU',
    '現': 'GEN', '代': 'DAI', '社': 'SHA', '会': 'KAI',
    '効': 'KOU', '率': 'RITSU', '向': 'KOU',
    '継': 'KEI', '続': 'ZOKU', '果': 'KA',
    '小': 'SHOU', '一': 'ICHI', '歩': 'HO', '大': 'DAI', '変': 'HEN', '化': 'KA',
    '集': 'SHUU', '中': 'CHUU', '作': 'SAKU', '業': 'GYOU',
    '深': 'SHIN', '呼': 'KO', '吸': 'KYUU',
    '指': 'SHI', '自': 'JI', '然': 'ZEN', '動': 'DOU', '思': 'SHI', '考': 'KOU',
    '体': 'TAI', '状': 'JOU', '態': 'TAI',
    '座': 'ZA', '首': 'SHU', '位': 'I', '置': 'CHI', '意': 'I', '識': 'SHIKI',
    '徐': 'JO', '々': 'JO',
    '恐': 'KYOU', '挑': 'CHOU', '戦': 'SEN',
    '第': 'DAI', '失': 'SHITSU', '敗': 'HAI',
    '能': 'NOU', '仕': 'SHI', '事': 'JI', '幅': 'HABA'
  };

  const SOKUON_CHARS = new Set(['っ', 'ッ']);
  const LONG_VOWEL_MARK = 'ー';
  const SMALL_VOWEL_MAP = {
    'ぁ': 'a', 'ぃ': 'i', 'ぅ': 'u', 'ぇ': 'e', 'ぉ': 'o',
    'ァ': 'a', 'ィ': 'i', 'ゥ': 'u', 'ェ': 'e', 'ォ': 'o'
  };
  const SMALL_Y_CHARS = new Set(['ゃ', 'ゅ', 'ょ', 'ャ', 'ュ', 'ョ']);
  const SMALL_VOWEL_CHARS = new Set(Object.keys(SMALL_VOWEL_MAP));
  const KANA_DIGRAPHS = {
    'きゃ': 'kya', 'きゅ': 'kyu', 'きょ': 'kyo',
    'ぎゃ': 'gya', 'ぎゅ': 'gyu', 'ぎょ': 'gyo',
    'しゃ': 'sha', 'しゅ': 'shu', 'しょ': 'sho',
    'じゃ': 'ja', 'じゅ': 'ju', 'じょ': 'jo',
    'ちゃ': 'cha', 'ちゅ': 'chu', 'ちょ': 'cho',
    'ぢゃ': 'ja', 'ぢゅ': 'ju', 'ぢょ': 'jo',
    'にゃ': 'nya', 'にゅ': 'nyu', 'にょ': 'nyo',
    'ひゃ': 'hya', 'ひゅ': 'hyu', 'ひょ': 'hyo',
    'びゃ': 'bya', 'びゅ': 'byu', 'びょ': 'byo',
    'ぴゃ': 'pya', 'ぴゅ': 'pyu', 'ぴょ': 'pyo',
    'みゃ': 'mya', 'みゅ': 'myu', 'みょ': 'myo',
    'りゃ': 'rya', 'りゅ': 'ryu', 'りょ': 'ryo',
    'ゔぁ': 'va', 'ゔぃ': 'vi', 'ゔぇ': 've', 'ゔぉ': 'vo', 'ゔゅ': 'vyu',
    'ふぁ': 'fa', 'ふぃ': 'fi', 'ふぇ': 'fe', 'ふぉ': 'fo', 'ふゅ': 'fyu',
    'キャ': 'kya', 'キュ': 'kyu', 'キョ': 'kyo',
    'ギャ': 'gya', 'ギュ': 'gyu', 'ギョ': 'gyo',
    'シャ': 'sha', 'シュ': 'shu', 'ショ': 'sho',
    'ジャ': 'ja', 'ジュ': 'ju', 'ジョ': 'jo',
    'チャ': 'cha', 'チュ': 'chu', 'チョ': 'cho',
    'ヂャ': 'ja', 'ヂュ': 'ju', 'ヂョ': 'jo',
    'ニャ': 'nya', 'ニュ': 'nyu', 'ニョ': 'nyo',
    'ヒャ': 'hya', 'ヒュ': 'hyu', 'ヒョ': 'hyo',
    'ビャ': 'bya', 'ビュ': 'byu', 'ビョ': 'byo',
    'ピャ': 'pya', 'ピュ': 'pyu', 'ピョ': 'pyo',
    'ミャ': 'mya', 'ミュ': 'myu', 'ミョ': 'myo',
    'リャ': 'rya', 'リュ': 'ryu', 'リョ': 'ryo',
    'ヴァ': 'va', 'ヴィ': 'vi', 'ヴェ': 've', 'ヴォ': 'vo', 'ヴュ': 'vyu',
    'ファ': 'fa', 'フィ': 'fi', 'フェ': 'fe', 'フォ': 'fo', 'フュ': 'fyu'
  };

  const SINGLE_KANA_ROMAJI = (() => {
    const table = {};
    const kanaPattern = /[\u3040-\u30ff]/;
    Object.entries(ROMAJI_MAP).forEach(([key, value]) => {
      if (!kanaPattern.test(key) || key.length !== 1) {
        return;
      }
      const romaji = Array.isArray(value) ? value[0] : value;
      if (typeof romaji === 'string') {
        table[key] = romaji.toLowerCase();
      }
    });
    return table;
  })();

  const kanaTokenToRomaji = (token = "") => {
    const chars = [...token];
    let result = "";

    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      const next = chars[i + 1];
      const pair = char + (next || "");

      if (KANA_DIGRAPHS[pair]) {
        result += KANA_DIGRAPHS[pair];
        i += 1;
        continue;
      }

      if (SOKUON_CHARS.has(char)) {
        const following = chars[i + 1];
        if (following) {
          const followingPair = following + (chars[i + 2] || "");
          const nextRomaji = KANA_DIGRAPHS[followingPair] || SINGLE_KANA_ROMAJI[following] || "";
          if (nextRomaji) {
            result += nextRomaji.charAt(0);
          }
        }
        continue;
      }

      if (char === LONG_VOWEL_MARK) {
        const last = result[result.length - 1];
        if (last) {
          result += last;
        }
        continue;
      }

      if (SMALL_VOWEL_MAP[char]) {
        result += SMALL_VOWEL_MAP[char];
        continue;
      }

      const romaji = SINGLE_KANA_ROMAJI[char];
      if (romaji) {
        result += romaji;
      } else {
        result += char;
      }
    }

    return result;
  };

  const convertTextToRomajiTokens = (text) => {
    return [...text].map(char => {
      const romaji = getRomajiForChar(char);
      return typeof romaji === "string" ? romaji.toLowerCase() : String(romaji || "");
    });
  };

  const deriveRomajiFromReadingTokens = (readingTokens) => {
    if (!Array.isArray(readingTokens)) {
      return null;
    }
    const result = [];
    let overrideForNext = null;

    for (let i = 0; i < readingTokens.length; i++) {
      if (overrideForNext != null) {
        result.push(overrideForNext);
        overrideForNext = null;
        continue;
      }

      const token = readingTokens[i] || "";
      const nextToken = readingTokens[i + 1] || "";
      const nextFirstChar = nextToken ? nextToken[0] : "";

      if (token === LONG_VOWEL_MARK) {
        const previous = result[result.length - 1] || "";
        const lastChar = previous ? previous.slice(-1) : "";
        result.push(lastChar);
        continue;
      }

      if (token && SOKUON_CHARS.has(token[0])) {
        const nextRomaji = kanaTokenToRomaji(nextToken || "");
        const consonant = nextRomaji ? nextRomaji[0] : "";
        result.push(consonant);
        continue;
      }

      if (nextToken && (SMALL_Y_CHARS.has(nextFirstChar) || SMALL_VOWEL_CHARS.has(nextFirstChar))) {
        const combinedRomaji = kanaTokenToRomaji((token || "") + nextToken) || "";
        if (combinedRomaji.length > 1) {
          const base = combinedRomaji.slice(0, -1);
          const tail = combinedRomaji.slice(-1);
          result.push(base);
          overrideForNext = tail;
          continue;
        }
      }

      result.push(kanaTokenToRomaji(token || ""));
    }

    if (overrideForNext != null) {
      result.push(overrideForNext);
    }

    return result;
  };

  const createDefaultQuote = (text) => {
    const readingTokens = [...text];
    const romajiTokens = deriveRomajiFromReadingTokens(readingTokens) || convertTextToRomajiTokens(text);
    return {
      text,
      reading: text,
      readingTokens,
      romajiTokens
    };
  };

  const DEFAULT_QUOTES = [
    createDefaultQuote("きょうはてんきがよくてさんぽがたのしいです。"),
    createDefaultQuote("はやねはやおきをこころがけてげんきにすごそう。"),
    createDefaultQuote("まいにちすこしずつれんしゅうするとじょうたつがはやい。"),
    createDefaultQuote("しっぱいをおそれずにチャレンジすることがたいせつです。"),
    createDefaultQuote("ゆっくりふかくこきをしてリラックスしよう。"),
    createDefaultQuote("なれないきーはなんどもくりかえしてたしかめよう。"),
    createDefaultQuote("りょうてのゆびをつかってばらんすよくたいぷしよう。"),
    createDefaultQuote("こまかいうごきをいしきしてちいさくはやくうごかそう。"),
    createDefaultQuote("すきなうたのことばをたいぷしてたのしくれんしゅうしよう。"),
    createDefaultQuote("おわったらせなかをのばしてすとれっちをしよう。")
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
  let currentQuote = { text: "", romajiTokens: [], reading: "", readingTokens: null };
  let sessionStart = null;
  let totalTyped = 0;
  let correctTyped = 0;
  let keyErrors = {}; // 苦手キー分析用
  let sessionTotalTyped = 0; // セッション累積入力文字数
  let sessionTotalErrors = 0; // セッション累積ミス文字数
  let currentRomajiTarget = ""; // ローマ字入力比較用
  let currentRomajiCharMap = []; // ローマ字インデックスから日本語文字へのマッピング
  let currentRomajiTokens = []; // 文字単位のローマ字配列
  let currentRomajiCharBoundaries = [];
  let currentRomajiIndex = 0;
  let currentMistakeIndices = new Set();

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
    currentRomajiCharBoundaries = new Array(textChars.length);

    const romajiChars = [];
    const charMap = [];

    textChars.forEach((char, index) => {
      const token = tokens[index] ?? "";
      const normalizedDisplay = String(token);
      const letters = [...normalizedDisplay];
      const start = romajiChars.length;

      if (letters.length === 0) {
        letters.push(" ");
      }

      letters.forEach(letter => {
        const displayLetter = letter;
        const targetLetter = letter.toUpperCase();
        romajiChars.push(targetLetter);
        charMap.push({ display: displayLetter, target: targetLetter, char, index });
      });

      const end = romajiChars.length - 1;
      currentRomajiCharBoundaries[index] = { start, end };
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

    const userPrompt = `${baseInstruction}\n${keyInstruction ? `${keyInstruction}\n` : ""}制約:\n- 60文字以内の自然な日本語文\n- タイピング学習に有用な内容\n- JSONにはtext, romaji, romaji_tokens, reading, reading_tokensを含めること\n- romaji_tokensは各文字に対応するヘボン式ローマ字を小文字で返すこと\n- readingは文章全体のふりがな（ひらがな）\n- reading_tokensは各文字に対応するふりがな（ひらがな）`;

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
            content: "You create Japanese typing practice sentences. Respond only as JSON with keys 'text', 'romaji', 'romaji_tokens', 'reading', and 'reading_tokens'. 'romaji_tokens' must be an array whose length exactly matches the number of characters in 'text' (counting characters with Array.from). Each element must contain the lowercase Hepburn romaji for that single character. 'reading' is the full sentence rendered in hiragana, and 'reading_tokens' must be an array of hiragana strings whose length equals the number of characters in 'text', each representing the furigana for that character. Preserve spaces and punctuation by returning the same symbol for them. Do not merge multiple characters into one item."
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
    let romajiTokens = Array.isArray(payload.romaji_tokens)
      ? payload.romaji_tokens.map(token => typeof token === "string" ? token : String(token ?? ""))
      : Array.isArray(payload.romajiTokens)
        ? payload.romajiTokens.map(token => typeof token === "string" ? token : String(token ?? ""))
        : null;
    const reading = typeof payload.reading === "string" ? payload.reading.trim() : "";
    let readingTokens = Array.isArray(payload.reading_tokens)
      ? payload.reading_tokens.map(token => typeof token === "string" ? token : String(token ?? ""))
      : Array.isArray(payload.readingTokens)
        ? payload.readingTokens.map(token => typeof token === "string" ? token : String(token ?? ""))
        : null;

    if (!text) {
      throw new Error("AI did not return a text value");
    }

    const textLength = [...text].length;
    if (readingTokens && readingTokens.length !== textLength) {
      readingTokens = null;
    }

    const derivedRomajiFromReading = readingTokens ? deriveRomajiFromReadingTokens(readingTokens) : null;

    if (derivedRomajiFromReading && derivedRomajiFromReading.length === textLength) {
      if (!romajiTokens || romajiTokens.length !== textLength) {
        romajiTokens = derivedRomajiFromReading;
      } else {
        const hasMismatch = romajiTokens.some((token, index) => {
          const aiToken = String(token || "").toLowerCase();
          const derivedToken = String(derivedRomajiFromReading[index] || "").toLowerCase();
          return aiToken !== derivedToken;
        });
        if (hasMismatch) {
          romajiTokens = derivedRomajiFromReading;
        }
      }
    }

    if (!romajiTokens || romajiTokens.length !== textLength) {
      romajiTokens = convertTextToRomajiTokens(text);
    }

    romajiTokens = romajiTokens.map(token => String(token || "").toLowerCase());

    const romajiRegex = /^[a-z0-9.,!?'":\-]*$/;
    const tokensAreValid = romajiTokens.length === textLength && romajiTokens.every(token => romajiRegex.test(token));
    if (!tokensAreValid) {
      throw new Error("Generated romaji tokens are invalid");
    }

    return {
      text,
      romaji: romaji,
      romajiTokens,
      reading,
      readingTokens
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
      const index = Math.floor(Math.random() * DEFAULT_QUOTES.length);
      return DEFAULT_QUOTES[index];
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

  // 文字に対応するローマ字を取得（候補がある場合は先頭を返す）
  const getRomajiForChar = (char) => {
    const value = ROMAJI_MAP[char];
    if (Array.isArray(value)) {
      return value[0];
    }
    if (typeof value === "string") {
      return value;
    }
    return char.toUpperCase();
  };
 
  const updateStats = () => {
    const now = Date.now();
    const elapsedSeconds = sessionStart ? Math.floor((now - sessionStart) / 1000) : 0;
    const elapsedMinutes = sessionStart ? (now - sessionStart) / 60000 : 0;
    const wpm = elapsedMinutes > 0 ? Math.round((correctTyped / 5) / elapsedMinutes) : 0;
    let accuracy = 100;
    if (sessionTotalTyped > 0) {
      const ratio = (sessionTotalTyped - sessionTotalErrors) / sessionTotalTyped;
      accuracy = Math.max(0, Math.round(ratio * 100));
    }

    elapsedTimeDisplay.textContent = `${elapsedSeconds}秒`;
    totalCharsDisplay.textContent = String(sessionTotalTyped);
    errorCountDisplay.textContent = String(sessionTotalErrors);
    accuracyDisplay.textContent = `${accuracy}%`;
    wpmDisplay.textContent = String(wpm);
  };

  const resetTypingState = () => {
    totalTyped = 0;
    correctTyped = 0;
    inputField.value = "";
    currentRomajiIndex = 0;
    currentMistakeIndices = new Set();
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
    updateStats();
  };

  const resetSessionStats = () => {
    sessionTotalTyped = 0;
    sessionTotalErrors = 0;
    keyErrors = {};
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
      // エラー時はAPIキー設定を促すメッセージを表示
      const errorMessage = "APIキーを設定してAI生成文章を利用してください。";
      currentQuote = {
        text: errorMessage,
        romajiTokens: convertTextToRomajiTokens(errorMessage),
        reading: "",
        readingTokens: null
      };
      updateApiKeyStatus("APIキーを設定してください。");
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
  };

  const handleInput = () => {
    if (!isRunning) {
      return;
    }

    const allowPattern = /[^0-9a-zA-Z .,!?';:\"\-]/g;
    const rawValue = inputField.value.replace(/\n/g, "");
    const sanitizedValue = rawValue.replace(allowPattern, "");

    if (sanitizedValue !== rawValue) {
      inputField.value = sanitizedValue;
    }

    const lowerCaseValue = sanitizedValue.toLowerCase();
    let typedUpper = lowerCaseValue.toUpperCase();
    const targetLength = currentRomajiTarget.length;

    if (typedUpper.length > targetLength) {
      typedUpper = typedUpper.slice(0, targetLength);
      inputField.value = sanitizedValue.slice(0, targetLength);
    }

    const romajiSpans = romajiDisplay.querySelectorAll("span");
    const quoteSpans = quoteDisplay.querySelectorAll("span");

    romajiSpans.forEach(span => {
      span.className = "";
    });
    quoteSpans.forEach(span => {
      span.className = "";
    });

    let mismatchIndex = -1;
    for (let i = 0; i < typedUpper.length; i++) {
      if (typedUpper[i] !== (currentRomajiTarget[i] || "")) {
        mismatchIndex = i;
        break;
      }
    }

    if (mismatchIndex >= 0) {
      const truncatedLower = lowerCaseValue.slice(0, mismatchIndex);
      if (inputField.value !== truncatedLower) {
        inputField.value = truncatedLower;
      }

      const mapping = currentRomajiCharMap[mismatchIndex];
      if (mapping && !currentMistakeIndices.has(mapping.index)) {
        currentMistakeIndices.add(mapping.index);
        const mistakeKey = mapping.char;
        if (mistakeKey) {
          keyErrors[mistakeKey] = (keyErrors[mistakeKey] || 0) + 1;
        }
        sessionTotalErrors += 1;
      }

      currentRomajiIndex = mismatchIndex;
      totalTyped = currentRomajiIndex;
      correctTyped = currentRomajiIndex;

      if (romajiSpans[mismatchIndex]) {
        romajiSpans[mismatchIndex].classList.add("incorrect", "current");
        romajiSpans[mismatchIndex].scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
      }
      if (mapping) {
        const quoteSpan = quoteSpans[mapping.index];
        if (quoteSpan) {
          quoteSpan.classList.add("incorrect", "current");
          quoteSpan.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
        }
      }

      updateStats();
      return;
    }

    const previousLength = totalTyped;
    const newLength = typedUpper.length;
    totalTyped = newLength;
    correctTyped = newLength;
    currentRomajiIndex = newLength;

    if (newLength > previousLength) {
      sessionTotalTyped += newLength - previousLength;
    }

    for (let i = 0; i < currentRomajiIndex; i++) {
      const mapping = currentRomajiCharMap[i];
      if (romajiSpans[i]) {
        romajiSpans[i].classList.add("correct");
      }
      if (mapping) {
        const boundary = currentRomajiCharBoundaries[mapping.index];
        if (boundary && boundary.end < currentRomajiIndex) {
          const span = quoteSpans[mapping.index];
          if (span) {
            span.classList.add("correct");
          }
        }
      }
    }

    const highlightIndex = Math.min(currentRomajiIndex, Math.max(0, currentRomajiTarget.length - 1));
    const highlightMapping = currentRomajiCharMap[highlightIndex];
    if (romajiSpans[highlightIndex]) {
      romajiSpans[highlightIndex].classList.add("current");
      romajiSpans[highlightIndex].scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    }
    if (highlightMapping) {
      const quoteSpan = quoteSpans[highlightMapping.index];
      if (quoteSpan) {
        quoteSpan.classList.add("current");
        quoteSpan.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
      }
    }

    updateStats();

    if (currentRomajiIndex === targetLength && targetLength > 0) {
      showWeakKeys();
      showAIStatus();
      setTimeout(async () => {
        if (isRunning) {
          const mistakeKeys = Object.keys(keyErrors).filter(key => keyErrors[key] > 0);
          await loadNewQuote(mistakeKeys);
        }
      }, 900);
    }
  };

  const beginSession = () => {
    sessionStart = Date.now();
    isRunning = true;
    inputField.disabled = false;
    inputField.focus();
    startButton.textContent = "リセット";
    resetSessionStats();
    resetTypingState();
  };

  const resetSession = () => {
    finishSession();
    resetSessionStats();
    loadNewQuote();
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
