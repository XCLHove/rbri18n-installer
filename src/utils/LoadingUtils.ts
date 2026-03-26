import { ElLoading } from "element-plus";

let loadingIdIndex = 1;
const loadingList: { loadingId: string; loadingText: string }[] = [];
let loadingInstance: ReturnType<typeof ElLoading.service> | null = null;

function createLoadingId() {
  loadingIdIndex += 1;
  return loadingIdIndex.toString();
}

export function loadingStart(loadingText?: string) {
  const loadingId = createLoadingId();
  loadingText ||= "加载中...";
  loadingList.push({ loadingId, loadingText });
  if (!loadingInstance) {
    loadingInstance = ElLoading.service({
      text: loadingText,
    });
  }
  updateLoadingText();

  let loadingEndOnce = () => {
    loadingEndOnce = () => {};
    loadingEnd(loadingId);
  };
  return () => loadingEndOnce();
}

function loadingEnd(loadingId: string) {
  const loadingIndex = loadingList.findIndex(
    (item) => item.loadingId === loadingId,
  );
  if (loadingIndex >= 0) {
    loadingList.splice(loadingIndex, 1);
  }
  if (loadingList.length === 0) {
    loadingInstance?.close();
    loadingInstance = null;
    return;
  }
  updateLoadingText();
}

function updateLoadingText() {
  const loadingText =
    loadingList[loadingList.length - 1]?.loadingText || "加载中...";
  loadingInstance?.setText(loadingText);
}
