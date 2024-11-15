import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import { Global, css } from "@emotion/react";
import styled from "@emotion/styled";

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
    font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
      Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
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
/*
function getVideoConstraints() {
  if (typeof window !== "undefined") {
    const idealWidth = Math.min(window.innerWidth, 640);
    const idealHeight = Math.min(window.innerHeight, 640);

    return {
      width: { ideal: idealWidth },
      height: { ideal: idealHeight },
      deviceID: { deviceID },
    };
  }
  return {};
}
*/
export default function Home() {
  const webcamRef = useRef(null);
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
    [setDevices]
  );

  React.useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(handleDevices);
  }, [handleDevices]);
  /*
  const [videoConstraints, setVideoConstraints] = useState(
    getVideoConstraints()
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleResize = () => {
        setVideoConstraints(getVideoConstraints());
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);
*/
  const capture = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    const colors = await getColorsFromImage(imageSrc);
    setHexColors(colors);
  };

  function copyToClipboard(text, successCallback, errorCallback) {
    navigator.clipboard.writeText(text).then(
      () => {
        successCallback();
      },
      (err) => {
        errorCallback(err);
      }
    );
  }

  function handleCopyClick(color, type) {
    const successCallback = () => {
      const message =
        type === "hex"
          ? "Hex code copied"
          : type === "rgb"
          ? "RGB code copied"
          : "CMYK code copied";
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

    if (type === "hex") {
      copyToClipboard(color.hex, successCallback, errorCallback);
    } else if (type === "rgb") {
      const rgbText = `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;
      copyToClipboard(rgbText, successCallback, errorCallback);
    } else if (type === "cmyk") {
      const cmykText = `cmyk(${color.cmyk.c.toFixed(2)}, ${color.cmyk.m.toFixed(
        2
      )}, ${color.cmyk.y.toFixed(2)}, ${color.cmyk.k.toFixed(2)})`;
      copyToClipboard(cmykText, successCallback, errorCallback);
    }
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
        <Webcam
          audio={false}
          height={720}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          width={1280}
          videoConstraints={{ deviceId }}
        />
        <CaptureButton onClick={capture}>Capture</CaptureButton>
        {hexColors.length > 0 && (
          <ColorPreview>
            {hexColors.map((color, index) => (
              <ColorBox key={index}>
                <ColorCircle color={color.hex} />
                <p>
                  {color.hex}
                  <CopyButton onClick={() => handleCopyClick(color, "hex")}>
                    Copy
                  </CopyButton>
                </p>
                <p>
                  {`RGB(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`}
                  <CopyButton onClick={() => handleCopyClick(color, "rgb")}>
                    Copy
                  </CopyButton>
                </p>
                <p>
                  {`CMYK(${color.cmyk.c.toFixed(2)}, ${color.cmyk.m.toFixed(
                    2
                  )}, ${color.cmyk.y.toFixed(2)}, ${color.cmyk.k.toFixed(2)})`}
                  <CopyButton onClick={() => handleCopyClick(color, "cmyk")}>
                    Copy
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
    positions.map(async (pos) => getColorFromImageData(ctx, pos, sampleSize))
  );

  return colors;
}

async function getColorFromImageData(ctx, position, sampleSize) {
  const imageData = ctx.getImageData(
    position.x,
    position.y,
    sampleSize,
    sampleSize
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

  return {
    hex: hex,
    rgb: { r, g, b },
    cmyk: { c: cmyk.c, m: cmyk.m, y: cmyk.y, k: cmyk.k },
  };
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(
    () => {
      console.log(`Copied: ${text}`);
    },
    (err) => {
      console.error("Could not copy text: ", err);
    }
  );
}

function handleCopyClick(color, type) {
  if (type === "hex") {
    copyToClipboard(color.hex);
  } else if (type === "rgb") {
    const rgbText = `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;
    copyToClipboard(rgbText);
  } else if (type === "cmyk") {
    const cmykText = `cmyk(${color.cmyk.c.toFixed(2)}, ${color.cmyk.m.toFixed(
      2
    )}, ${color.cmyk.y.toFixed(2)}, ${color.cmyk.k.toFixed(2)})`;
    copyToClipboard(cmykText);
  }
}

function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
