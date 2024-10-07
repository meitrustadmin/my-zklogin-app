import {Capacitor} from '@capacitor/core';
import {RelayDict, Platform} from './types/index';


export const DEFAULT_RELAYS: any = {
    'wss://relay1.nostrchat.io': {read: true, write: false},
    'wss://relay2.nostrchat.io': {read: true, write: false},
    'wss://relay.damus.io': {read: true, write: false},
    'wss://relay.snort.social': {read: true, write: false},
    'wss://nos.lol': {read: true, write: false},
    'ws://68.183.185.57:8008': {read: true, write: true},
    //'ws://localhost:8008': {read: true, write: true},
};



export const MY_CHANNELS = [
    {id: 1, icon: "https://abs.twimg.com/sticky/default_profile_images/default_profile.png", name: "created channel", last_update_datetime: "11:00 AM", last_user: "user1", last_content: "this is latest message",unread_count: 5, subscribers: 100, contributors: 10, current_price: 50, category: 'created'},
    {id: 2, icon: "https://abs.twimg.com/sticky/default_profile_images/default_profile.png", name: "subscribed channel", last_update_datetime: "11:10 AM", last_user: "user2", last_content: "this is latest message",unread_count: 5, subscribers: 100, contributors: 10, current_price: 50, category: 'subscribed'},
    {id: 3, icon: "https://abs.twimg.com/sticky/default_profile_images/default_profile.png", name: "licensed channel", last_update_datetime: "11:49 AM", last_user: "user3", last_content: "this is latest message",unread_count: 5, subscribers: 100, contributors: 10, current_price: 50, category: 'licensed'}
]

export const MESSAGE_PER_PAGE = 30;
export const ACCEPTABLE_LESS_PAGE_MESSAGES = 5;
export const SCROLL_DETECT_THRESHOLD = 5;



// export const EXPLORED_CHANNELS = [
//     {id: '0x00', icon: "https://abs.twimg.com/sticky/default_profile_images/default_profile.png", name: "explored channel 11", last_update_datetime: new Date().toLocaleTimeString(), about:"explored channel 1", subscribers: 0, contributors: 1, current_price: 1, category: 'explored'},
//     {id: '0x01', icon: "https://abs.twimg.com/sticky/default_profile_images/default_profile.png", name: "explored channel 21", last_update_datetime: new Date().toLocaleTimeString(), about:"explored channel 1", subscribers: 0, contributors: 1, current_price: 1, category: 'explored'}
// ]

export const EXPLORED_CHANNELS = [
    {id: 'f412192fdc846952c75058e911d37a7392aa7fd2e727330f4344badc92fb8a22', icon: "https://abs.twimg.com/sticky/default_profile_images/default_profile.png", name: "Global Chat", last_update_datetime: new Date().toLocaleTimeString(), about:"Whatever you want it to be, just be nice", subscribers: 0, contributors: 0, current_price: 0, category: 'explored'},
]

export const PLATFORM = Capacitor.getPlatform() as Platform;

export const DEFAULT_THEME: any = 'light';

export const CKB_SHANOON = 100000000