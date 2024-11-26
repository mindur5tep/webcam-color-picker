import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import { Global, css } from "@emotion/react";
import styled from "@emotion/styled";
import { saveAs } from 'file-saver'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 1rem;
`;

const CaptureButton = styled.button`
  background-color: #0070f3;
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  font-weight: bold;
  margin-top: 1rem;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background-color: #005fd3;
  }
`;

const ColorPreview = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
  justify-items: center;
  margin-top: 1rem;
  width: 100%;
`;

const ColorBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0;
  animation: fadeIn 1s forwards;
  &:nth-of-type(1) {
    animation-delay: 0.2s;
  }
  &:nth-of-type(2) {
    animation-delay: 0.4s;
  }
  &:nth-of-type(3) {
    animation-delay: 0.6s;
  }
  &:nth-of-type(4) {
    animation-delay: 0.8s;
  }
  &:nth-of-type(5) {
    animation-delay: 1s;
  }
`;

const ColorCircle = styled.div`
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: ${({ color }) => color};
  margin-bottom: 0.5rem;
`;

const CopyButton = styled.button`
  background-color: transparent;
  border: none;
  color: #0070f3;
  cursor: pointer;
  font-size: 0.8rem;
  margin-left: 0.5rem;
  &:hover {
    text-decoration: underline;
  }
`;

const Notification = styled.div`
  position: fixed;
  top: 1rem;
  right: 1rem;
  background-color: ${({ success }) => (success ? "#4CAF50" : "#f44336")};
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  opacity: ${({ visible }) => (visible ? 1 : 0)};
  transition: opacity 0.3s;
`;

const GlobalStyle = css`
  body {
    margin: 0;
    font-family:
      -apple-system,
      BlinkMacSystemFont,
      Segoe UI,
      Roboto,
      Oxygen,
      Ubuntu,
      Cantarell,
      Fira Sans,
      Droid Sans,
      Helvetica Neue,
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  @keyframes fadeIn {
    0% {
      opacity: 0;
      transform: translateY(20px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const WebcamContainer = styled.div`
  position: relative;
  width: 100%;
  height: auto;
  max-width: 2000px; /* Limit the max width of webcam */
  margin: 0 auto;   /* Center the webcam container horizontally */
  display: flex;
  justify-content: center; /* Horizontally center the webcam */
`;

const Crosshair = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 10px;
  height: 10px;
  border: 2px solid red;  /* 2px红色边框 */
  background-color: transparent;  /* 可选，确保中间是透明的 */
  pointer-events: none;  /* 确保准星不会阻止用户交互 */
  z-index: 10;
`;

function rgbToCmyk(r, g, b) {
  const c = 1 - r / 255;
  const m = 1 - g / 255;
  const y = 1 - b / 255;

  const k = Math.min(c, Math.min(m, y));

  if (k < 1) {
    const c1 = (c - k) / (1 - k);
    const m1 = (m - k) / (1 - k);
    const y1 = (y - k) / (1 - k);
    return { c: c1, m: m1, y: y1, k };
  } else {
    return { c: 0, m: 0, y: 0, k: 1 };
  }
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  var max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  var h,
    s,
    l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
    if (h < 0) {
      h += 360;
    }
  }
  return { hue: h, saturation: s, lightness: l };
}

export default function Home() {
  const webcamRef = useRef(null);
  const [webcamWidth, setWebcamWidth] = useState(0);
  const [webcamHeight, setWebcamHeight] = useState(0);
  const [isClient, setIsClient] = useState(false);

  // 只在客户端执行
  useEffect(() => {
    if (typeof window !== "undefined") {
      // 标记为客户端
      setIsClient(true);
    }
  }, []);

  // 更新 Webcam 大小，确保响应式
  const updateWebcamSize = () => {
    const width = window.innerWidth * 0.9; // 设置宽度为视口宽度的 90%
    const height = width; // 16:9 的高宽比
    setWebcamWidth(width);
    setWebcamHeight(height);
  };

  // 监听窗口大小变化
  useEffect(() => {
    if (isClient) {
      updateWebcamSize(); // 初始化大小
      window.addEventListener("resize", updateWebcamSize); // 监听窗口变化
      return () => {
        window.removeEventListener("resize", updateWebcamSize); // 清理监听器
      };
    }
  }, [isClient]);



  const [hexColors, setHexColors] = useState([]);
  const [notification, setNotification] = useState({
    message: "",
    visible: false,
    success: true,
  });
  const [deviceId, setDeviceId] = React.useState({});
  const [devices, setDevices] = React.useState([]);
  const handleDevices = React.useCallback(
    (mediaDevices) =>
      setDevices(mediaDevices.filter(({ kind }) => kind === "videoinput")),
    [setDevices],
  );

  React.useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(handleDevices);
  }, [handleDevices]);

  const capture = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    const colors = await getColorsFromImage(imageSrc);
    setHexColors(colors);
  };

  const captureAndSave = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    
    // 创建一个 Blob 对象用于保存图像
    const blob = dataURItoBlob(imageSrc);

    // 使用 FileSaver.js 保存图像
    saveAs(blob, "captured-image.jpg");
  };

  // 将 dataURI 转换为 Blob
  const dataURItoBlob = (dataURI) => {
    const byteString = atob(dataURI.split(',')[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uintArray = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      uintArray[i] = byteString.charCodeAt(i);
    }
    return new Blob([uintArray], { type: 'image/jpeg' });
  };

  function copyToClipboard(text, successCallback, errorCallback) {
    navigator.clipboard.writeText(text).then(
      () => {
        successCallback();
      },
      (err) => {
        errorCallback(err);
      },
    );
  }

  function handleCopyClick(color) {
    const successCallback = () => {
      const message = `Color Picked`;
      setNotification({ message, visible: true, success: true });
      setTimeout(() => {
        setNotification({ message: "", visible: false });
      }, 2000);
    };

    const errorCallback = (err) => {
      console.error("Could not copy text: ", err);
      setNotification({
        message: "Copy failed",
        visible: true,
        success: false,
      });
      setTimeout(() => {
        setNotification({ message: "", visible: false });
      }, 2000);
    };
      
    const colorString = `
      HEX: ${color.hex}
      RGB: rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})
      HSL: hsl(${Math.round(color.hsl.hue)}, ${Math.round(color.hsl.saturation * 100)}%, ${Math.round(color.hsl.lightness * 100)}%)
    `;

      copyToClipboard(colorString, successCallback, errorCallback);
      saveColorToBackend(color);
  }

  return (
    <>
      <Global styles={GlobalStyle} />
      <Notification
        visible={notification.visible}
        success={notification.success}
      >
        {notification.message}
      </Notification>
      <Container>
        <div>
          {devices.map((device, key) => (
            <button
              key={device.deviceId}
              onClick={() => setDeviceId(device.deviceId)}
            >
              {device.label || `Device ${key + 1}`}
            </button>
          ))}
        </div>
        <WebcamContainer>
          <Webcam
            audio={false}
            ref={webcamRef}
            width={webcamWidth}
            height={webcamHeight}
            screenshotFormat="image/jpeg"
            videoConstraints={{ deviceId }}
          />
          <Crosshair />
        </WebcamContainer>
        <CaptureButton onClick={capture}>Capture</CaptureButton>
        <CaptureButton onClick={captureAndSave}>Save</CaptureButton>
        {hexColors.length > 0 && (
          <ColorPreview>
          {hexColors.map((color, index) => (
            <ColorBox key={index}>
              <ColorCircle color={color.hex} />
              <p>
                {color.hex}
              </p>
              <p>
                {`RGB(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`}
              </p>
              <p>
                {`HSL(${Math.round(color.hsl.hue)}, ${Math.round(color.hsl.saturation * 100)}%, ${Math.round(color.hsl.lightness * 100)}%)`}
              </p>
              <p>
                <CopyButton onClick={() => handleCopyClick(color)}>
                    Pick
                </CopyButton>
              </p>
            </ColorBox>
          ))}
        </ColorPreview>
        )}
      </Container>
    </>
  );
}

async function getColorsFromImage(imageSrc) {
  const img = new Image();
  img.src = imageSrc;
  await new Promise((resolve) => {
    img.onload = resolve;
  });

  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, img.width, img.height);

  const sampleSize = 10;
  const stepX = Math.floor(img.width / 6);
  const stepY = Math.floor(img.height / 6);

  const positions = [
    { x: stepX, y: stepY },
    { x: stepX * 2, y: stepY * 4 },
    { x: stepX * 4, y: stepY * 4 },
    { x: stepX * 5, y: stepY },
    { x: stepX * 3, y: stepY * 2 },
  ];

  const colors = await Promise.all(
    positions.map(async (pos) => getColorFromImageData(ctx, pos, sampleSize)),
  );


  // Get the center color
  const centerColor = await getCenterColor(ctx, img);

  // Insert the center color at the beginning of the array
  colors.unshift(centerColor);

  return colors;
}

async function getColorFromImageData(ctx, position, sampleSize) {
  const imageData = ctx.getImageData(
    position.x,
    position.y,
    sampleSize,
    sampleSize,
  ).data;

  let r = 0;
  let g = 0;
  let b = 0;
  const totalPixels = Math.floor(imageData.length / 4);

  for (let i = 0; i < imageData.length; i += 4) {
    r += imageData[i];
    g += imageData[i + 1];
    b += imageData[i + 2];
  }

  r = Math.floor(r / totalPixels);
  g = Math.floor(g / totalPixels);
  b = Math.floor(b / totalPixels);

  const hex = rgbToHex(r, g, b);
  const cmyk = rgbToCmyk(r, g, b);
  const hsl = rgbToHsl(r, g, b);

  return {
    hex: hex,
    rgb: { r, g, b },
    cmyk: { c: cmyk.c, m: cmyk.m, y: cmyk.y, k: cmyk.k },
    hsl: { hue: hsl.hue, saturation: hsl.saturation, lightness: hsl.lightness },
  };
}

async function getCenterColor(ctx, img) {
  const centerX = Math.floor(img.width / 2);
  const centerY = Math.floor(img.height / 2);
  const sampleSize = 10; // Same sample size as other positions

  return await getColorFromImageData(ctx, { x: centerX, y: centerY }, sampleSize);
}


function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

async function saveColorToBackend(color) {
  try {
    const response = await fetch('/api/colors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        hex: color.hex,
        rgb: color.rgb,
        hsl: color.hsl,
      }),
    });

    if (response.ok) {
      console.log('Color saved to backend');
    } else {
      console.error('Failed to save color to backend');
    }
  } catch (error) {
    console.error('Error while saving color to backend:', error);
  }
}