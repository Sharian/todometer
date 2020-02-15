const {
  app,
  BrowserWindow,
  Menu,
  dialog,
  powerMonitor,
  shell
} = require("electron");

const path = require("path");
const { version } = require("../package.json");
const isDev = require("electron-is-dev");

let mainWindow = {
  show: () => {
    console.log("show");
  }
}; // temp object while app loads
let willQuit = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    minWidth: 320,
    height: 600,
    fullscreenable: true,
    backgroundColor: "#403F4D",
    icon: path.join(__dirname, "assets/png/128x128.png"),
    webPreferences: {
      nodeIntegration: true
    }
  });

  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );
}

function menuSetup() {
  const menuTemplate = [
    {
      label: "todometer",
      submenu: [
        {
          label: "About",
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: "info",
              title: "About",
              message: "todometer is built by @cassidoo",
              detail:
                "You can find her on GitHub and Twitter as @cassidoo, or on her website cassidoo.co.",
              icon: path.join(__dirname, "assets/png/64x64.png")
            });
          }
        },
        {
          label: "Contribute (v" + version + ")",
          click: () => {
            shell.openExternal("https://github.com/cassidoo/todometer");
          }
        },
        {
          type: "separator"
        },
        {
          /* For debugging */
          label: "Dev tools",
          click: () => {
            mainWindow.webContents.openDevTools();
          }
        },
        {
          label: "Quit",
          accelerator: "CommandOrControl+Q",
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "delete" },
        { role: "selectall" }
      ]
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "togglefullscreen" },
        { role: "minimize" },
        { role: "close" }
      ]
    },
    {
      label: "Notifications",
      submenu: [
        {
          label: "Enable reset notification",
          type: "checkbox",
          checked: true,
          click: e => {
            mainWindow.showResetNotification = e.checked;
          }
        },
        {
          label: "Reminder notifications",
          submenu: [
            {
              label: "Never",
              type: "radio",
              click: e => {
                if (e.checked) {
                  mainWindow.resetNotification = "never";
                }
              }
            },
            {
              label: "Every 15 minutes",
              type: "radio",
              click: e => {
                if (e.checked) {
                  mainWindow.resetNotification = "quarterhour";
                }
              }
            },
            {
              label: "Every 30 minutes",
              type: "radio",
              click: e => {
                if (e.checked) {
                  mainWindow.resetNotification = "halfhour";
                }
              }
            },
            {
              label: "Every hour",
              type: "radio",
              checked: true,
              click: e => {
                if (e.checked) {
                  mainWindow.resetNotification = "hour";
                }
              }
            }
          ]
        }
      ]
    }
  ];
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
}

app.on("ready", () => {
  createWindow();
  menuSetup();

  powerMonitor.on("resume", () => {
    mainWindow.reload();
  });

  // On Mac, this will hide the window
  // On Windows, the app will close and quit
  mainWindow.on("close", e => {
    if (willQuit || process.platform === "win32") {
      mainWindow = null;
      app.quit();
    } else {
      e.preventDefault();
      mainWindow.hide();
    }
  });
});

app.on("activate", () => mainWindow.show());
app.on("before-quit", () => (willQuit = true));
