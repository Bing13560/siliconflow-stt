const videoIdPattern = /"video":{"play_addr":{"uri":"([a-z0-9]+)"/;
const descPattern = /"desc":"([^"]*)"/;
const cVUrl =
  "https://www.iesdouyin.com/aweme/v1/play/?video_id=%s&ratio=1080p&line=0";

async function doGet(url: string): Promise<Response> {
  const headers = new Headers();
  headers.set(
    "User-Agent",
    "Mozilla/5.0 (Linux; Android 11; SAMSUNG SM-G973U) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/14.2 Chrome/87.0.4280.141 Mobile Safari/537.36",
  );
  const resp = await fetch(url, { method: "GET", headers });
  return resp;
}

async function getVideoInfo(url: string): Promise<{ videoId: string; title: string }> {
  const resp = await doGet(url);
  const body = await resp.text();
  
  const videoIdMatch = videoIdPattern.exec(body);
  if (!videoIdMatch || !videoIdMatch[1]) throw new Error("Video ID not found in URL");
  const videoId = videoIdMatch[1];

  const titleMatch = descPattern.exec(body);
  const title = titleMatch ? titleMatch[1] : 'Douyin Video'; // Fallback title

  return { videoId, title };
}

async function getVideoUrl(url: string): Promise<{ directUrl: string; title: string }> {
  const { videoId, title } = await getVideoInfo(url);
  const downloadUrl = cVUrl.replace("%s", videoId);
  return { directUrl: downloadUrl, title };
}

//const url = "https://v.douyin.com/JyCk5gy";
//const downloadUrl = await getVideoUrl(url);
//console.log(downloadUrl);

export { getVideoUrl };