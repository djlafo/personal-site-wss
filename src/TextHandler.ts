import { sendTo } from "../next-adapter.js";

interface TextEventData {
    action: 'add' | 'remove' | 'list'
    time?: number;
    text?: string;
    recipient: string;
}
export interface TextEvent {
    event: 'text';
    data: TextEventData
}
let events: TextEventData[] = [];

const MAX_TIME = 1000 * 60 * 60 * 24 * 7;

setInterval(() => {
    const completed: number[] = [];
    events.forEach((e,i) => {
        if(e.time < Date.now()) {
            sendTo('/api/sms/scheduled', e).then(r => {
                completed.push(i);
            }).catch(e => {
                console.log(`[TextEvent] Error sending text: ${e}`);
            });
        }
    });
    events = events.filter((_, i) => !completed.includes(i));
}, 15000);

export async function handleTextEvent(ev: TextEvent): Promise<TextEventData[] | undefined> {
    switch(ev.data.action) {
        case 'add':
            await addEvent(ev.data);
            break;
        case 'remove':
            deleteEvent(ev.data);
            break;
        case 'list':
            return listEvents(ev.data.recipient);
    }
}

async function addEvent(ev: TextEventData) {
    if(ev.time < 0) {
        console.log(`[TextEvent] Negative time received (${ev.time})`);
        return;
    } else if(ev.time > MAX_TIME) {
        console.log(`[TextEvent] Time received is over max allowed time (${ev.time})`);
        return;
    }
    const adjusted = Date.now() + (ev.time*1000);
    const d = new Date(adjusted);
    console.log(`[TextEvent] Recipient (${ev.recipient}) scheduled for ` +
        new Date(adjusted).toLocaleDateString('en-US', {timeZone: 'America/Chicago'}) +
        ` ${d.toLocaleTimeString('en-US', {timeZone: 'America/Chicago'})}, ` +
        `message: ${ev.text}`);

    events.push({...ev, time: adjusted});
}

function deleteEvent(ev: TextEventData) {
    const d = new Date(ev.time);
    console.log(`[TextEvent] Received remove event for ${ev.recipient} ` +
        `for ${d.toLocaleDateString('en-US', {timeZone: 'America/Chicago'})} ` +
        d.toLocaleTimeString('en-US', {timeZone: 'America/Chicago'}));
    events = events.filter(e => e.recipient !== ev.recipient || e.text !== ev.text || e.time !== ev.time);
}

function listEvents(phoneNumber: string): TextEventData[] {
    console.log(`[TextEvent] Received list event`);
    return events.filter(e => e.recipient === phoneNumber);
}