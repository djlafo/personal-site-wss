import { getFrom } from "../next-adapter.js";

export interface TextEventData {
    action: 'add' | 'remove' | 'list';
    texts: TextMessage[];
}

interface TextMessage { 
    time: number;
    text: string;
    recipient: string;
}
export interface TextEvent {
    event: 'text';
    data: TextEventData
}

export function pollTextAlerts() {
    setInterval(() => {
        getFrom('/api/sms/scheduled');
    }, 15000);
}

// let events: TextMessage[] = [];

// const MAX_TIME = 1000 * 60 * 60 * 24 * 7;

// setInterval(() => {
//     const completed: number[] = [];
//     const promises: Promise<void>[] = [];
//     events.forEach((e,i) => {
//         if(e.time < Date.now()) {
//             promises.push(sendTo('/api/sms/scheduled', e).then(r => {
//                 completed.push(i);
//                 const d = new Date(e.time);
//                 console.log(`[TextEvent] Delivered text (${e.recipient}) for ` +
//                     d.toLocaleDateString('en-US', {timeZone: 'America/Chicago'}) +
//                     ` ${d.toLocaleTimeString('en-US', {timeZone: 'America/Chicago'})}, ` +
//                     `message: ${e.text}`);
//             }).catch(e => {
//                 console.log(`[TextEvent] Error sending text: ${e}`);
//             }));
//         }
//     });
//     Promise.all(promises).then(() => {
//         events = events.filter((_, i) => !completed.includes(i));
//     })
// }, 15000);


// export async function handleTextEvent(ev: TextEvent): Promise<TextMessage[] | undefined> {
//     switch(ev.data.action) {
//         case 'add':
//             await addEvents(ev.data);
//             break;
//         case 'remove':
//             deleteEvent(ev.data);
//             break;
//         case 'list':
//             return listEvents(ev.data.texts[0].recipient);
//     }
// }

// async function addEvents(ev: TextEventData) {
//     ev.texts.forEach(txt => {
//         if(txt.time < 0) {
//             console.log(`[TextEvent] Negative time received (${txt.time})`);
//             return;
//         } else if(txt.time > MAX_TIME) {
//             console.log(`[TextEvent] Time received is over max allowed time (${txt.time})`);
//             return;
//         }
//         const adjusted = Date.now() + (txt.time*1000);
//         const d = new Date(adjusted);
//         console.log(`[TextEvent] Recipient (${txt.recipient}) scheduled for ` +
//             d.toLocaleDateString('en-US', {timeZone: 'America/Chicago'}) +
//             ` ${d.toLocaleTimeString('en-US', {timeZone: 'America/Chicago'})}, ` +
//             `message: ${txt.text}`);
    
//         events.push({...txt, time: adjusted});
//     });
// }

// function deleteEvent(ev: TextEventData) {
//     ev.texts.forEach(txt => {
//         const d = new Date(txt.time);
//         console.log(`[TextEvent] Received remove event for ${txt.recipient} ` +
//             `for ${d.toLocaleDateString('en-US', {timeZone: 'America/Chicago'})} ` +
//             d.toLocaleTimeString('en-US', {timeZone: 'America/Chicago'}));
//         events = events.filter(e => e.recipient !== txt.recipient || e.text !== txt.text || e.time !== txt.time);
//     })
// }

// function listEvents(phoneNumber: string): TextMessage[] {
//     console.log(`[TextEvent] Received list event`);
//     return events.filter(e => e.recipient === phoneNumber);
// }