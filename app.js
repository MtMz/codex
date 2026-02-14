const fallbackPrograms = [
  { time: "06:00", channel: "NHK 総合", title: "おはよう日本", genre: "ニュース" },
  { time: "07:30", channel: "日本テレビ", title: "ZIP!", genre: "情報" },
  { time: "19:00", channel: "日本テレビ", title: "有吉ゼミ", genre: "バラエティ" },
  { time: "21:00", channel: "フジテレビ", title: "月9ドラマ", genre: "ドラマ" }
];

const todayLabel = document.getElementById("today-label");
const dateFilter = document.getElementById("date-filter");
const channelFilter = document.getElementById("channel-filter");
const programBody = document.getElementById("program-body");
const emptyMessage = document.getElementById("empty-message");
const refreshButton = document.getElementById("refresh-button");
const statusMessage = document.getElementById("status-message");

let programs = [];

function formatHumanDate(dateText) {
  const date = new Date(`${dateText}T00:00:00`);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long"
  });
}

function formatApiDate(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function renderChannels() {
  const previousValue = channelFilter.value;
  const channels = [...new Set(programs.map((program) => program.channel))].sort((a, b) => a.localeCompare(b, "ja"));

  channelFilter.innerHTML = '<option value="all">すべて</option>';

  channels.forEach((channel) => {
    const option = document.createElement("option");
    option.value = channel;
    option.textContent = channel;
    channelFilter.appendChild(option);
  });

  channelFilter.value = channels.includes(previousValue) ? previousValue : "all";
}

function renderPrograms() {
  const selectedChannel = channelFilter.value;
  const filteredPrograms =
    selectedChannel === "all"
      ? programs
      : programs.filter((program) => program.channel === selectedChannel);

  programBody.innerHTML = "";

  filteredPrograms.forEach((program) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${program.time || "--:--"}</td>
      <td>${program.channel}</td>
      <td>${program.title}</td>
      <td>${program.genre}</td>
    `;
    programBody.appendChild(row);
  });

  emptyMessage.hidden = filteredPrograms.length > 0;
}

async function fetchProgramsByDate(dateText) {
  const response = await fetch(`https://api.tvmaze.com/schedule?country=JP&date=${dateText}`);
  if (!response.ok) {
    throw new Error("番組情報の取得に失敗しました。");
  }

  const schedule = await response.json();
  return schedule
    .map((item) => ({
      time: item.airtime || "--:--",
      channel: item.show?.network?.name || item.show?.webChannel?.name || "配信",
      title: item.show?.name || "番組名不明",
      genre: item.show?.genres?.length ? item.show.genres.join(" / ") : "未分類"
    }))
    .sort((a, b) => a.time.localeCompare(b.time));
}

async function reloadPrograms() {
  const targetDate = dateFilter.value || formatApiDate();
  todayLabel.textContent = `${formatHumanDate(targetDate)} の番組`;
  statusMessage.textContent = "番組データを取得中...";

  try {
    const fetchedPrograms = await fetchProgramsByDate(targetDate);
    programs = fetchedPrograms.length > 0 ? fetchedPrograms : fallbackPrograms;

    renderChannels();
    renderPrograms();

    if (fetchedPrograms.length === 0) {
      statusMessage.textContent = "該当日の番組が取得できなかったため、サンプル番組を表示しています。";
      return;
    }

    statusMessage.textContent = `${programs.length}件の番組を表示中（取得元: TVmaze）`;
  } catch (error) {
    programs = fallbackPrograms;
    renderChannels();
    renderPrograms();
    statusMessage.textContent = "番組データ取得に失敗したため、サンプル番組を表示しています。";
  }
}

function initialize() {
  dateFilter.value = formatApiDate();
  reloadPrograms();
}

channelFilter.addEventListener("change", renderPrograms);
dateFilter.addEventListener("change", reloadPrograms);
refreshButton.addEventListener("click", reloadPrograms);

initialize();
