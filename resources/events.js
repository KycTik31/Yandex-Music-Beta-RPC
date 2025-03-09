"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendRefreshRepositoryMeta = exports.sendRefreshTracksAvailability = exports.sendAnalyticsOnFirstLaunch = exports.sendOpenDeeplink = exports.sendPlayerAction = exports.sendRefreshApplicationData = exports.sendUpdateAvailable = exports.sendLoadReleaseNotes = exports.sendProbabilityBucket = exports.handleApplicationEvents = void 0;
const electron_1 = require("electron");
const events_js_1 = require("./types/events.js");
const cookies_js_1 = require("./constants/cookies.js");
const Logger_js_1 = require("./packages/logger/Logger.js");
const updater_js_1 = require("./lib/updater.js");
const tray_js_1 = require("./lib/tray.js");
const appSuspension_js_1 = require("./lib/appSuspension.js");
const store_js_1 = require("./lib/store.js");
const state_js_1 = require("./lib/state.js");
const createWindow_js_1 = require("./lib/createWindow.js");
const handleDeeplink_js_1 = require("./lib/handlers/handleDeeplink.js");
const loadReleaseNotes_js_1 = require("./lib/loadReleaseNotes.js");
const deviceInfo_js_1 = require("./lib/deviceInfo.js");
const platform_js_1 = require("./types/platform.js");
const eventsLogger = new Logger_js_1.Logger('Events');
const isBoolean = (value) => {
    return typeof value === 'boolean';
};
const DiscordRPC = require('discord-rpc');
const clientId = '1040691530429628509';

const rpc = new DiscordRPC.Client({ transport: 'ipc' });

let toStart = true;
let isplaying = false;

async function setActivity(data, isPlaying) {
	if (!data.enabled) {rpc.clearActivity(); return};
	if (isPlaying) {
		rpc.setActivity({
			details: data.track_name,
			state: data.artist,
			endTimestamp: new Date().getTime() + (data.track_lenght - data.current_time),
			largeImageKey: data.track_img,
			buttons: [
				{ label: "Трек", url: data.track_link}
			]
		})
	} else {
		rpc.setActivity({
			details: data.track_name,
			state: data.artist,
			largeImageKey: data.track_img,
			buttons: [
				{ label: "Трек", url: data.track_link}
			]
		})
	}
}

rpc.login({ clientId: clientId }).catch(console.error);
const handleApplicationEvents = (window) => {
    const updater = (0, updater_js_1.getUpdater)();
    electron_1.ipcMain.on(events_js_1.Events.WINDOW_MINIMIZE, () => {
        eventsLogger.info('Event received', events_js_1.Events.WINDOW_MINIMIZE);
        window.minimize();
        (0, tray_js_1.updateTrayMenu)(window);
    });
    electron_1.ipcMain.on(events_js_1.Events.WINDOW_MAXIMIZE, () => {
        eventsLogger.info('Event received', events_js_1.Events.WINDOW_MAXIMIZE);
        if (window.isMaximized()) {
            window.unmaximize();
        }
        else {
            window.maximize();
        }
        (0, tray_js_1.updateTrayMenu)(window);
    });
    electron_1.ipcMain.on(events_js_1.Events.WINDOW_CLOSE, () => {
        eventsLogger.info('Event received', events_js_1.Events.WINDOW_CLOSE);
        if (platform_js_1.Platform.WINDOWS === deviceInfo_js_1.devicePlatform) {
            if (state_js_1.state.player.isPlaying) {
                (0, createWindow_js_1.toggleWindowVisibility)(window, false);
            }
            else {
                electron_1.app.quit();
            }
        }
        else {
            electron_1.app.quit();
        }
    });
    electron_1.ipcMain.on(events_js_1.Events.INSTALL_UPDATE, () => {
        eventsLogger.info('Event received', events_js_1.Events.INSTALL_UPDATE);
        updater.install();
    });
    electron_1.ipcMain.on(events_js_1.Events.APPLICATION_READY, async (event, language) => {
        eventsLogger.info('Event received', events_js_1.Events.APPLICATION_READY);
        (0, deviceInfo_js_1.logHardwareInfo)();
        if (state_js_1.state.deeplink) {
            (0, handleDeeplink_js_1.navigateToDeeplink)(window, state_js_1.state.deeplink);
        }
        if (updater.latestAvailableVersion) {
            (0, exports.sendUpdateAvailable)(window, updater.latestAvailableVersion);
        }
        if ((0, store_js_1.isFirstLaunch)()) {
            (0, exports.sendAnalyticsOnFirstLaunch)(window);
        }
        (0, exports.sendProbabilityBucket)(window, updater.getProbabilityBucket());
        const releaseNotes = await (0, loadReleaseNotes_js_1.loadReleaseNotes)(language);
        if (releaseNotes) {
            (0, exports.sendLoadReleaseNotes)(window, (0, store_js_1.needToShowReleaseNotes)(), releaseNotes);
        }
    });
    electron_1.ipcMain.on(events_js_1.Events.APPLICATION_THEME, (event, backgroundColor) => {
        eventsLogger.info('Event received', events_js_1.Events.APPLICATION_THEME);
        window.setBackgroundColor(backgroundColor);
    });
    electron_1.ipcMain.on(events_js_1.Events.TRACKS_AVAILABILITY_UPDATED, (event) => {
        const [, setTracksAvailabilityUpdatedAt] = store_js_1.tracksAvailabilityUpdatedAt;
        eventsLogger.info('Event received', events_js_1.Events.TRACKS_AVAILABILITY_UPDATED);
        setTracksAvailabilityUpdatedAt(Date.now());
    });
    electron_1.ipcMain.on(events_js_1.Events.REPOSITORY_META_UPDATED, (event) => {
        const [, setRepositoryMetaUpdatedAtStoreValue] = store_js_1.repositoryMetaUpdatedAt;
        eventsLogger.info('Event received', events_js_1.Events.REPOSITORY_META_UPDATED);
        setRepositoryMetaUpdatedAtStoreValue(Date.now());
    });
    electron_1.ipcMain.on(events_js_1.Events.PLAYER_STATE, (event, { isPlaying, canMoveBackward, canMoveForward }) => {
        eventsLogger.info(`Event received`, events_js_1.Events.PLAYER_STATE, isPlaying, canMoveBackward, canMoveForward);
        if (isBoolean(isPlaying)) {
            state_js_1.state.player.isPlaying = isPlaying;
            (0, appSuspension_js_1.toggleAppSuspension)(isPlaying);
        }
        if (isBoolean(canMoveBackward)) {
            state_js_1.state.player.canMoveBackward = canMoveBackward;
        }
        if (isBoolean(canMoveForward)) {
            state_js_1.state.player.canMoveForward = canMoveForward;
        }
        (0, tray_js_1.updateTrayMenu)(window);
		if (isBoolean(isPlaying)) isplaying = isPlaying
		if (!toStart) return
		toStart = false;
		setInterval(async () => {
			try {
				const data = await window.webContents.executeJavaScript("getData()");
				setActivity(data, isplaying);
			} catch (error) {
				console.error('Ошибка при выполнении getData():', error);
			}
		}, 15000);
    });
    electron_1.ipcMain.handle(events_js_1.Events.GET_PASSPORT_LOGIN, async () => {
        eventsLogger.info('Event handle', events_js_1.Events.GET_PASSPORT_LOGIN);
        try {
            const cookie = await electron_1.session.defaultSession.cookies.get({
                name: cookies_js_1.PASSPORT_LOGIN,
                domain: cookies_js_1.PASSPORT_LOGIN_DOMAIN
            });
            return cookie?.[0]?.value;
        }
        catch (error) {
            eventsLogger.error(`${events_js_1.Events.GET_PASSPORT_LOGIN} event failed.`, error);
            return;
        }
    });
};
exports.handleApplicationEvents = handleApplicationEvents;
const sendProbabilityBucket = (window, bucket) => {
    window.webContents.send(events_js_1.Events.PROBABILITY_BUCKET, bucket);
    eventsLogger.info('Event sent', events_js_1.Events.PROBABILITY_BUCKET, bucket);
};
exports.sendProbabilityBucket = sendProbabilityBucket;
const sendLoadReleaseNotes = (window, needToShowReleaseNotes, releaseNotes) => {
    window.webContents.send(events_js_1.Events.LOAD_RELEASE_NOTES, needToShowReleaseNotes, releaseNotes);
    eventsLogger.info('Event sent', events_js_1.Events.LOAD_RELEASE_NOTES);
};
exports.sendLoadReleaseNotes = sendLoadReleaseNotes;
const sendUpdateAvailable = (window, version) => {
    window.webContents.send(events_js_1.Events.UPDATE_AVAILABLE, version);
    eventsLogger.info('Event sent', events_js_1.Events.UPDATE_AVAILABLE, version);
};
exports.sendUpdateAvailable = sendUpdateAvailable;
const sendRefreshApplicationData = (window) => {
    window.webContents.send(events_js_1.Events.REFRESH_APPLICATION_DATA);
    eventsLogger.info('Event sent', events_js_1.Events.REFRESH_APPLICATION_DATA);
};
exports.sendRefreshApplicationData = sendRefreshApplicationData;
const sendPlayerAction = (window, action) => {
    window.webContents.send(events_js_1.Events.PLAYER_ACTION, action);
    eventsLogger.info('Event sent', events_js_1.Events.PLAYER_ACTION, action);
};
exports.sendPlayerAction = sendPlayerAction;
const sendOpenDeeplink = (window, pathname) => {
    window.webContents.send(events_js_1.Events.OPEN_DEEPLINK, pathname);
    eventsLogger.info('Event sent', events_js_1.Events.OPEN_DEEPLINK);
};
exports.sendOpenDeeplink = sendOpenDeeplink;
const sendAnalyticsOnFirstLaunch = (window) => {
    window.webContents.send(events_js_1.Events.FIRST_LAUNCH);
    eventsLogger.info('Event send', events_js_1.Events.FIRST_LAUNCH);
};
exports.sendAnalyticsOnFirstLaunch = sendAnalyticsOnFirstLaunch;
const sendRefreshTracksAvailability = (window) => {
    window.webContents.send(events_js_1.Events.REFRESH_TRACKS_AVAILABILITY);
    eventsLogger.info('Event sent', events_js_1.Events.REFRESH_TRACKS_AVAILABILITY);
};
exports.sendRefreshTracksAvailability = sendRefreshTracksAvailability;
const sendRefreshRepositoryMeta = (window) => {
    window.webContents.send(events_js_1.Events.REFRESH_REPOSITORY_META);
    eventsLogger.info('Event send', events_js_1.Events.REFRESH_REPOSITORY_META);
};
exports.sendRefreshRepositoryMeta = sendRefreshRepositoryMeta;
