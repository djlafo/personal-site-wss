import { sendTo } from "../next-adapter.js";

interface TextEventData {
    time: number;
    text: string;
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
                console.log('[TextEvent] Text sent');
                completed.push(i);
            }).catch(e => {
                console.log(`[TextEvent] Error sending text: ${e}`);
            });
        }
    });
    events = events.filter((_, i) => !completed.includes(i));
}, 15000);

export async function handleTextEvent(ev: TextEvent) {
    if(ev.data.time < 0) {
        console.log(`[TextEvent] Negative time received (${ev.data.time})`);
        return;
    } else if(ev.data.time > MAX_TIME) {
        console.log(`[TextEvent] Time received is over max allowed time (${ev.data.time})`);
        return;
    }
    const adjusted = Date.now() + ev.data.time;
    console.log(`[TextEvent] Recipient (${ev.data.recipient}) scheduled for ${new Date(adjusted).toLocaleTimeString('en-US', {timeZone: 'America/Chicago'})} 
        message: ${ev.data.text}`);

    events.push({...ev.data, time: adjusted});
}