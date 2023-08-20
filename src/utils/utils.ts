export const base64ToImage = (base64: any, callback: (img: HTMLImageElement) => void) => {
  const img = new Image();
  img.onload = () => callback(img);
  img.src = base64;
};
