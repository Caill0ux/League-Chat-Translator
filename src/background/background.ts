import {
  OWGames,
  OWGameListener,
  OWWindow
} from '@overwolf/overwolf-api-ts';

import { kWindowNames, kGameClassIds } from "../consts";
import { Overlay } from '../chat_overlay/chat_overlay';
import RunningGameInfo = overwolf.games.RunningGameInfo;
import AppLaunchTriggeredEvent = overwolf.extensions.AppLaunchTriggeredEvent;

// The background controller holds all of the app's background logic - hence its name. it has
// many possible use cases, for example sharing data between windows, or, in our case,
// managing which window is currently presented to the user. To that end, it holds a dictionary
// of the windows available in the app.
// Our background controller implements the Singleton design pattern, since only one
// instance of it should exist.
class BackgroundController {
  private static _instance: BackgroundController;
  private _windows: Record<string, OWWindow> = {};
  private _gameListener: OWGameListener;

  private constructor() {
    // Populating the background controller's window dictionary
    this._windows[kWindowNames.desktop] = new OWWindow(kWindowNames.desktop);
    this._windows[kWindowNames.chatOverlay] = new OWWindow(kWindowNames.chatOverlay);

    // When a supported game is started or is ended, toggle the app's windows
    this._gameListener = new OWGameListener({
      onGameStarted: ()=> {this._windows[kWindowNames.chatOverlay].restore()},
      onGameEnded: ()=> {this._windows[kWindowNames.chatOverlay].close()}
      //onGameChatFound: this.onChatFound.bind(this)
    });
  };

  // Implementing the Singleton design pattern
  public static instance(): BackgroundController {
    if (!BackgroundController._instance) {
      BackgroundController._instance = new BackgroundController();
    }

    return BackgroundController._instance;
  }

  // When running the app, start listening to games' status and decide which window should
  // be launched first, based on whether a supported game is currently running
  public async run() {
    this._gameListener.start();

    const currWindowName = (await this.isSupportedGameRunning())
      ? kWindowNames.inGame
      : kWindowNames.desktop;

    this._windows[currWindowName].restore();
  }

  private onChatFound(info) {
    //Check if we really got a chat 
    if(!info || info.chatId === 'null'){
      //If not, close the chat overlay
      this._windows[kWindowNames.chatOverlay].close();
      return;
    }
    console.log('ChatFound', info.chatId); // >> ChatFound 'InGame' or >> ChatFound 'Lobby' >> ChatFound 'null'
    //If we do, open the chat overlay
    this._windows[kWindowNames.chatOverlay].restore();
    //Pass the chat to the overlay instance so it can position itself
    Overlay.instance().UpdateChat(info.chat);
  }

  private async isSupportedGameRunning(): Promise<boolean> {
    const info = await OWGames.getRunningGameInfo();

    return info && info.isRunning && this.isSupportedGame(info);
  }

  // Identify whether the RunningGameInfo object we have references a supported game
  private isSupportedGame(info: RunningGameInfo) {
    return kGameClassIds.includes(info.classId);
  }
}

BackgroundController.instance().run();
