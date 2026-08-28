import { useEffect, useState } from "react";
import "./InstallApp.css";

function InstallApp() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if FindParcel is already installed
    const checkInstalled = () => {
      const standalone =
        window.matchMedia(
          "(display-mode: standalone)"
        ).matches;

      const iosStandalone =
        window.navigator.standalone === true;

      setIsInstalled(
        standalone || iosStandalone
      );
    };

    checkInstalled();

    // Android / Chrome / Edge installation prompt
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();

      setInstallPrompt(event);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );

    window.addEventListener(
      "appinstalled",
      () => {
        setInstallPrompt(null);
        setIsInstalled(true);
      }
    );

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) {
      return;
    }

    installPrompt.prompt();

    const { outcome } =
      await installPrompt.userChoice;

    console.log(
      "FindParcel installation:",
      outcome
    );

    setInstallPrompt(null);
  };

  // Don't show the button if already installed
  if (isInstalled) {
    return null;
  }

  // Browser doesn't currently support
  // the installation prompt
  if (!installPrompt) {
    return null;
  }

  return (
    <button
      type="button"
      className="install-app-button"
      onClick={handleInstall}
    >
      📲 Install FindParcel
    </button>
  );
}

export default InstallApp;