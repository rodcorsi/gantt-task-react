export default function measureTextWidth(fontSize: string, fontFamily: string) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) {
    return (text: string) => text.length;
  }
  context.font = fontSize + " " + fontFamily;
  return (text: string) => context.measureText(text).width;
}
