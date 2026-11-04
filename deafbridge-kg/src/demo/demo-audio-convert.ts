/** お試しページ用：録音がないので変換もしない */
export async function blobToWav16k(blob: Blob): Promise<Blob> {
  return blob;
}
