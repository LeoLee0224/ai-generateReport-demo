// DOM 元素
const apiKeyInput = document.getElementById("apiKeyInput");
const imageDescInput = document.getElementById("imageDescription");
const systemPromptInput = document.getElementById("systemPrompt");
const updatePromptBtn = document.getElementById("updatePromptBtn");
const chatHistory = document.getElementById("chatHistory");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const loading = document.getElementById("loading");
const studentTranscript1 = document.getElementById("studentTranscript1");
const studentTranscript2 = document.getElementById("studentTranscript2");
const studentTranscript3 = document.getElementById("studentTranscript3");
const updateTranscriptBtn1 = document.getElementById("updateTranscriptBtn1");
const updateTranscriptBtn2 = document.getElementById("updateTranscriptBtn2");
const updateTranscriptBtn3 = document.getElementById("updateTranscriptBtn3");
const gradingCriteriaInput = document.getElementById("gradingCriteria");
const updateGradingBtn = document.getElementById("updateGradingBtn");
const downloadBtn = document.getElementById("downloadBtn");
const generateOverallBtn = document.getElementById("generateOverallBtn");
const downloadOverallBtn = document.getElementById("downloadOverallBtn");
const overallSystemPromptInput = document.getElementById("overallSystemPrompt");
const updateOverallPromptBtn = document.getElementById(
  "updateOverallPromptBtn"
);

let subjectName = "普通話";
let primaryLevel = "六年級";
let timeLimitMins = "1";
// 儲存聊天歷史
let chatMessages = [];
let currentReport = ""; // 儲存當前報告內容
let currentOverallReport = ""; // 儲存當前整體報告內容

// 設定預設的圖片描述
const defaultImageDescription = `陽光燦爛的午后，小學生們在操場上玩耍，嬉笑聲起伏不止。一個調皮的男孩發現了藏在樹後的小貓咪，驚喜地叫道：「快看！有小貓！」同伴們立刻圍了過來，個個驚訝不已。一位女孩輕聲問：「它會不會怕我們呢？」小男孩小心翼翼地伸出手，燦爛地說：「別擔心，我們只是想和你做朋友！」`;
let currentImageDescription = defaultImageDescription; // 使用預設的圖片描述
// 設定預設的學生語音轉錄文本
let studentLastAudioTranscript = `我在上学的时候是体育课然后我们在学校外面的草地去跑步然后跑着跑着我发现大树那边好像有一些猫猫叫的声音我就很好奇的去那个猫猫是在那边的大树發現有一隻小貓躲在大樹的旁邊牠就好可愛好美麗然後我把貓帶出來然後其他同學也一直圍著那個貓他們都想摸那個貓最後那個貓就跑開了`;

// 設定預設的評分標準
let gradingCriteria = `總分100分：內容豐富50%、連貫，先後次序，條理清晰25%、用詞恰當25%`;

// 設定預設的 system prompt
let systemPrompt = `你現在是一位專業的${subjectName}老師，負責為${primaryLevel}的學生進行${subjectName}的${timeLimitMins}分鐘口語練習表現進行評分和提供建議。

你的工作是：
1. 比較「標準答案」和「學生回答」的內容：
   - 標準答案：{imageDescription}
   - 學生回答：${studentLastAudioTranscript}

2. 根據以下評分標準進行評分：
   ${gradingCriteria}

3. 生成${subjectName}口語練習報告，報告需要包含：
   - 總分
   - 各項評分標準的得分和評語
   - 優點分析
   - 需要改進的地方
   - 具體的改進建議和示例

評分注意事項：
1. 公平客觀地評估學生的表現
2. 給予具體的評語和建議
3. 使用鼓勵性的語氣
4. 建議要具體且可執行
5. 重點指出學生的：
   - 內容完整度
   - 語言組織能力
   - 用詞準確性
   - 表達流暢度

請以正式報告的格式輸出${subjectName}口語練習報告。`;

// 設定整體評估的 system prompt
let overallSystemPrompt = `你現在是一位專業的${subjectName}老師，負責為一組${primaryLevel}的學生進行${subjectName}的${timeLimitMins}分鐘口語練習的整體表現評估。

你的工作是：
1. 比較「標準答案」和「所有學生的回答」：
   - 標準答案：${defaultImageDescription}
   - 學生1回答：${studentTranscript1.value}
   - 學生2回答：${studentTranscript2.value}
   - 學生3回答：${studentTranscript3.value}

2. 根據以下評分標準進行評分：
   ${gradingCriteria}

3. 生成整體評估報告，報告需要包含：
   - 整體表現概述
   - 各個學生的表現比較
   - 共同的優點
   - 共同需要改進的地方
   - 個別學生的特點和建議
   - 教學建議

評估注意事項：
1. 公平客觀地評估每位學生的表現
2. 找出學生之間的差異和共同點
3. 分析可能的原因
4. 提供具體的改進建議
5. 重點關注：
   - 內容完整度的差異
   - 語言組織能力的差異
   - 用詞準確性的差異
   - 表達流暢度的差異
   - 個人風格的特點

請以正式報告的格式輸出整體評估報告。`;

// 更新聊天記錄顯示
function updateChatHistory() {
  chatHistory.innerHTML = chatMessages
    .map(
      (msg) => `
        <div class="mb-4 ${msg.role === "user" ? "text-right" : ""}">
            <div class="inline-block max-w-[80%] ${
              msg.role === "user" ? "bg-blue-100" : "bg-white"
            } rounded-lg px-4 py-2 shadow">
                <div class="font-bold ${
                  msg.role === "user" ? "text-blue-700" : "text-gray-700"
                } mb-1">
                    ${msg.role === "user" ? "您" : "AI"}
                </div>
                <div class="text-gray-700 whitespace-pre-wrap">${
                  msg.content
                }</div>
            </div>
        </div>
    `
    )
    .join("");
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

// 更新 System Prompt
function updateSystemPrompt() {
  const imageDesc = imageDescInput.value.trim() || defaultImageDescription;
  if (imageDesc !== currentImageDescription) {
    currentImageDescription = imageDesc;
    // 將圖片描述插入到 system prompt 中
    console.log("currentImageDescription", currentImageDescription);
    const updatedPrompt = systemPrompt.replace(
      "{imageDescription}",
      currentImageDescription
    );
    chatMessages = []; // 清空聊天記錄
    chatHistory.innerHTML =
      '<div class="text-gray-500 text-center mt-4">點擊下方「生成報告」按鈕開始生成評估報告</div>';
    console.log("updatedPrompt", updatedPrompt);
    return updatedPrompt;
  }
  return systemPrompt.replace("{imageDescription}", currentImageDescription);
}

// 發送API請求
async function sendChatRequest(messages, apiKey) {
  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: messages,
      temperature: 0.7,
      max_tokens: 2000,
      stream: false,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "請求失敗");
  }

  return response.json();
}

// 生成報告
async function generateReport() {
  const apiKey = apiKeyInput.value.trim();

  if (!apiKey) {
    alert("請輸入 API Key");
    return;
  }

  if (!currentImageDescription) {
    alert("請先輸入圖片描述");
    return;
  }

  try {
    loading.classList.remove("hidden");
    sendBtn.disabled = true;
    downloadBtn.classList.add("hidden");

    // 準備訊息
    const messages = [
      {
        role: "system",
        content: updateSystemPrompt(),
      },
      {
        role: "user",
        content: "請生成評估報告",
      },
    ];

    // 發送請求
    const completion = await sendChatRequest(messages, apiKey);

    // 顯示報告
    currentReport = completion.choices[0].message.content;
    chatHistory.innerHTML = `<div class="whitespace-pre-wrap">${currentReport}</div>`;

    // 顯示下載按鈕
    downloadBtn.classList.remove("hidden");
  } catch (error) {
    console.error("錯誤：", error);
    alert("生成報告時發生錯誤：" + error.message);
  } finally {
    loading.classList.add("hidden");
    sendBtn.disabled = false;
  }
}

// 生成 Word 文件
function generateWordDocument() {
  // 創建報告 HTML
  const reportHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>${subjectName}口語練習報告</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>90</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          @font-face {
            font-family: "Microsoft JhengHei";
          }
          body {
            font-family: "Microsoft JhengHei", sans-serif;
            font-size: 12pt;
            line-height: 1.5;
          }
          .title {
            font-size: 24pt;
            font-weight: bold;
            text-align: center;
            margin-bottom: 20pt;
          }
          .info {
            font-size: 12pt;
            margin-bottom: 10pt;
          }
          .content {
            font-size: 12pt;
            line-height: 1.5;
            white-space: pre-wrap;
          }
        </style>
      </head>
      <body>
        <div class="title">${subjectName}口語練習報告</div>
        <div class="info">年級：${primaryLevel}</div>
        <div class="info">評估時間：${new Date().toLocaleDateString(
          "zh-TW"
        )}</div>
        <div class="content">${currentReport}</div>
      </body>
    </html>
  `;

  // 創建 Blob
  const blob = new Blob([reportHtml], { type: "application/msword" });

  // 創建下載連結
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${subjectName}口語練習報告_${primaryLevel}_${new Date().toLocaleDateString(
    "zh-TW"
  )}.doc`;

  // 觸發下載
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

// 下載按鈕點擊處理
downloadBtn.addEventListener("click", generateWordDocument);

// 發送按鈕點擊處理
sendBtn.addEventListener("click", generateReport);

// 更新圖片描述按鈕點擊處理
updatePromptBtn.addEventListener("click", () => {
  const newPrompt = updateSystemPrompt();
  if (newPrompt !== systemPrompt) {
    alert("圖片描述已更新");
  }
});

// 更新整體系統提示詞顯示
function updateOverallSystemPromptDisplay() {
  if (overallSystemPromptInput) {
    // 更新 system prompt 中的學生回答
    const updatedPrompt = overallSystemPrompt
      .replace(/學生1回答：.*/, `學生1回答：${studentTranscript1.value}`)
      .replace(/學生2回答：.*/, `學生2回答：${studentTranscript2.value}`)
      .replace(/學生3回答：.*/, `學生3回答：${studentTranscript3.value}`);

    overallSystemPromptInput.value = updatedPrompt;
  }
}

// 更新按鈕點擊處理
updateOverallPromptBtn.addEventListener("click", () => {
  updateOverallSystemPromptDisplay();
  alert("整體評估提示詞已更新");
});

// 初始化頁面
document.addEventListener("DOMContentLoaded", () => {
  if (systemPromptInput) {
    systemPromptInput.value = systemPrompt;
  }
  if (imageDescInput) {
    imageDescInput.value = defaultImageDescription;
  }
  if (apiKeyInput) {
    apiKeyInput.focus();
  }
  if (studentTranscript1) {
    studentTranscript1.value = studentLastAudioTranscript;
  }
  if (gradingCriteriaInput) {
    gradingCriteriaInput.value = gradingCriteria;
  }
  // 初始化整體系統提示詞
  updateOverallSystemPromptDisplay();
  // 初始化時更新一次 system prompt
  updateSystemPrompt();
});

// 更新學生語音轉錄文本
updateTranscriptBtn1.addEventListener("click", () => {
  updateOverallSystemPromptDisplay();
  alert("學生1語音轉錄文本已更新");
});

updateTranscriptBtn2.addEventListener("click", () => {
  updateOverallSystemPromptDisplay();
  alert("學生2語音轉錄文本已更新");
});

updateTranscriptBtn3.addEventListener("click", () => {
  updateOverallSystemPromptDisplay();
  alert("學生3語音轉錄文本已更新");
});

// 更新評分標準
updateGradingBtn.addEventListener("click", () => {
  gradingCriteria = gradingCriteriaInput.value.trim();
  alert("評分標準已更新");
});

// 生成整體報告
async function generateOverallReport() {
  const apiKey = apiKeyInput.value.trim();

  if (!apiKey) {
    alert("請輸入 API Key");
    return;
  }

  try {
    loading.classList.remove("hidden");
    generateOverallBtn.disabled = true;
    downloadOverallBtn.classList.add("hidden");

    // 準備訊息
    const messages = [
      {
        role: "system",
        content: overallSystemPrompt,
      },
      {
        role: "user",
        content: "請生成整體評估報告",
      },
    ];

    // 發送請求
    const completion = await sendChatRequest(messages, apiKey);

    // 顯示報告
    currentOverallReport = completion.choices[0].message.content;
    chatHistory.innerHTML = `<div class="whitespace-pre-wrap">${currentOverallReport}</div>`;

    // 顯示下載按鈕
    downloadOverallBtn.classList.remove("hidden");
  } catch (error) {
    console.error("錯誤：", error);
    alert("生成整體報告時發生錯誤：" + error.message);
  } finally {
    loading.classList.add("hidden");
    generateOverallBtn.disabled = false;
  }
}

// 生成整體報告的 Word 文件
function generateOverallWordDocument() {
  // 創建報告 HTML
  const reportHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>${subjectName}口語練習整體評估報告</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>90</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          @font-face {
            font-family: "Microsoft JhengHei";
          }
          body {
            font-family: "Microsoft JhengHei", sans-serif;
            font-size: 12pt;
            line-height: 1.5;
          }
          .title {
            font-size: 24pt;
            font-weight: bold;
            text-align: center;
            margin-bottom: 20pt;
          }
          .info {
            font-size: 12pt;
            margin-bottom: 10pt;
          }
          .content {
            font-size: 12pt;
            line-height: 1.5;
            white-space: pre-wrap;
          }
        </style>
      </head>
      <body>
        <div class="title">${subjectName}口語練習整體評估報告</div>
        <div class="info">年級：${primaryLevel}</div>
        <div class="info">評估時間：${new Date().toLocaleDateString(
          "zh-TW"
        )}</div>
        <div class="content">${currentOverallReport}</div>
      </body>
    </html>
  `;

  // 創建 Blob
  const blob = new Blob([reportHtml], { type: "application/msword" });

  // 創建下載連結
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${subjectName}口語練習整體評估報告_${primaryLevel}_${new Date().toLocaleDateString(
    "zh-TW"
  )}.doc`;

  // 觸發下載
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

// 生成整體報告按鈕點擊處理
generateOverallBtn.addEventListener("click", generateOverallReport);

// 下載整體報告按鈕點擊處理
downloadOverallBtn.addEventListener("click", generateOverallWordDocument);
