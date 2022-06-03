import { 
    OWWindow,
    OWGamesEvents,
    OWHotkeys,
    OWGames
} from "@overwolf/overwolf-api-ts";
import {kGamesFeatures, kWindowNames} from "../consts";

export class Overlay {
    private static _instance: Overlay;
    private _gameEventsListener: OWGamesEvents;
    private _window: OWWindow;
    private _textBox : HTMLElement;
    //private _activeChat : Chat;
    
    private constructor() {
        
        //Create a the overlay window
        this._window = new OWWindow(kWindowNames.chatOverlay);
        this._textBox = document.getElementById('TextBox');
        
        //make the overlay highlight when hovering it
        document.addEventListener('hover', function (e: any) {      
            if (e.target.id === 'TextBox') {
                e.target.style.backgroundColor = '#000000';
            }
        }, false);
        //Set Keybindings
        
    }

    public getChatPosition() {
        //return _activeChat.getPosition();
    }
    
    public UpdateChat(chat) {
        //_activeChat = chat;
        //this._window.setPosition(chat.getPosition());
    }
    
    
    public static instance() {
        if (!this._instance) {
            this._instance = new Overlay();
        }
        return this._instance;
    }

    public async run() {
        const gameClassId = await this.getCurrentGameClassId();

        const gameFeatures = kGamesFeatures.get(gameClassId);

        //Register the game events listener
        if (gameFeatures && gameFeatures.length) {
            this._gameEventsListener = new OWGamesEvents(
                {
                    onInfoUpdates: () => {},
                    onNewEvents: this.onMessageReceived.bind(this)
                },
                gameFeatures
            );

            this._gameEventsListener.start();
        }
        //Set the position of the window on top of the league chat
        //this.window.setPosition(getChatPosition());
    }

    // if a message is received 
    private onMessageReceived(e){
        
        switch(e.name){
            case "chat": 
                let message = e.data.message;
                this._textBox.innerHTML += message; // add the translation to the overlay 
                break;
            case "chat_moved":      
                // if the chat is moved by the user
                // update the overlay position
                //this._window.setPosition(_activeChat.getPosition());
                break;
        }
    }
    
    private async getCurrentGameClassId(): Promise<number | null> {
        const info = await OWGames.getRunningGameInfo();

        return (info && info.isRunning && info.classId) ? info.classId : null;
    }
}
Overlay.instance().run();