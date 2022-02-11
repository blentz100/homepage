import { useRef, useEffect, useState, memo } from "react";
import { useRouter } from "next/router";
import RFB from "@novnc/novnc/core/rfb.js";
import Terminal from "../Terminal/Terminal";

import styles from "./VNC.module.css";

type VNCProps = {
  server: string;
};

const VNC = ({ server }: VNCProps) => {
  const router = useRouter();

  // we definitely do NOT want this page to connect more than once!
  const [loaded, setLoaded] = useState(false);

  // DOS-style box for text
  const terminalRef = useRef<HTMLSpanElement>(null);

  // the actual connection and virtual screen (injected by noVNC when it's ready)
  const rfbRef = useRef(null);
  const screenRef = useRef<HTMLDivElement>(null);

  // makes the console reappear with the given message if there's an error loading, or if the VM has gone poof for
  // whatever reason (doesn't really matter).
  const showTerminalMessage = ({ message, anyKey = false }) => {
    try {
      screenRef.current.style.display = "none";
      terminalRef.current.parentElement.style.display = null;
      terminalRef.current.textContent = `${message}${
        anyKey ? "\n\nPress the Any key or refresh the page to continue." : ""
      }`;
    } catch (e) {} // eslint-disable-line no-empty
  };

  // hides the console and show the screen when VM connects
  const showScreen = () => {
    terminalRef.current.parentElement.style.display = "none";
    screenRef.current.style.display = null;
  };

  // ends the session forcefully
  const disconnectVM = () => {
    try {
      rfbRef.current.disconnect();
    } catch (e) {} // eslint-disable-line no-empty
  };

  // prepare for possible navigation away from this page, and disconnect if/when it happens
  useEffect(() => {
    router.events.on("routeChangeStart", disconnectVM);

    return () => {
      // unassign event listener
      router.events.off("routeChangeStart", disconnectVM);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (loaded) {
      // don't do any of this more than once, the backend is pretty fragile
      return;
    } else {
      // show loading indicator and continue
      showTerminalMessage({ message: "Spinning up your very own personal computer, please wait!" });
    }

    if (!window.WebSocket) {
      // browser doesn't support websockets
      showTerminalMessage({ message: "WebSockets must be enabled to begin!", anyKey: true });
      return;
    }

    // https://github.com/novnc/noVNC/blob/master/docs/API.md
    rfbRef.current = new RFB(screenRef.current, server, {
      wsProtocols: ["binary", "base64"],
    });

    // scale screen to make it kinda "responsive"
    rfbRef.current.scaleViewport = true;

    // VM connected
    rfbRef.current.addEventListener("connect", () => {
      console.log("successfully connected to VM socket!");

      // finally hide the terminal and show the VNC canvas
      showScreen();

      // this is the one and only time we're spinning up a VM (hopefully)
      setLoaded(true);
    });

    // VM disconnected (on either end)
    rfbRef.current.addEventListener("disconnect", (detail: unknown) => {
      console.warn("VM ended session remotely:", detail);

      showTerminalMessage({
        message: "Oh dear, it looks like something's gone very wrong. Sorry about that.",
        anyKey: true,
      });
    });
  }, [loaded, server]);

  return (
    <>
      <Terminal ref={terminalRef} className={styles.terminal} />

      {/* the VNC canvas is hidden until we've successfully connected to the socket */}
      <div ref={screenRef} className={styles.display} style={{ display: "none" }} />
    </>
  );
};

export default memo(VNC);